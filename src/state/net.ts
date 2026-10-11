import { io, type Socket } from 'socket.io-client';
import type { NetPlayer } from '../types';
import { loadIdentity, loadLocalSave, writeIdentity } from '../lib/storage';

/**
 * Couche temps reel : presence en ligne, amis, salons, duels.
 * La connexion passe par la meme origine que le site (proxy /socket.io),
 * ce qui fonctionne aussi derriere un proxy https de preview.
 */

export type NetStatus = 'offline' | 'connecting' | 'online';

interface NetState {
  status: NetStatus;
  count: number;
  list: NetPlayer[];
  lastError: string | null;
  attempts: number;
}

let socket: Socket | null = null;
let state: NetState = { status: 'offline', count: 0, list: [], lastError: null, attempts: 0 };
const listeners = new Set<() => void>();
const handlers = new Map<string, Set<(payload: any) => void>>();

const emitChange = () => listeners.forEach((l) => l());

const setState = (patch: Partial<NetState>) => {
  state = { ...state, ...patch };
  emitChange();
};

export const subscribeNet = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const getNetState = () => state;

export const onNet = <T,>(event: string, cb: (payload: T) => void) => {
  if (!handlers.has(event)) handlers.set(event, new Set());
  handlers.get(event)!.add(cb as (p: any) => void);
  return () => handlers.get(event)?.delete(cb as (p: any) => void);
};

const dispatch = (event: string, payload: unknown) => {
  handlers.get(event)?.forEach((h) => {
    try {
      h(payload);
    } catch (e) {
      console.warn('[net] handler error', event, e);
    }
  });
};

export const netEmit = (event: string, payload?: unknown) => {
  if (!socket || !socket.connected) return false;
  socket.emit(event, payload);
  return true;
};

export const isConnected = () => !!socket?.connected;

export function connectNet(): Socket | null {
  if (socket) return socket;
  const identity = loadIdentity();
  setState({ status: 'connecting' });
  socket = io({
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 6,
    reconnectionDelay: 1200,
    timeout: 6000
  });

  socket.on('connect', () => {
    const save = loadLocalSave();
    const me = loadIdentity();
    const payload = {
      identity: {
        ...identity,
        id: me.id,
        name: save?.profile.name || me.name,
        avatar: save?.profile.avatar || me.avatar,
        grade: save?.profile.grade || me.grade,
        elo: save?.profile.elo ?? me.elo,
        ryos: save?.profile.ryos ?? me.ryos,
        streak: save?.streak.days ?? 1
      }
    };
    socket?.emit('hello', payload);
    socket?.emit('presence:update', {
      name: save?.profile.name,
      avatar: save?.profile.avatar,
      elo: save?.profile.elo,
      ryos: save?.profile.ryos,
      grade: save?.profile.grade
    });
    setState({ status: 'online', lastError: null, attempts: 0 });
    dispatch('net:connected', true);
  });

  socket.on('hello:ok', (payload: any) => {
    if (payload?.player) {
      const local = loadIdentity();
      writeIdentity({ ...local, ...payload.player });
    }
    dispatch('hello:ok', payload);
  });

  socket.on('disconnect', () => {
    setState({ status: 'offline' });
    dispatch('net:connected', false);
  });

  socket.on('connect_error', (err: Error) => {
    const attempts = state.attempts + 1;
    setState({ attempts, lastError: err?.message || 'connexion impossible' });
    if (attempts >= 4) {
      setState({ status: 'offline' });
      socket?.close();
      socket = null;
    }
  });

  socket.on('presence:list', (payload: { count: number; list: NetPlayer[] }) => {
    setState({ count: payload?.count ?? 0, list: Array.isArray(payload?.list) ? payload.list : [] });
  });

  socket.on('toast', (payload: { message: string }) => dispatch('toast', payload));
  socket.on('friends:requested', (payload: any) => dispatch('friends:requested', payload));
  socket.on('friends:accepted', (payload: any) => dispatch('friends:accepted', payload));
  socket.on('friends:list', (payload: any) => dispatch('friends:list', payload));
  socket.on('chat:message', (payload: any) => dispatch('chat:message', payload));
  socket.on('rooms:list', (payload: any) => dispatch('rooms:list', payload));
  socket.on('room:created', (payload: any) => dispatch('room:created', payload));
  socket.on('room:joined', (payload: any) => dispatch('room:joined', payload));
  socket.on('room:lobby', (payload: any) => dispatch('room:lobby', payload));
  socket.on('room:state', (payload: any) => dispatch('room:state', payload));
  socket.on('room:spectate', (payload: any) => dispatch('room:spectate', payload));
  socket.on('room:started', (payload: any) => dispatch('room:started', payload));
  socket.on('room:closed', (payload: any) => dispatch('room:closed', payload));
  socket.on('room:chat', (payload: any) => dispatch('room:chat', payload));
  socket.on('duel:invited', (payload: any) => dispatch('duel:invited', payload));
  socket.on('duel:ready', (payload: any) => dispatch('duel:ready', payload));
  socket.on('duel:waiting', (payload: any) => dispatch('duel:waiting', payload));

  return socket;
}

export function disconnectNet() {
  socket?.close();
  socket = null;
  setState({ status: 'offline', list: [], count: 0 });
}
