import type { SaveState, Stats } from '../types';
import { AVATARS } from '../data/grades';
import { todayKey } from './format';

export const SAVE_KEY = 'academie-ninja:save:v1';
export const IDENTITY_KEY = 'academie-ninja:identity:v1';
export const SAVE_VERSION = 3;

export const defaultStats = (): Stats => ({
  questionsAnswered: 0,
  correctAnswers: 0,
  quizzesPlayed: 0,
  perfectQuizzes: 0,
  examsTaken: 0,
  bestExam: 0,
  duelsPlayed: 0,
  duelsWon: 0,
  partyPlayed: 0,
  partyWon: 0,
  kahootPlayed: 0,
  kahootWon: 0,
  boardWins: 0,
  teamWins: 0,
  batailleWins: 0,
  memoryWins: 0,
  eclairPerfect: 0,
  subjectQuizzes: {},
  slotSpins: 0,
  jackpots: 0,
  bestRun: 0,
  subjectsPlayed: [],
  friendsAdded: 0,
  gamesPublished: 0,
  gamesPlayedFromOthers: 0,
  ryosEarnedTotal: 0,
  daysPlayed: 0
});

export const newPlayerId = (): string =>
  `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const defaultSave = (name = 'Ninja', avatar = AVATARS[0]): SaveState => ({
  version: SAVE_VERSION,
  profile: {
    id: newPlayerId(),
    name,
    avatar,
    grade: 'CE2',
    difficulty: 'moyen',
    ryos: 0,
    elo: 1000,
    createdAt: Date.now(),
    favoriteSubject: 'maths'
  },
  stats: defaultStats(),
  badges: [],
  history: [],
  daily: { date: todayKey(), progress: {}, claimed: [] },
  streak: { days: 1, best: 1, last: todayKey() },
  shop: { avatars: [], themes: ['konoha'], theme: 'konoha' },
  customGames: [],
  friends: { ids: [], incoming: [], outgoing: [] },
  settings: { sound: true, timer: true, showExplanations: true, answerMode: 'qcm' },
  seenRanks: []
});

/** Fusionne un objet partiel (ancien format ou donnees serveur) avec les defauts. */
export const migrate = (raw: unknown, fallbackName = 'Ninja'): SaveState => {
  const base = defaultSave(fallbackName);
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, any>;
  return {
    version: SAVE_VERSION,
    profile: { ...base.profile, ...(r.profile || {}), id: r.profile?.id || base.profile.id },
    stats: { ...base.stats, ...(r.stats || {}) },
    badges: Array.isArray(r.badges) ? r.badges : [],
    history: Array.isArray(r.history) ? r.history.slice(0, 80) : [],
    daily: { ...base.daily, ...(r.daily || {}) },
    streak: { ...base.streak, ...(r.streak || {}) },
    shop: { ...base.shop, ...(r.shop || {}) },
    customGames: Array.isArray(r.customGames) ? r.customGames : [],
    friends: { ...base.friends, ...(r.friends || {}) },
    settings: { ...base.settings, ...(r.settings || {}) },
    seenRanks: Array.isArray(r.seenRanks) ? r.seenRanks : []
  };
};

export const loadLocalSave = (): SaveState | null => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const writeLocalSave = (state: SaveState): void => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* quota depasse : on ignore */
  }
};

export const clearLocalSave = (): void => {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
};

/** Identite minimale, partagee avec le module reseau (amis, salons, classement). */
export interface Identity {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  elo: number;
  ryos: number;
}

export const loadIdentity = (): Identity => {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (raw) return JSON.parse(raw) as Identity;
  } catch {
    /* ignore */
  }
  const save = loadLocalSave();
  const id = save?.profile.id || newPlayerId();
  const identity: Identity = {
    id,
    name: save?.profile.name || 'Ninja',
    avatar: save?.profile.avatar || AVATARS[0],
    grade: save?.profile.grade || 'CE2',
    elo: save?.profile.elo ?? 1000,
    ryos: save?.profile.ryos ?? 0
  };
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    /* ignore */
  }
  return identity;
};

export const writeIdentity = (identity: Identity): void => {
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    /* ignore */
  }
};

/** Fusion de deux sauvegardes (locale + en ligne) : la plus avancee gagne, sans perte. */
export const mergeSaves = (a: SaveState, b: SaveState): SaveState => {
  const newer = a.profile.createdAt <= b.profile.createdAt ? a : b;
  const other = newer === a ? b : a;
  const maxNum = (x: number, y: number) => Math.max(x || 0, y || 0);

  const stats: Stats = { ...defaultStats() };
  (Object.keys(stats) as (keyof Stats)[]).forEach((k) => {
    const va = a.stats[k];
    const vb = b.stats[k];
    if (typeof va === 'number' || typeof vb === 'number') {
      (stats[k] as number) = maxNum(va as number, vb as number);
    } else if (Array.isArray(va) || Array.isArray(vb)) {
      (stats[k] as unknown) = Array.from(new Set([...(va as string[]) || [], ...(vb as string[]) || []]));
    } else if (va && vb && typeof va === 'object' && typeof vb === 'object') {
      // Compteurs par matiere (ex : { maths: 4 }) : on garde le max de chaque cle.
      const merged: Record<string, number> = { ...(va as Record<string, number>) };
      Object.entries(vb as Record<string, number>).forEach(([key, val]) => {
        merged[key] = Math.max(merged[key] || 0, val || 0);
      });
      (stats[k] as unknown) = merged;
    }
  });

  const history = [...a.history, ...b.history]
    .filter((h, i, arr) => arr.findIndex((x) => x.id === h.id) === i)
    .sort((x, y) => y.at - x.at)
    .slice(0, 80);

  const games = [...a.customGames, ...b.customGames].filter(
    (g, i, arr) => arr.findIndex((x) => x.id === g.id) === i
  );

  return {
    version: SAVE_VERSION,
    profile: {
      ...newer.profile,
      ryos: Math.max(a.profile.ryos, b.profile.ryos),
      elo: newer.profile.elo || other.profile.elo,
      name: newer.profile.name,
      avatar: newer.profile.avatar,
      grade: newer.profile.grade,
      difficulty: newer.profile.difficulty
    },
    stats,
    badges: Array.from(new Set([...a.badges, ...b.badges])),
    history,
    daily: a.daily.date === b.daily.date ? a.daily : { ...newer.daily },
    streak: { days: Math.max(a.streak.days, b.streak.days), best: Math.max(a.streak.best, b.streak.best), last: newer.streak.last },
    shop: {
      avatars: Array.from(new Set([...a.shop.avatars, ...b.shop.avatars])),
      themes: Array.from(new Set([...a.shop.themes, ...b.shop.themes])),
      theme: newer.shop.theme
    },
    customGames: games,
    friends: {
      ids: Array.from(new Set([...a.friends.ids, ...b.friends.ids])),
      incoming: [...a.friends.incoming, ...b.friends.incoming].filter(
        (f, i, arr) => arr.findIndex((x) => x.from === f.from) === i
      ),
      outgoing: Array.from(new Set([...a.friends.outgoing, ...b.friends.outgoing]))
    },
    settings: newer.settings,
    seenRanks: Array.from(new Set([...a.seenRanks, ...b.seenRanks]))
  };
};
