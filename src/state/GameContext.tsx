import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from 'react';
import type { CustomGame, GameType, GradeId, Profile, SaveState, Settings, SubjectId } from '../types';
import { BADGES } from '../data/badges';
import { challengeById, dailySelection } from '../data/challenges';
import { rankFromRyos, rankBonus } from '../data/ranks';
import { api } from '../lib/api';
import { daysBetween, todayKey } from '../lib/format';
import { sfx, setSoundEnabled } from '../lib/sound';
import {
  clearLocalSave,
  defaultSave,
  loadLocalSave,
  writeIdentity,
  writeLocalSave
} from '../lib/storage';
import { connectNet, getNetState, netEmit, onNet, subscribeNet } from './net';
import type { NetPlayer } from '../types';

export interface Toast {
  id: string;
  message: string;
  kind: 'info' | 'success' | 'error' | 'reward' | 'badge';
  icon?: string;
}

export interface GameRecord {
  type: GameType;
  label: string;
  subject?: SubjectId;
  correct: number;
  total: number;
  baseRyos?: number;
  eloDelta?: number;
  opponent?: string;
  perfect?: boolean;
  exam?: boolean;
  party?: boolean;
  kahoot?: boolean;
  duelWon?: boolean;
  boardWin?: boolean;
  fromCommunity?: boolean;
  played?: boolean;
}

interface Ctx {
  save: SaveState;
  profile: Profile;
  toasts: Toast[];
  netStatus: 'offline' | 'connecting' | 'online';
  onlineCount: number;
  onlinePlayers: NetPlayer[];
  communityGames: CustomGame[];
  dailyDefs: ReturnType<typeof dailySelection>;
  newBadges: string[];
  rankUp: string | null;
  toast: (message: string, kind?: Toast['kind'], icon?: string) => void;
  createProfile: (data: { name: string; avatar: string; grade: GradeId; difficulty: SaveState['profile']['difficulty'] }) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  recordGame: (record: GameRecord) => { ryos: number; newBadges: string[]; levelUp: boolean };
  awardRyos: (amount: number, reason?: string) => void;
  spendRyos: (amount: number) => boolean;
  claimDaily: (id: string) => void;
  buyAvatar: (emoji: string, price: number) => boolean;
  buyTheme: (id: string, price: number) => boolean;
  setTheme: (id: string) => void;
  refreshCommunity: (q?: string) => Promise<void>;
  publishGame: (game: Partial<CustomGame>) => Promise<{ ok: boolean; error?: string; game?: CustomGame }>;
  friends: { ids: string[]; incoming: { from: string; name: string; avatar?: string }[]; outgoing: string[] };
  refreshFriends: () => void;
  addFriend: (id: string) => void;
  acceptFriend: (id: string) => void;
  registerCustomGameLocally: (game: CustomGame) => void;
  resetAll: () => void;
  bumpStat: (key: keyof SaveState['stats'], amount?: number) => void;
}

const GameCtx = createContext<Ctx | null>(null);

export const useGame = (): Ctx => {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error('useGame doit être utilisé dans <GameProvider>');
  return ctx;
};

let toastSeq = 0;

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [save, setSave] = useState<SaveState>(() => {
    const local = loadLocalSave();
    const base = local || defaultSave();
    // Serie de connexion : mise a jour au premier chargement du jour.
    const today = todayKey();
    if (base.streak.last !== today) {
      const gap = daysBetween(base.streak.last, today);
      const days = gap === 1 ? base.streak.days + 1 : gap > 1 ? 1 : base.streak.days;
      const streak = { days, best: Math.max(base.streak.best, days), last: today };
      const stats = {
        ...base.stats,
        daysPlayed: base.stats.daysPlayed + (gap >= 1 ? 1 : 0),
        ryosEarnedTotal: base.stats.ryosEarnedTotal
      };
      const daily =
        base.daily.date === today ? base.daily : { date: today, progress: {}, claimed: [] };
      return { ...base, streak, daily, stats };
    }
    if (base.daily.date !== today) {
      return { ...base, daily: { date: today, progress: {}, claimed: [] } };
    }
    return base;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [communityGames, setCommunityGames] = useState<CustomGame[]>([]);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [rankUp, setRankUp] = useState<string | null>(null);

  const netState = useSyncExternalStore(subscribeNet, getNetState, getNetState);

  const toast = useCallback((message: string, kind: Toast['kind'] = 'info', icon?: string) => {
    const id = `t${++toastSeq}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, kind, icon }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  // ------------------------- Persistance locale + serveur -------------------
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    writeLocalSave(save);
    writeIdentity({
      id: save.profile.id,
      name: save.profile.name,
      avatar: save.profile.avatar,
      grade: save.profile.grade,
      elo: save.profile.elo,
      ryos: save.profile.ryos
    });
  }, [save]);

  useEffect(() => {
    setSoundEnabled(save.settings.sound);
  }, [save.settings.sound]);

  // Synchronisation du profil vers le serveur (classement, presence, amis)
  useEffect(() => {
    const t = setTimeout(() => {
      void api.syncUser({
        id: save.profile.id,
        name: save.profile.name,
        avatar: save.profile.avatar,
        grade: save.profile.grade,
        elo: save.profile.elo,
        ryos: save.profile.ryos,
        streak: save.streak.days
      } as never);
      netEmit('presence:update', {
        name: save.profile.name,
        avatar: save.profile.avatar,
        elo: save.profile.elo,
        ryos: save.profile.ryos,
        grade: save.profile.grade
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [save.profile.id, save.profile.name, save.profile.avatar, save.profile.grade, save.profile.elo, save.profile.ryos, save.streak.days]);

  // ------------------------------- Reseau ----------------------------------
  useEffect(() => {
    connectNet();
    const offToast = onNet<{ message: string }>('toast', (p) => p?.message && toast(p.message, 'info', '📡'));
    const offReq = onNet<{ from: string; name: string }>('friends:requested', (p) => {
      if (!p?.from) return;
      setSave((prev) => ({
        ...prev,
        friends: {
          ...prev.friends,
          incoming: prev.friends.incoming.some((f) => f.from === p.from)
            ? prev.friends.incoming
            : [...prev.friends.incoming, { from: p.from, name: p.name, at: Date.now() }]
        }
      }));
      toast(`${p.name} veut être ton ami ninja !`, 'success', '🫂');
    });
    const offAcc = onNet<{ by: string; name: string }>('friends:accepted', (p) => {
      if (!p?.by) return;
      setSave((prev) => ({
        ...prev,
        friends: {
          ...prev.friends,
          ids: prev.friends.ids.includes(p.by) ? prev.friends.ids : [...prev.friends.ids, p.by],
          outgoing: prev.friends.outgoing.filter((x) => x !== p.by),
          incoming: prev.friends.incoming.filter((x) => x.from !== p.by)
        },
        stats: { ...prev.stats, friendsAdded: Math.max(prev.stats.friendsAdded, 1) }
      }));
      toast(`${p.name} a accepté ton invitation !`, 'success', '✅');
    });
    return () => {
      offToast();
      offReq();
      offAcc();
    };
  }, [toast]);

  // Chargement initial des jeux communautaires
  useEffect(() => {
    void (async () => {
      const list = await api.listGames();
      setCommunityGames(list);
    })();
  }, []);

  // ------------------------- Deblocage des badges ---------------------------
  useEffect(() => {
    const unlocked = BADGES.filter((b) => !save.badges.includes(b.id) && b.check(save.stats, save));
    if (!unlocked.length) return;
    const reward = unlocked.reduce((sum, b) => sum + (b.reward || 0), 0);
    setSave((prev) => ({
      ...prev,
      badges: [...prev.badges, ...unlocked.map((b) => b.id)],
      profile: { ...prev.profile, ryos: prev.profile.ryos + reward },
      stats: { ...prev.stats, ryosEarnedTotal: prev.stats.ryosEarnedTotal + reward }
    }));
    setNewBadges(unlocked.map((b) => b.id));
    unlocked.forEach((b, i) =>
      setTimeout(() => {
        toast(`Badge débloqué : ${b.name} !${b.reward ? ` (+${b.reward} Ryos)` : ''}`, 'badge', b.emoji);
        sfx.coin();
      }, i * 900)
    );
    if (reward > 0) setTimeout(() => setNewBadges([]), 6000);
  }, [save, toast]);

  // ------------------------------- Actions ---------------------------------
  const createProfile: Ctx['createProfile'] = ({ name, avatar, grade, difficulty }) => {
    const fresh = defaultSave(name, avatar);
    setSave({
      ...fresh,
      profile: { ...fresh.profile, grade, difficulty, name, avatar },
      shop: { ...fresh.shop, avatars: [] }
    });
    toast(`Bienvenue à l’Académie, ${name} !`, 'success', avatar);
    sfx.levelUp();
  };

  const updateProfile: Ctx['updateProfile'] = (patch) => {
    setSave((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  };

  const updateSettings: Ctx['updateSettings'] = (patch) => {
    setSave((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  };

  const bumpStat: Ctx['bumpStat'] = (key, amount = 1) => {
    setSave((prev) => {
      const value = prev.stats[key];
      if (typeof value !== 'number') return prev;
      return { ...prev, stats: { ...prev.stats, [key]: value + amount } };
    });
  };

  const bumpDaily = (
    prev: SaveState,
    record: GameRecord
  ): SaveState => {
    const today = todayKey();
    const daily = prev.daily.date === today ? { ...prev.daily, progress: { ...prev.daily.progress } } : { date: today, progress: {}, claimed: [] };
    const add = (metric: string, amount: number) => {
      dailySelection(daily.date)
        .filter((d) => d.metric === metric)
        .forEach((d) => {
          daily.progress[d.id] = (daily.progress[d.id] || 0) + amount;
        });
    };
    if (record.type === 'quiz') add('quiz', 1);
    if (record.type === 'examen') add('exam', 1);
    if (record.type === 'party' || record.party) add('party', 1);
    if (record.kahoot) add('kahoot', 1);
    if (record.duelWon) add('duel', 1);
    if (record.fromCommunity) add('custom', 1);
    add('correct', record.correct);
    if (record.perfect) add('perfect', 1);
    const ryosGained = Math.max(0, record.baseRyos ?? 0);
    add('ryos', ryosGained);
    return { ...prev, daily };
  };

  const recordGame: Ctx['recordGame'] = (record) => {
    const total = Math.max(1, record.total);
    const bonus = rankBonus(saveRef.current.profile.ryos);
    const base = record.baseRyos ?? record.correct * 10;
    const earned = Math.max(0, Math.round(base * bonus));
    const eloDelta = record.eloDelta || 0;
    const before = rankFromRyos(saveRef.current.profile.ryos);
    let levelUp = false;
    const unlockedNow: string[] = [];

    setSave((prev) => {
      let next: SaveState = {
        ...prev,
        profile: {
          ...prev.profile,
          ryos: Math.max(0, prev.profile.ryos + earned),
          elo: Math.max(100, prev.profile.elo + eloDelta),
          favoriteSubject: record.subject || prev.profile.favoriteSubject
        },
        stats: {
          ...prev.stats,
          questionsAnswered: prev.stats.questionsAnswered + total,
          correctAnswers: prev.stats.correctAnswers + record.correct,
          ryosEarnedTotal: prev.stats.ryosEarnedTotal + earned,
          quizzesPlayed: prev.stats.quizzesPlayed + (record.type === 'quiz' ? 1 : 0),
          perfectQuizzes: prev.stats.perfectQuizzes + (record.perfect || record.correct === total ? (record.type === 'quiz' ? 1 : 0) : 0),
          examsTaken: prev.stats.examsTaken + (record.type === 'examen' ? 1 : 0),
          bestExam: Math.max(prev.stats.bestExam, record.type === 'examen' ? record.correct : 0),
          duelsPlayed: prev.stats.duelsPlayed + (record.type === 'duel' ? 1 : 0),
          duelsWon: prev.stats.duelsWon + (record.duelWon ? 1 : 0),
          partyPlayed: prev.stats.partyPlayed + (record.party ? 1 : 0),
          kahootPlayed: prev.stats.kahootPlayed + (record.kahoot ? 1 : 0),
          boardWins: prev.stats.boardWins + (record.boardWin ? 1 : 0),
          bestRun: Math.max(prev.stats.bestRun, record.correct),
          subjectsPlayed: record.subject && !prev.stats.subjectsPlayed.includes(record.subject)
            ? [...prev.stats.subjectsPlayed, record.subject]
            : prev.stats.subjectsPlayed,
          gamesPlayedFromOthers: prev.stats.gamesPlayedFromOthers + (record.fromCommunity ? 1 : 0)
        },
        history: [
          {
            id: `h_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
            type: record.type,
            label: record.label,
            correct: record.correct,
            total,
            score: record.correct,
            max: total,
            ryos: earned,
            eloDelta: eloDelta || undefined,
            opponent: record.opponent,
            at: Date.now()
          },
          ...prev.history
        ].slice(0, 80)
      };
      next = bumpDaily(next, record);
      const after = rankFromRyos(next.profile.ryos);
      if (after.id !== before.id) {
        levelUp = true;
        next = { ...next, seenRanks: [...next.seenRanks, after.id] };
      }
      return next;
    });

    if (earned > 0) sfx.coin();
    if (levelUp) {
      const rank = rankFromRyos(saveRef.current.profile.ryos + earned);
      setTimeout(() => {
        setRankUp(rank.name);
        toast(`Nouveau grade : ${rank.name} ! ${rank.perk}`, 'reward', rank.emoji);
        sfx.levelUp();
        setTimeout(() => setRankUp(null), 6000);
      }, 400);
    }
    void api.postMatch(record.type, [{ id: save.profile.id, name: save.profile.name }], {
      label: record.label,
      correct: record.correct,
      total,
      opponent: record.opponent
    });
    return { ryos: earned, newBadges: unlockedNow, levelUp };
  };

  const awardRyos: Ctx['awardRyos'] = (amount, reason) => {
    if (amount === 0) return;
    const bonus = amount > 0 ? rankBonus(saveRef.current.profile.ryos) : 1;
    const value = Math.round(amount * bonus);
    setSave((prev) => ({
      ...prev,
      profile: { ...prev.profile, ryos: Math.max(0, prev.profile.ryos + value) },
      stats: { ...prev.stats, ryosEarnedTotal: prev.stats.ryosEarnedTotal + Math.max(0, value) }
    }));
    if (value > 0) {
      sfx.coin();
      if (reason) toast(`${reason} : +${value} Ryos`, 'reward', '🪙');
    } else {
      toast(`${value} Ryos`, 'info', '🪙');
    }
  };

  const spendRyos: Ctx['spendRyos'] = (amount) => {
    if (saveRef.current.profile.ryos < amount) {
      toast('Pas assez de Ryos ! Entraîne-toi encore.', 'error', '🪙');
      return false;
    }
    setSave((prev) => ({ ...prev, profile: { ...prev.profile, ryos: Math.max(0, prev.profile.ryos - amount) } }));
    return true;
  };

  const claimDaily: Ctx['claimDaily'] = (id) => {
    const def = challengeById(id);
    if (!def) return;
    const done = (save.daily.progress[id] || 0) >= def.goal;
    if (!done || save.daily.claimed.includes(id)) return;
    setSave((prev) => ({
      ...prev,
      daily: { ...prev.daily, claimed: [...prev.daily.claimed, id] },
      profile: { ...prev.profile, ryos: prev.profile.ryos + def.reward },
      stats: { ...prev.stats, ryosEarnedTotal: prev.stats.ryosEarnedTotal + def.reward }
    }));
    toast(`Défi terminé ! +${def.reward} Ryos`, 'reward', def.emoji);
    sfx.win();
  };

  const buyAvatar: Ctx['buyAvatar'] = (emoji, price) => {
    if (save.shop.avatars.includes(emoji)) {
      updateProfile({ avatar: emoji });
      return true;
    }
    if (!spendRyos(price)) return false;
    setSave((prev) => ({
      ...prev,
      shop: { ...prev.shop, avatars: [...prev.shop.avatars, emoji] },
      profile: { ...prev.profile, avatar: emoji }
    }));
    toast(`Nouvel avatar débloqué : ${emoji}`, 'success', '🎨');
    return true;
  };

  const buyTheme: Ctx['buyTheme'] = (id, price) => {
    if (save.shop.themes.includes(id)) {
      setSave((prev) => ({ ...prev, shop: { ...prev.shop, theme: id } }));
      return true;
    }
    if (!spendRyos(price)) return false;
    setSave((prev) => ({ ...prev, shop: { ...prev.shop, themes: [...prev.shop.themes, id], theme: id } }));
    toast('Nouveau thème débloqué !', 'success', '🌈');
    return true;
  };

  const setTheme: Ctx['setTheme'] = (id) => setSave((prev) => ({ ...prev, shop: { ...prev.shop, theme: id } }));

  const refreshCommunity: Ctx['refreshCommunity'] = async (q) => {
    const list = await api.listGames(q);
    setCommunityGames(list);
  };

  const publishGame: Ctx['publishGame'] = async (game) => {
    if (saveRef.current.profile.ryos < 5000) {
      return { ok: false, error: 'Il te faut 5 000 Ryos pour débloquer le mode Créateur.' };
    }
    const res = await api.publishGame(game, {
      id: save.profile.id,
      name: save.profile.name,
      ryos: save.profile.ryos
    });
    if (!res.ok) return { ok: false, error: res.error };
    const created = res.game!;
    setSave((prev) => ({
      ...prev,
      profile: { ...prev.profile, ryos: Math.max(0, prev.profile.ryos - 5000) },
      stats: { ...prev.stats, gamesPublished: prev.stats.gamesPublished + 1 },
      customGames: [...prev.customGames, created]
    }));
    setCommunityGames((prev) => [created, ...prev.filter((g) => g.id !== created.id)]);
    toast('Jeu publié pour toute la communauté ! (−5 000 Ryos)', 'success', '🛠️');
    return { ok: true, game: created };
  };

  const registerCustomGameLocally: Ctx['registerCustomGameLocally'] = (game) => {
    setCommunityGames((prev) => [game, ...prev.filter((g) => g.id !== game.id)]);
  };

  const refreshFriends = useCallback(() => {
    const id = saveRef.current.profile.id;
    void (async () => {
      const res = await api.friends(id);
      if (!res) return;
      setSave((prev) => ({
        ...prev,
        friends: {
          ids: Array.from(new Set([...prev.friends.ids, ...(res.ids || [])])),
          incoming: (res.incoming || []).map((r) => ({ from: r.id, name: r.name, avatar: r.avatar, at: Date.now() })),
          outgoing: prev.friends.outgoing
        }
      }));
    })();
    netEmit('friends:list');
    return () => {};
  }, []);

  const addFriend: Ctx['addFriend'] = (id) => {
    if (id === save.profile.id) return;
    if (save.friends.ids.includes(id)) {
      toast('Vous êtes déjà amis !', 'info', '🫂');
      return;
    }
    if (save.friends.outgoing.includes(id)) {
      toast('Demande déjà envoyée.', 'info', '⏳');
      return;
    }
    netEmit('friends:request', { to: id });
    void api.requestFriend(save.profile.id, id);
    setSave((prev) => ({ ...prev, friends: { ...prev.friends, outgoing: [...prev.friends.outgoing, id] } }));
    toast('Demande d’ami envoyée !', 'success', '📨');
  };

  const acceptFriend: Ctx['acceptFriend'] = (id) => {
    netEmit('friends:accept', { from: id });
    void api.acceptFriend(id, save.profile.id);
    setSave((prev) => ({
      ...prev,
      friends: {
        ids: prev.friends.ids.includes(id) ? prev.friends.ids : [...prev.friends.ids, id],
        incoming: prev.friends.incoming.filter((f) => f.from !== id),
        outgoing: prev.friends.outgoing
      },
      stats: { ...prev.stats, friendsAdded: prev.stats.friendsAdded + 1 }
    }));
    toast('Nouvel ami ajouté !', 'success', '🫂');
  };

  const resetAll: Ctx['resetAll'] = () => {
    clearLocalSave();
    const fresh = defaultSave('Ninja');
    setSave(fresh);
    toast('Progression réinitialisée.', 'info', '🧹');
  };

  const value = useMemo<Ctx>(
    () => ({
      save,
      profile: save.profile,
      toasts,
      netStatus: netState.status,
      onlineCount: netState.count,
      onlinePlayers: netState.list,
      communityGames,
      dailyDefs: dailySelection(save.daily.date),
      newBadges,
      rankUp,
      toast,
      createProfile,
      updateProfile,
      updateSettings,
      recordGame,
      awardRyos,
      spendRyos,
      claimDaily,
      buyAvatar,
      buyTheme,
      setTheme,
      refreshCommunity,
      publishGame,
      friends: save.friends,
      refreshFriends,
      addFriend,
      acceptFriend,
      registerCustomGameLocally,
      resetAll,
      bumpStat
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [save, toasts, netState, communityGames, newBadges, rankUp]
  );

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
};
