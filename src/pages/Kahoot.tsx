import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGame } from '../state/GameContext';
import { usePartyRoom } from '../hooks/usePartyRoom';
import { buildPartyQuestions } from '../data/questions';
import { QuestionCard } from '../components/QuestionCard';
import { GameOverPanel } from '../components/party';
import { SectionTitle, Tabs } from '../components/ui';
import { cx, formatRyos } from '../lib/format';
import { netEmit, onNet } from '../state/net';

const TILE_STYLES = [
  'from-rose-500 to-red-500',
  'from-sky-500 to-blue-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-green-600'
];

/** Vue Kahoot plein écran : grandes tuiles colorées et rythme rapide. */
const KahootStage: React.FC<{ room: ReturnType<typeof usePartyRoom> }> = ({ room }) => {
  const state = room.state!;
  const me = state.players.find((p) => p.id === room.youId);
  const answered = !!me?.answered;
  const [left, setLeft] = useState(20);
  const q = state.question;

  useEffect(() => {
    setLeft(20);
  }, [q?.prompt]);

  useEffect(() => {
    if (!q || answered || state.over) return;
    if (left <= 0) {
      room.actions.answer(-1);
      return;
    }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, q, answered, state.over]);

  return (
    <div className="grid gap-4">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-amber-400/50 bg-amber-500/10 px-3 py-1.5 font-black tracking-[0.25em] text-amber-200">
            PIN {room.code}
          </span>
          <span className="chip">
            Question {Math.min(state.round, state.maxRounds)}/{state.maxRounds}
          </span>
          <span className="chip">{state.players.filter((p) => p.answered).length}/{state.players.length} réponses</span>
        </div>
        {!answered && q && <span className={cx('text-2xl font-black', left <= 5 ? 'text-red-400' : 'text-amber-300')}>{left}s</span>}
      </div>

      {q ? (
        <div className="rounded-2xl border border-ninja-line bg-ninja-panel p-6 text-center">
          <p className="text-2xl font-black sm:text-3xl">{q.prompt}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-ninja-line bg-ninja-panel p-6 text-center text-ninja-muted">
          Question suivante dans un instant…
        </div>
      )}

      {q && !answered ? (
        <div className="grid grid-cols-2 gap-3">
          {q.choices.map((c, i) => (
            <button
              key={c + i}
              onClick={() => room.actions.answer(i)}
              className={cx(
                'flex min-h-[120px] items-center justify-center gap-3 rounded-2xl bg-gradient-to-br p-4 text-xl font-black text-white shadow-xl transition active:scale-[.97]',
                TILE_STYLES[i % 4]
              )}
            >
              <span className="text-2xl">{['🔺', '🔷', '🟨', '🟩'][i % 4]}</span>
              {c}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="card text-center">
            <div className="text-3xl">{answered ? '✅' : '⏳'}</div>
            <p className="font-bold">{answered ? 'Réponse envoyée !' : 'En attente…'}</p>
            {q && typeof q.answer === 'number' && q.answer >= 0 && (
              <p className="mt-1 text-sm text-ninja-muted">
                Bonne réponse : <b className="text-emerald-300">{q.choices[q.answer]}</b>
              </p>
            )}
          </div>
          {room.isHost && (
            <button className="btn-primary" onClick={room.actions.forceNext}>
              ⏭️ Question suivante (animation de l’hôte)
            </button>
          )}
        </div>
      )}

      <div className="card">
        <div className="label">Classement en direct</div>
        <div className="grid gap-2">
          {[...state.players]
            .sort((a, b) => b.score - a.score)
            .map((p, i) => (
              <div key={p.id} className={cx('flex items-center gap-2 rounded-xl border p-2 text-sm', p.id === room.youId ? 'border-amber-400/60 bg-amber-500/10' : 'border-ninja-line bg-ninja-panel2/40')}>
                <span className="w-6 text-center font-black">{i + 1}</span>
                <span className="text-xl">{p.avatar}</span>
                <span className="flex-1 truncate font-bold">{p.name}</span>
                <span className="text-xs text-ninja-muted">
                  ✅ {p.correct} · ❌ {p.wrong}
                </span>
                <span className="font-black text-amber-300">{formatRyos(p.score)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export const KahootPage: React.FC = () => {
  const { profile, recordGame, toast, netStatus } = useGame();
  const [tab, setTab] = useState<'host' | 'join'>('host');
  const [phase, setPhase] = useState<'home' | 'lobby' | 'play'>('home');
  const [pin, setPin] = useState('');
  const [started, setStarted] = useState(false);
  const recorded = useRef(false);

  const questions = useMemo(() => buildPartyQuestions(profile.grade, profile.difficulty, 20), [profile.grade, profile.difficulty]);

  const room = usePartyRoom({
    game: 'kahoot',
    questions,
    mode: 'online',
    autoCreate: false,
    botFill: false,
    maxRounds: 12
  });

  const [activePin, setActivePin] = useState<string>('');
  const [params] = useSearchParams();

  // Lien recu : ?pin=ABC123
  useEffect(() => {
    const p = params.get('pin');
    if (p) {
      setPin(p.toUpperCase());
      setTab('join');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const off = onNet<any>('room:created', (p) => {
      setActivePin(p.code);
      setPhase('lobby');
      setStarted(false);
    });
    const offJoined = onNet<any>('room:joined', (p) => {
      setActivePin(p.code);
      setPhase('lobby');
    });
    const offStarted = onNet<any>('room:started', () => {
      setStarted(true);
      setPhase('play');
    });
    return () => {
      off();
      offJoined();
      offStarted();
    };
  }, []);

  useEffect(() => {
    if (room.status === 'playing') setPhase('play');
  }, [room.status]);

  useEffect(() => {
    if (room.status !== 'over' || !room.state || recorded.current) return;
    recorded.current = true;
    const me = room.state.players.find((p) => p.id === room.youId);
    if (!me) return;
    const rewards = room.rewards?.[room.youId];
    recordGame({
      type: 'kahoot',
      label: 'Partie Kahoot',
      correct: me.correct,
      total: Math.max(1, me.correct + me.wrong),
      baseRyos: rewards?.ryos ?? 40 + me.correct * 12,
      kahoot: true
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.status, room.state]);

  const host = () => {
    if (netStatus !== 'online') {
      toast('Le mode Kahoot nécessite le serveur en ligne (npm run server).', 'error', '🔌');
      return;
    }
    setStarted(false);
    recorded.current = false;
    netEmit('room:create', { game: 'kahoot', questions, botFill: false, options: {} });
  };

  const join = () => {
    if (pin.trim().length < 4) {
      toast('Entre le PIN affiché sur l’écran de l’hôte.', 'error', '🔢');
      return;
    }
    recorded.current = false;
    netEmit('room:join', { code: pin.trim().toUpperCase() });
    setActivePin(pin.trim().toUpperCase());
    setPhase('lobby');
  };

  if (phase === 'play' && room.state) {
    return (
      <div className="grid gap-4">
        {room.status === 'over' ? (
          <GameOverPanel
            ranking={room.finalRanking}
            rewards={room.rewards}
            youId={room.youId}
            title="Kahoot terminé"
            onReplay={() => {
              recorded.current = false;
              room.actions.recreate(buildPartyQuestions(profile.grade, profile.difficulty, 20));
            }}
            onExit={() => {
              room.actions.leave();
              setPhase('home');
              setActivePin('');
            }}
          />
        ) : (
          <KahootStage room={room} />
        )}
      </div>
    );
  }

  if (phase === 'lobby') {
    return (
      <div className="grid gap-4">
        <div className="card text-center">
          <div className="text-sm font-black uppercase tracking-widest text-ninja-muted">Rejoins la partie sur ton appareil</div>
          <div className="mt-2 rounded-2xl border border-amber-400/50 bg-amber-500/10 px-6 py-4">
            <div className="text-xs uppercase tracking-widest text-ninja-muted">PIN du Kahoot</div>
            <div className="text-5xl font-black tracking-[0.4em] text-amber-200">{activePin || '······'}</div>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button
              className="btn-ghost"
              onClick={() => {
                navigator.clipboard?.writeText(`${window.location.href.split('?')[0]}?pin=${activePin}`);
                toast('Lien Kahoot copié !', 'success', '🔗');
              }}
            >
              🔗 Copier le lien de partie
            </button>
            {room.isHost ? (
              <button
                className="btn-primary"
                onClick={() => {
                  room.actions.start();
                  setStarted(true);
                }}
                disabled={room.lobby.length < 1}
              >
                🚀 Démarrer l’animation
              </button>
            ) : (
              <span className="chip">⏳ En attente du lancement par l’hôte…</span>
            )}
          </div>
        </div>

        <div className="card">
          <SectionTitle icon="🧑‍🤝‍🧑" title={`${room.lobby.length} joueur(s) dans la partie`} subtitle="Chacun répond sur son propre appareil" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {room.lobby.map((p, i) => (
              <div key={p.id + i} className="flex items-center gap-2 rounded-xl border border-ninja-line bg-ninja-panel2/40 p-2">
                <span className="text-2xl">{p.avatar}</span>
                <span className="truncate font-bold">{p.name}</span>
              </div>
            ))}
          </div>
          {started && !room.state && <p className="mt-3 text-sm text-ninja-muted">Lancement de la première question…</p>}
        </div>

        <div className="flex justify-center">
          <button
            className="btn-ghost"
            onClick={() => {
              room.actions.leave();
              setPhase('home');
              setActivePin('');
            }}
          >
            ← Quitter le salon
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="card">
        <h1 className="h1">📺 Kahoot Ninja</h1>
        <p className="mt-1 text-sm text-ninja-muted">
          Une partie animée par un hôte : il projette les questions, tout le monde répond sur son appareil avec les grandes tuiles
          colorées, et le classement se met à jour en direct. Quizz de 12 questions sur ton programme.
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'host', label: 'Animer une partie', icon: '🎤' },
          { id: 'join', label: 'Rejoindre avec un PIN', icon: '🔢' }
        ]}
        value={tab}
        onChange={(v) => setTab(v as 'host' | 'join')}
      />

      {tab === 'host' ? (
        <div className="card text-center">
          <div className="text-5xl">🎤</div>
          <h2 className="h2 mt-2">Créer une partie Kahoot</h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-ninja-muted">
            Tu obtiendras un PIN à 6 caractères à partager avec ta classe, tes amis ou tes élèves. Aucun compte nécessaire : ils entrent le
            PIN et jouent.
          </p>
          <button className="btn-primary mt-4 !px-8 !py-3" onClick={host}>
            🚀 Générer un PIN de partie
          </button>
          {netStatus !== 'online' && (
            <p className="mt-3 text-xs text-red-300">
              ⚠️ Le serveur en ligne n’est pas joignable. Lance <code>npm run server</code> puis recharge la page.
            </p>
          )}
        </div>
      ) : (
        <div className="card text-center">
          <div className="text-5xl">🔢</div>
          <h2 className="h2 mt-2">Rejoindre une partie</h2>
          <p className="text-sm text-ninja-muted">Entre le PIN affiché sur l’écran de l’hôte.</p>
          <div className="mx-auto mt-4 flex max-w-sm flex-col gap-2 sm:flex-row">
            <input
              className="input text-center text-2xl font-black tracking-[0.3em] uppercase"
              placeholder="PIN"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && join()}
            />
            <button className="btn-blue" onClick={join}>
              Entrer
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: '📱', title: 'Chacun son appareil', text: 'L’hôte projette, les joueurs répondent sur téléphone ou tablette.' },
          { icon: '🎓', title: 'Questions de ton niveau', text: 'Maths, français, sciences : adaptées à ta classe.' },
          { icon: '🪙', title: 'Ryos et ELO', text: 'Les meilleurs marquent des Ryos et grimpent au classement.' }
        ].map((f) => (
          <div key={f.title} className="card-soft text-center">
            <div className="text-2xl">{f.icon}</div>
            <div className="mt-1 font-bold">{f.title}</div>
            <div className="text-xs text-ninja-muted">{f.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
