import type { CustomGame, Profile } from '../types';
import { SEED_GAMES, SEED_USERS } from '../../shared/seedData.js';

/**
 * Couche d'acces au serveur en ligne.
 * Si l'API n'est pas joignable (site publie en statique), on retombe
 * automatiquement sur des donnees locales pour que tout reste jouable.
 */

const BASE = '/api';
let serverOnline = false;
const listeners = new Set<(online: boolean) => void>();

export const isServerOnline = () => serverOnline;
export const onServerStatus = (cb: (online: boolean) => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const setOnline = (value: boolean) => {
  if (serverOnline === value) return;
  serverOnline = value;
  listeners.forEach((l) => l(value));
};

async function request<T>(path: string, init?: RequestInit & { timeout?: number }): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), init?.timeout ?? 6000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
    });
    clearTimeout(timer);
    if (!res.ok) {
      setOnline(true);
      const body = await res.json().catch(() => ({}));
      return { ok: false, status: res.status, ...body } as unknown as T;
    }
    setOnline(true);
    return (await res.json()) as T;
  } catch {
    clearTimeout(timer);
    setOnline(false);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export interface PublicUserRow {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  elo: number;
  ryos: number;
  streak: number;
  rank?: number;
  online?: boolean;
}

export const api = {
  async health(): Promise<boolean> {
    const r = await request<{ ok: boolean }>('/health', { timeout: 4000 });
    return !!r && (r as any).ok === true;
  },

  async stats(): Promise<{ online: number; players: number; games: number; matches: number } | null> {
    return request('/stats');
  },

  async syncUser(identity: Partial<Profile> & { id: string; name: string }) {
    return request('/users/sync', { method: 'POST', body: JSON.stringify({ identity }) });
  },

  async leaderboard(metric: 'ryos' | 'elo' | 'streak' | 'wins' = 'ryos', limit = 50): Promise<PublicUserRow[]> {
    const r = await request<{ list: PublicUserRow[] }>(`/leaderboard?metric=${metric}&limit=${limit}`);
    if (r && Array.isArray((r as any).list)) return (r as any).list;
    const fallback = SEED_USERS.map((u, i) => ({
      id: `seed_${i + 1}`,
      name: u.name,
      avatar: u.avatar,
      grade: u.grade,
      elo: metric === 'elo' ? u.elo : u.elo,
      ryos: u.ryos,
      streak: u.streak,
      wins: Math.round(u.elo / 40),
      online: false
    }))
      .sort((a, b) => (b as any)[metric] - (a as any)[metric])
      .map((u, i) => ({ ...u, rank: i + 1 }));
    return fallback as PublicUserRow[];
  },

  async searchUsers(q: string): Promise<PublicUserRow[]> {
    if (q.trim().length < 2) return [];
    const r = await request<{ list: PublicUserRow[] }>(`/users?q=${encodeURIComponent(q)}`);
    if (r && Array.isArray((r as any).list) && (r as any).list.length) return (r as any).list;
    const needle = q.trim().toLowerCase();
    return SEED_USERS.map((u, i) => ({
      id: `seed_${i + 1}`,
      name: u.name,
      avatar: u.avatar,
      grade: u.grade,
      elo: u.elo,
      ryos: u.ryos,
      streak: u.streak,
      online: false
    })).filter((u) => u.name.toLowerCase().includes(needle));
  },

  async listGames(q = '', author = ''): Promise<CustomGame[]> {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (author) params.set('author', author);
    const r = await request<{ list: CustomGame[] }>(`/games?${params.toString()}`);
    if (r && Array.isArray((r as any).list)) return (r as any).list;
    let list = [...SEED_GAMES];
    if (q) list = list.filter((g) => `${g.title} ${g.subject} ${g.authorName}`.toLowerCase().includes(q.toLowerCase()));
    if (author) list = list.filter((g) => g.authorId === author);
    return list.sort((a, b) => b.plays - a.plays);
  },

  async publishGame(game: Partial<CustomGame>, author: { id: string; name: string; ryos: number }) {
    const r = await request<{ ok?: boolean; game?: CustomGame; error?: string }>('/games', {
      method: 'POST',
      body: JSON.stringify({ game, author })
    });
    if (r && (r as any).error) return { ok: false, error: (r as any).error as string };
    if (r && (r as any).game) return { ok: true, game: (r as any).game as CustomGame };
    // Hors ligne : on publie localement.
    const local: CustomGame = {
      id: `local_${Date.now().toString(36)}`,
      title: game.title || 'Mon jeu',
      subject: game.subject || 'maths',
      grades: game.grades || ['CE2'],
      difficulty: game.difficulty || 'moyen',
      questions: (game.questions || []).slice(0, 40),
      authorId: author.id,
      authorName: author.name,
      createdAt: Date.now(),
      plays: 0,
      likes: 0
    };
    return { ok: true, game: local, offline: true as const };
  },

  async likeGame(id: string) {
    return request(`/games/${id}/like`, { method: 'POST' });
  },

  async playGame(id: string) {
    return request(`/games/${id}/play`, { method: 'POST' });
  },

  async postMatch(type: string, players: unknown, detail: unknown) {
    return request('/matches', { method: 'POST', body: JSON.stringify({ type, players, detail }) });
  },

  async friends(id: string) {
    const r = await request<{ friends: PublicUserRow[]; incoming: { id: string; name: string; avatar?: string }[]; ids: string[] }>(
      `/friends/${id}`
    );
    if (r && (r as any).friends) return r as NonNullable<typeof r>;
    return null;
  },

  async requestFriend(from: string, to: string) {
    return request<{ ok?: boolean }>('/friends/request', { method: 'POST', body: JSON.stringify({ from, to }) });
  },

  async acceptFriend(from: string, to: string) {
    return request<{ ok?: boolean }>('/friends/accept', { method: 'POST', body: JSON.stringify({ from, to }) });
  },

  async removeFriend(from: string, to: string) {
    return request<{ ok?: boolean }>('/friends/remove', { method: 'POST', body: JSON.stringify({ from, to }) });
  }
};

export const seedGames = SEED_GAMES;
