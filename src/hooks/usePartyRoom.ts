import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  botAction,
  botDelay,
  computeRewards,
  createGameState,
  currentIsBot,
  ranking,
  reduce
} from '../../shared/partyEngine';
import type { EngineAction, EnginePlayer, EngineQuestion, EngineState } from '../../shared/partyEngine';
import { connectNet, isConnected, netEmit, onNet } from '../state/net';
import { useGame } from '../state/GameContext';
import type { PartyGameId } from '../types';

export interface LobbyPlayer {
  id: string;
  name: string;
  avatar: string;
  bot?: boolean;
  elo?: number;
  ryos?: number;
  grade?: string;
}

export interface RoomRewards {
  [playerId: string]: { ryos: number; elo: number; won: boolean; rank: number };
}

export type RoomStatus = 'connecting' | 'lobby' | 'playing' | 'over';

interface Options {
  game: PartyGameId | 'duel' | 'kahoot';
  questions: EngineQuestion[];
  mode: 'online' | 'local';
  maxRounds?: number;
  botCount?: number;
  autoCreate?: boolean;
  botFill?: boolean;
}

const BOT_NAMES = ['Kenji', 'Sakura', 'Tobio', 'Hana', 'Rin', 'Daichi'];
const BOT_AVATARS = ['🦝', '🐍', '🦔', '🐦', '🐹', '🐗'];

/**
 * Gere une partie multijoueur :
 *  - mode "online" : salon Socket.IO (le serveur arbitre et gere les bots)
 *  - mode "local"  : memes regles, jouees dans le navigateur contre des bots
 */
export function usePartyRoom({ game, questions, mode, maxRounds, botCount = 3, autoCreate = true, botFill = true }: Options) {
  const { profile, toast } = useGame();
  const [status, setStatus] = useState<RoomStatus>(mode === 'online' ? 'connecting' : 'lobby');
  const [code, setCode] = useState<string | null>(null);
  const [lobby, setLobby] = useState<LobbyPlayer[]>([]);
  const [hostId, setHostId] = useState<string>(profile.id);
  const [state, setState] = useState<EngineState | null>(null);
  const [rewards, setRewards] = useState<RoomRewards | null>(null);
  const [chat, setChat] = useState<{ id: string; name: string; text: string; at: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stateRef = useRef<EngineState | null>(null);
  stateRef.current = state;
  const questionsRef = useRef<EngineQuestion[]>(questions);
  questionsRef.current = questions;
  const botTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const createdRef = useRef(false);

  const me: LobbyPlayer = useMemo(
    () => ({ id: profile.id, name: profile.name, avatar: profile.avatar, elo: profile.elo, ryos: profile.ryos, grade: profile.grade }),
    [profile.avatar, profile.elo, profile.grade, profile.id, profile.name, profile.ryos]
  );

  // ----------------------------- Mode local --------------------------------
  const buildLocalLobby = useCallback((): LobbyPlayer[] => {
    const bots: LobbyPlayer[] = Array.from({ length: botCount }, (_, i) => ({
      id: `bot_${i + 1}`,
      name: BOT_NAMES[i % BOT_NAMES.length],
      avatar: BOT_AVATARS[i % BOT_AVATARS.length],
      bot: true,
      elo: 980 + Math.floor(Math.random() * 320)
    }));
    return [me, ...bots];
  }, [botCount, me]);

  useEffect(() => {
    if (mode !== 'local' || lobby.length) return;
    setLobby(buildLocalLobby());
  }, [mode, lobby.length, buildLocalLobby]);

  const startLocal = useCallback(() => {
    const players = lobby.length ? lobby : buildLocalLobby();
    const engineId = game === 'duel' || game === 'kahoot' ? 'course' : game;
    const next = createGameState(
      engineId,
      players.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, bot: p.bot })),
      { questions: questionsRef.current, maxRounds: maxRounds || (game === 'duel' ? 8 : game === 'kahoot' ? 10 : undefined) }
    );
    setState(next);
    setStatus('playing');
  }, [buildLocalLobby, game, lobby, maxRounds]);

  // Boucle des bots en mode local
  useEffect(() => {
    if (mode !== 'local' || status !== 'playing' || !state) return;
    if (state.over) return;
    if (!currentIsBot(state)) return;
    botTimer.current = setTimeout(() => {
      const current = stateRef.current;
      if (!current || current.over) return;
      const action = botAction(current, 0.6);
      if (action) setState(reduce(current, action));
    }, botDelay());
    return () => {
      if (botTimer.current) clearTimeout(botTimer.current);
    };
  }, [mode, status, state]);

  // Fin de partie locale : calcul des recompenses
  useEffect(() => {
    if (mode !== 'local' || !state?.over || rewards) return;
    const map: RoomRewards = {};
    state.players.forEach((p) => {
      map[p.id] = computeRewards(state, p.id);
    });
    setRewards(map);
    setStatus('over');
  }, [mode, state, rewards]);

  // ----------------------------- Mode en ligne -----------------------------
  useEffect(() => {
    if (mode !== 'online') return;
    connectNet();
    const offCreated = onNet<{ code: string; game: string }>('room:created', (p) => {
      setCode(p.code);
      setStatus('lobby');
      setError(null);
    });
    const offJoined = onNet<{ code: string; game: string }>('room:joined', (p) => setCode(p.code));
    const offLobby = onNet<any>('room:lobby', (p) => {
      setLobby(p.players || []);
      setHostId(p.hostId);
      setStatus(p.started ? 'playing' : 'lobby');
    });
    const offState = onNet<any>('room:state', (p) => {
      setLobby(p.players || []);
      setHostId(p.hostId);
      setState(p.state);
      setStatus(p.state?.over ? 'over' : 'playing');
      if (p.rewards) setRewards(p.rewards);
    });
    const offStarted = onNet<any>('room:started', () => setStatus('playing'));
    const offClosed = onNet<any>('room:closed', (p) => {
      setError(p?.reason === 'annule' ? 'La partie a été annulée.' : 'Le salon est fermé.');
      setStatus('lobby');
    });
    const offChat = onNet<any>('room:chat', (m) => setChat((prev) => [m, ...prev].slice(0, 40)));
    return () => {
      offCreated();
      offJoined();
      offLobby();
      offState();
      offStarted();
      offClosed();
      offChat();
    };
  }, [mode]);

  // Creation automatique du salon
  useEffect(() => {
    if (mode !== 'online' || !autoCreate || code || createdRef.current) return;
    const t = setTimeout(() => {
      if (createdRef.current) return;
      createdRef.current = true;
      if (!isConnected()) {
        setError('Serveur en ligne injoignable — utilise le mode hors ligne avec bots.');
        return;
      }
      const payload = {
        game,
        questions: questionsRef.current,
        botFill,
        options: {}
      };
      if (!netEmit('room:create', payload)) {
        setError('Connexion au serveur impossible.');
      }
    }, 350);
    return () => clearTimeout(t);
  }, [mode, autoCreate, code, game, botFill]);

  // Creation / relance quand les questions changent (hote)
  const recreate = useCallback(
    (newQuestions?: EngineQuestion[]) => {
      if (mode === 'local') {
        setState(null);
        setRewards(null);
        setStatus('lobby');
        if (newQuestions) questionsRef.current = newQuestions;
        setTimeout(() => {
          const players = lobby.length ? lobby : buildLocalLobby();
          const engineId = game === 'duel' || game === 'kahoot' ? 'course' : game;
          setState(
            createGameState(
              engineId,
              players.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, bot: p.bot })),
              { questions: questionsRef.current, maxRounds: maxRounds || (game === 'duel' ? 8 : undefined) }
            )
          );
          setStatus('playing');
        }, 0);
        return;
      }
      netEmit('room:start', { code, questions: newQuestions || questionsRef.current, maxRounds });
    },
    [mode, lobby, buildLocalLobby, game, maxRounds, code]
  );

  // --------------------------------- Actions -------------------------------
  const start = useCallback(() => {
    if (mode === 'local') {
      startLocal();
      return;
    }
    netEmit('room:start', { code, questions: questionsRef.current, maxRounds });
  }, [mode, startLocal, code, maxRounds]);

  const act = useCallback(
    (action: Omit<EngineAction, 'playerId'>) => {
      if (mode === 'local') {
        const current = stateRef.current;
        if (!current || current.over) return;
        setState(reduce(current, { ...(action as EngineAction), playerId: profile.id }));
        return;
      }
      netEmit('room:action', { code, action });
    },
    [mode, profile.id, code]
  );

  const roll = useCallback(() => act({ type: 'roll' }), [act]);
  const answer = useCallback((choice: number, pick?: string) => act({ type: 'answer', choice, pick } as EngineAction), [act]);
  const pick = useCallback((payload: number) => act({ type: 'pick', payload } as EngineAction), [act]);

  const forceNext = useCallback(() => {
    if (mode === 'local') {
      const current = stateRef.current;
      if (!current || current.over) return;
      let next = current;
      current.players
        .filter((p) => !p.answered && p.alive)
        .forEach((p) => {
          next = reduce(next, { type: 'answer', playerId: p.id, choice: -1, pick: 'ciseaux' });
        });
      setState(next);
      return;
    }
    netEmit('room:forceNext', { code });
  }, [mode, code]);

  const addBot = useCallback(() => {
    if (mode === 'local') {
      setLobby((prev) => [
        ...prev,
        {
          id: `bot_${prev.length + 1}_${Math.random().toString(36).slice(2, 5)}`,
          name: BOT_NAMES[prev.length % BOT_NAMES.length],
          avatar: BOT_AVATARS[prev.length % BOT_AVATARS.length],
          bot: true,
          elo: 1000
        }
      ]);
      return;
    }
    netEmit('room:addBot', { code });
  }, [mode, code]);

  const joinRoom = useCallback(
    (joinCode: string) => {
      if (mode !== 'online') return;
      connectNet();
      netEmit('room:join', { code: joinCode.toUpperCase() });
      setCode(joinCode.toUpperCase());
    },
    [mode]
  );

  const sendChat = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      if (mode === 'online') netEmit('room:chat', { code, text });
      else setChat((prev) => [{ id: `l${Date.now()}`, name: profile.name, text, at: Date.now() }, ...prev]);
    },
    [mode, code, profile.name]
  );

  const leave = useCallback(() => {
    if (mode === 'online') netEmit('room:leave', { code });
    setState(null);
    setStatus('lobby');
  }, [mode, code]);

  const finalRanking = useMemo(() => (state ? ranking(state) : []), [state]);

  const youId = profile.id;
  const isHost = mode === 'local' ? true : hostId === youId || !code;

  return {
    mode,
    status,
    code,
    lobby,
    state,
    rewards,
    chat,
    error,
    youId,
    isHost,
    finalRanking,
    actions: { start, roll, answer, pick, forceNext, addBot, joinRoom, sendChat, leave, recreate },
    toast
  };
}
