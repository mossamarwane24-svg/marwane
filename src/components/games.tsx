import React, { useEffect, useMemo, useState } from 'react';
import type { usePartyRoom } from '../hooks/usePartyRoom';
import { Board, BossBar, Dice, FleetGrid, KunaiPicker, LotoCard, MemoryBoard, MorpionGrid, Scoreboard, TeamScore } from './party';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ui';
import { cx, formatRyos } from '../lib/format';
import type { Question, SubjectId } from '../types';
import { sfx } from '../lib/sound';

type Room = ReturnType<typeof usePartyRoom>;

const toQuestion = (q: { prompt: string; choices: string[]; answer?: number; explanation?: string; subject?: string } | null): Question | null =>
  q
    ? {
        id: `mq_${q.prompt.slice(0, 12)}`,
        subject: (q.subject as SubjectId) || 'maths',
        band: 'elementaire',
        level: 2,
        prompt: q.prompt,
        choices: q.choices,
        answer: typeof q.answer === 'number' ? q.answer : -1,
        explanation: q.explanation
      }
    : null;

/** Compte a rebours d'affichage : a 0, le joueur passe automatiquement. */
const useRoundTimer = (key: unknown, seconds: number, active: boolean, onExpire?: () => void) => {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
  }, [key, seconds]);
  useEffect(() => {
    if (!active || left <= 0) return;
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left, active]);
  useEffect(() => {
    if (active && left <= 0 && onExpire) onExpire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, active]);
  return left;
};

const TurnBanner: React.FC<{ room: Room }> = ({ room }) => {
  const state = room.state!;
  const current = state.players[state.turn % state.players.length];
  const isMe = current?.id === room.youId;
  return (
    <div className={cx('rounded-xl border p-3 text-center text-sm font-bold', isMe ? 'border-amber-400/60 bg-amber-500/15 text-amber-100' : 'border-ninja-line bg-ninja-panel2/50')}>
      {state.over ? '🏁 Partie terminée' : isMe ? '🎯 À toi de jouer !' : `⏳ Au tour de ${current?.avatar} ${current?.name}`}
      <span className="ml-2 text-ninja-muted">· manche {state.round}</span>
    </div>
  );
};

// ------------------------------- PLATEAU ----------------------------------
export const PlateauView: React.FC<{ room: Room }> = ({ room }) => {
  const state = room.state!;
  const me = state.players.find((p) => p.id === room.youId);
  const current = state.players[state.turn % state.players.length];
  const isMyTurn = current?.id === room.youId && !state.over;
  const [rolling, setRolling] = useState(false);
  const q = toQuestion(state.question);
  const answered = !!me?.answered;
  const timerKey = state.question?.prompt;
  const left = useRoundTimer(timerKey, 30, state.phase === 'question' && !answered, () => {
    if (isMyTurn && !answered) room.actions.answer(-1);
  });

  const roll = () => {
    setRolling(true);
    sfx.dice();
    setTimeout(() => {
      setRolling(false);
      room.actions.roll();
    }, 700);
  };

  return (
    <div className="grid gap-3">
      <TurnBanner room={room} />
      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="card">
          <Board board={state.board} players={state.players} youId={room.youId} />
        </div>
        <div className="grid content-start gap-3">
          <div className="card text-center">
            <Dice value={state.pending.dice} rolling={rolling} onRoll={isMyTurn && state.phase === 'lancer' ? roll : undefined} disabled={!isMyTurn || state.phase !== 'lancer'} />
            {!isMyTurn && !state.over && <p className="mt-2 text-xs text-ninja-muted">Le dé se lance au tour de chaque joueur.</p>}
          </div>
          <div className="card">
            <Scoreboard state={state} youId={room.youId} showPos />
          </div>
        </div>
      </div>

      {q && state.phase === 'question' && (
        <div className="grid gap-2">
          {isMyTurn && !answered ? (
            <>
              <QuestionCard question={q} index={state.round - 1} total={state.maxRounds} selected={null} revealed={false} secondsLeft={left} secondsTotal={30} onAnswer={(c) => room.actions.answer(c)} />
            </>
          ) : (
            <div className="card text-center text-sm text-ninja-muted">
              {answered ? '✅ Réponse envoyée, en attente des autres ninjas…' : `${current?.name} répond à la question du plateau…`}
            </div>
          )}
        </div>
      )}

      <div className="card max-h-40 overflow-y-auto">
        <div className="mb-1 text-xs font-black uppercase tracking-widest text-ninja-muted">Journal de partie</div>
        {state.log.map((l, i) => (
          <div key={`${l.at}-${i}`} className="text-xs text-ninja-muted">
            • {l.text}
          </div>
        ))}
      </div>
    </div>
  );
};

// -------------------------------- COURSE ----------------------------------
export const CourseView: React.FC<{ room: Room; hostControls?: boolean }> = ({ room, hostControls }) => {
  const state = room.state!;
  const me = state.players.find((p) => p.id === room.youId);
  const q = toQuestion(state.question);
  const answered = !!me?.answered;
  const left = useRoundTimer(state.question?.prompt, 30, state.phase === 'question' && !answered, () => {
    if (!answered) room.actions.answer(-1);
  });

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-3">
        <div className="card">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-ninja-muted">
            <span>
              Manche {state.round}/{state.maxRounds}
            </span>
            <span>{state.players.filter((p) => p.answered).length}/{state.players.length} ont répondu</span>
          </div>
          <ProgressBar value={state.players.filter((p) => p.answered).length} max={state.players.length} height="h-1.5" />
        </div>
        {q ? (
          answered ? (
            <div className="card text-center">
              <div className="text-3xl">⏳</div>
              <p className="mt-1 font-bold">Réponse enregistrée !</p>
              <p className="text-sm text-ninja-muted">
                {state.players.filter((p) => !p.answered).length > 0
                  ? `En attente de ${state.players.filter((p) => !p.answered).map((p) => p.name).join(', ')}…`
                  : 'Calcul des points…'}
              </p>
              {typeof state.question?.answer === 'number' && state.question.answer >= 0 && (
                <p className="mt-2 text-sm">
                  Bonne réponse : <b className="text-emerald-300">{state.question.choices[state.question.answer]}</b>
                </p>
              )}
            </div>
          ) : (
            <QuestionCard
              question={q}
              index={state.round - 1}
              total={state.maxRounds}
              selected={null}
              revealed={false}
              secondsLeft={left}
              secondsTotal={30}
              onAnswer={(c) => room.actions.answer(c)}
            />
          )
        ) : (
          <div className="card text-center text-sm text-ninja-muted">Préparation de la prochaine question…</div>
        )}
        {hostControls && room.isHost && (
          <button className="btn-ghost" onClick={room.actions.forceNext}>
            ⏭️ Question suivante (hôte)
          </button>
        )}
      </div>
      <div className="card">
        <Scoreboard state={state} youId={room.youId} />
      </div>
    </div>
  );
};

// --------------------------------- KUNAI ----------------------------------
export const KunaiView: React.FC<{ room: Room }> = ({ room }) => {
  const state = room.state!;
  const me = state.players.find((p) => p.id === room.youId);
  const [pick, setPick] = useState<string | null>(null);
  const q = toQuestion(state.question);
  const answered = !!me?.answered;
  const left = useRoundTimer(state.question?.prompt, 30, state.phase === 'question' && !answered, () => {
    if (!answered) room.actions.answer(-1, pick || 'pierre');
  });

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-3">
        <div className="card-soft text-sm text-ninja-muted">
          🥋 Règle du Duel de Kunai : choisis <b>pierre / feuille / ciseaux</b>, puis réponds à la question. Tu marques 1 point par
          adversaire battu (+1 si ta réponse est juste).
        </div>
        <div className="card">
          <div className="label">Ton kunai</div>
          <KunaiPicker value={pick} onChange={(v) => { setPick(v); sfx.click(); }} disabled={answered} />
        </div>
        {q && !answered ? (
          <QuestionCard
            question={q}
            index={state.round - 1}
            total={state.maxRounds}
            selected={null}
            revealed={false}
            secondsLeft={left}
            secondsTotal={30}
            onAnswer={(c) => {
              if (!pick) {
                setPick('pierre');
                room.actions.answer(c, 'pierre');
              } else room.actions.answer(c, pick);
            }}
          />
        ) : (
          <div className="card text-center text-sm text-ninja-muted">
            {answered ? '⚔️ En attente des autres ninjas…' : 'Préparation de la manche…'}
          </div>
        )}
      </div>
      <div className="grid content-start gap-3">
        <div className="card">
          <Scoreboard state={state} youId={room.youId} />
        </div>
        <div className="card max-h-48 overflow-y-auto">
          {state.log.map((l, i) => (
            <div key={`${l.at}-${i}`} className="text-xs text-ninja-muted">
              • {l.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------- BOSS ----------------------------------
export const BossView: React.FC<{ room: Room }> = ({ room }) => {
  const state = room.state!;
  const me = state.players.find((p) => p.id === room.youId);
  const q = toQuestion(state.question);
  const answered = !!me?.answered;
  const maxHp = 100 + (state.players.length - 1) * 25;
  const left = useRoundTimer(state.question?.prompt, 25, state.phase === 'question' && !answered, () => {
    if (!answered) room.actions.answer(-1);
  });

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-3">
        <BossBar hp={state.pending.bossHp} maxHp={maxHp} />
        {q && !answered ? (
          <QuestionCard
            question={q}
            index={state.round - 1}
            total={state.maxRounds}
            selected={null}
            revealed={false}
            secondsLeft={left}
            secondsTotal={25}
            onAnswer={(c) => room.actions.answer(c)}
          />
        ) : (
          <div className="card text-center text-sm text-ninja-muted">
            {answered ? '🗡️ Coup porté ! En attente des autres ninjas…' : 'Le Démon Renard prépare sa contre-attaque…'}
          </div>
        )}
      </div>
      <div className="grid content-start gap-3">
        <div className="card">
          <Scoreboard state={state} youId={room.youId} />
        </div>
        <div className="card max-h-48 overflow-y-auto">
          {state.log.map((l, i) => (
            <div key={`${l.at}-${i}`} className="text-xs text-ninja-muted">
              • {l.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// -------------------------------- MORPION ---------------------------------
export const MorpionView: React.FC<{ room: Room }> = ({ room }) => {
  const state = room.state!;
  const current = state.players[state.turn % state.players.length];
  const isMyTurn = current?.id === room.youId && !state.over;
  const canPick = state.phase === 'pick' && state.pending.pick?.playerId === room.youId;
  const q = toQuestion(state.question);
  const me = state.players.find((p) => p.id === room.youId);
  const answered = !!me?.answered;
  const left = useRoundTimer(state.question?.prompt, 30, state.phase === 'question' && isMyTurn && !answered, () => {
    if (isMyTurn && !answered) room.actions.answer(-1);
  });

  return (
    <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
      <div className="card">
        <div className="label">Grille (alignez 3 symboles !)</div>
        <MorpionGrid grid={state.grid} players={state.players} onPick={room.actions.pick} canPick={canPick} youSymbol={state.players.findIndex((p) => p.id === room.youId) + 1} />
        <div className="mt-3 flex flex-wrap gap-1">
          {state.players.map((p, i) => (
            <span key={p.id} className="chip">
              {p.avatar} = joueur {i + 1}
            </span>
          ))}
        </div>
      </div>
      <div className="grid content-start gap-3">
        <TurnBanner room={room} />
        {q && state.phase === 'question' ? (
          isMyTurn && !answered ? (
            <QuestionCard question={q} index={state.round - 1} total={state.maxRounds} selected={null} revealed={false} secondsLeft={left} secondsTotal={30} onAnswer={(c) => room.actions.answer(c)} />
          ) : (
            <div className="card text-center text-sm text-ninja-muted">
              {answered ? '✔️ Bonne réponse ! Place ton symbole.' : `${current?.name} doit répondre pour poser son symbole…`}
            </div>
          )
        ) : canPick ? (
          <div className="card text-center font-bold text-amber-200 animate-pulse">👉 Clique sur une case pour poser ton symbole !</div>
        ) : null}
        <div className="card">
          <Scoreboard state={state} youId={room.youId} />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------- LOTO ----------------------------------
export const LotoView: React.FC<{ room: Room }> = ({ room }) => {
  const state = room.state!;
  const me = state.players.find((p) => p.id === room.youId);
  const current = state.players[state.turn % state.players.length];
  const isMyTurn = current?.id === room.youId && !state.over;
  const q = toQuestion(state.question);
  const answered = !!me?.answered;
  const left = useRoundTimer(state.question?.prompt, 30, state.phase === 'question' && isMyTurn && !answered, () => {
    if (isMyTurn && !answered) room.actions.answer(-1);
  });

  return (
    <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
      <div className="grid content-start gap-3">
        <div className="card">
          <div className="label">Ta carte de loto</div>
          {me && <LotoCard player={me} drawn={state.drawn} />}
          <div className="mt-3 text-xs text-ninja-muted">
            Numéros tirés : {state.drawn.length ? state.drawn.join(', ') : 'aucun pour le moment'}
          </div>
        </div>
        <div className="card">
          <div className="label">Cartes des adversaires</div>
          <div className="grid gap-2">
            {state.players
              .filter((p) => p.id !== room.youId)
              .map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{p.avatar}</span>
                  <span className="flex-1 truncate font-bold">{p.name}</span>
                  <span className="text-ninja-muted">{p.marks.length}/9 cochés</span>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="grid content-start gap-3">
        <TurnBanner room={room} />
        {q && state.phase === 'question' ? (
          isMyTurn && !answered ? (
            <QuestionCard question={q} index={state.round - 1} total={state.maxRounds} selected={null} revealed={false} secondsLeft={left} secondsTotal={30} onAnswer={(c) => room.actions.answer(c)} />
          ) : (
            <div className="card text-center text-sm text-ninja-muted">
              {answered ? '🎱 Tirage effectué !' : `${current?.name} tente de tirer un numéro…`}
            </div>
          )
        ) : null}
        <div className="card">
          <Scoreboard state={state} youId={room.youId} />
        </div>
      </div>
    </div>
  );
};

// ------------------------------- EQUIPES ----------------------------------
export const EquipeView: React.FC<{ room: Room; hostControls?: boolean }> = ({ room, hostControls }) => {
  const state = room.state!;
  const me = state.players.find((p) => p.id === room.youId);
  const q = toQuestion(state.question);
  const answered = !!me?.answered;
  const left = useRoundTimer(state.question?.prompt, 30, state.phase === 'question' && !answered, () => {
    if (!answered) room.actions.answer(-1);
  });

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
      <div className="grid content-start gap-3">
        <TeamScore state={state} youId={room.youId} />
        <div className="card">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-ninja-muted">
            <span>
              Manche {Math.min(state.round, state.maxRounds)}/{state.maxRounds}
            </span>
            <span>
              {state.players.filter((p) => p.answered).length}/{state.players.length} ont répondu
            </span>
          </div>
          <ProgressBar value={state.players.filter((p) => p.answered).length} max={state.players.length} height="h-1.5" />
        </div>
        {q && !answered ? (
          <QuestionCard
            question={q}
            index={state.round - 1}
            total={state.maxRounds}
            selected={null}
            revealed={false}
            secondsLeft={left}
            secondsTotal={30}
            onAnswer={(c) => room.actions.answer(c)}
          />
        ) : (
          <div className="card text-center text-sm text-ninja-muted">
            {answered ? '🛡️ Point enregistré pour ton équipe ! En attente des autres ninjas…' : 'Préparation de la manche…'}
          </div>
        )}
        {hostControls && room.isHost && (
          <button className="btn-ghost" onClick={room.actions.forceNext}>
            ⏭️ Question suivante (hôte)
          </button>
        )}
      </div>
      <div className="grid content-start gap-3">
        <div className="card">
          <Scoreboard state={state} youId={room.youId} />
        </div>
        <div className="card max-h-48 overflow-y-auto">
          {state.log.map((l, i) => (
            <div key={`${l.at}-${i}`} className="text-xs text-ninja-muted">
              • {l.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --------------------------- BATAILLE NAVALE -------------------------------
export const BatailleView: React.FC<{ room: Room }> = ({ room }) => {
  const state = room.state!;
  const me = state.players.find((p) => p.id === room.youId);
  const pending = state.pending?.pick;
  const myTurn = !!pending && pending.playerId === room.youId && state.phase === 'pick';
  const targetId = pending?.targetId;
  const target = state.players.find((p) => p.id === targetId);
  const enemy = target || state.players.find((p) => p.id !== room.youId);
  const q = toQuestion(state.question);
  // Au tour par tour : seul le joueur courant voit et peut répondre à la question.
  const currentPlayer = state.players[state.turn % state.players.length];
  const isMyTurn = !!currentPlayer && currentPlayer.id === room.youId;
  const toAnswer = state.phase === 'question' && isMyTurn;
  const left = useRoundTimer(state.question?.prompt, 30, toAnswer, () => {
    if (state.phase === 'question') room.actions.answer(-1);
  });

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
      <div className="grid content-start gap-3">
        <div className="card">
          <div className="grid grid-cols-2 gap-4">
            <FleetGrid player={me!} mode="mine" title={`⛵ Ma flotte (${me?.name})`} />
            <FleetGrid
              player={enemy!}
              mode="enemy"
              title={`🌫️ Flotte de ${enemy?.name}`}
              interactive={myTurn}
              onPick={(cell) => room.actions.pick(cell)}
            />
          </div>
        </div>

        {myTurn ? (
          <div className="card animate-pop text-center">
            <div className="text-3xl">🎯</div>
            <p className="mt-1 font-bold">À toi de tirer !</p>
            <p className="text-sm text-ninja-muted">Clique sur une case de la flotte de {enemy?.name}.</p>
          </div>
        ) : q && toAnswer ? (
          <QuestionCard
            question={q}
            index={state.round - 1}
            total={state.maxRounds}
            selected={null}
            revealed={false}
            secondsLeft={left}
            secondsTotal={30}
            onAnswer={(c) => room.actions.answer(c)}
          />
        ) : (
          <div className="card text-center text-sm text-ninja-muted">
            {state.phase === 'question'
              ? `⏳ Au tour de ${currentPlayer?.name} de répondre…`
              : `🎯 ${currentPlayer?.name} choisit une case à viser…`}
          </div>
        )}
      </div>

      <div className="grid content-start gap-3">
        <div className="card">
          <div className="mb-2 text-center text-xs font-bold text-ninja-muted">
            Manche {Math.min(state.round, state.maxRounds)}/{state.maxRounds} · une bonne réponse = un tir
          </div>
          <Scoreboard state={state} youId={room.youId} />
          <p className="mt-2 text-center text-[11px] text-ninja-muted">
            💥 touché = +20 · 🚢 navire coulé = +50 · coule les 3 navires pour gagner
          </p>
        </div>
        <div className="card max-h-52 overflow-y-auto">
          {state.log.map((l, i) => (
            <div key={`${l.at}-${i}`} className="text-xs text-ninja-muted">
              • {l.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// -------------------------------- MEMORY ----------------------------------
export const MemoryView: React.FC<{ room: Room }> = ({ room }) => {
  const state = room.state!;
  const currentPlayer = state.players[state.turn % state.players.length];
  const isMyTurn = !!currentPlayer && currentPlayer.id === room.youId;
  const q = toQuestion(state.question);
  const toAnswer = state.phase === 'question' && isMyTurn;
  const left = useRoundTimer(state.question?.prompt, 30, toAnswer, () => {
    if (state.phase === 'question') room.actions.answer(-1);
  });
  const pairsFound = (state.owners || []).filter((o) => o >= 0).length / 2;

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
      <div className="grid content-start gap-3">
        <div className="card">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-ninja-muted">
            <span>
              🧠 Paires trouvées : {pairsFound}/6
            </span>
            <span>
              Tour {Math.min(state.round, state.maxRounds)}/{state.maxRounds}
            </span>
          </div>
          <MemoryBoard
            state={state}
            youId={room.youId}
            interactive={state.phase === 'pick' && isMyTurn}
            onPick={(cell) => room.actions.pick(cell)}
          />
        </div>

        {toAnswer && q ? (
          <QuestionCard
            question={q}
            index={pairsFound}
            total={6}
            selected={null}
            revealed={false}
            secondsLeft={left}
            secondsTotal={30}
            onAnswer={(c) => room.actions.answer(c)}
          />
        ) : (
          <div className="card text-center text-sm text-ninja-muted">
            {state.phase === 'question'
              ? `⏳ ${currentPlayer?.name} répond pour garder sa paire…`
              : isMyTurn
                ? '🌀 À toi : retourne deux cartes (énoncé + bonne réponse).'
                : `🌀 ${currentPlayer?.name} retourne les cartes…`}
          </div>
        )}
      </div>

      <div className="grid content-start gap-3">
        <div className="card">
          <Scoreboard state={state} youId={room.youId} />
          <p className="mt-2 text-center text-[11px] text-ninja-muted">
            Retrouve une question et sa réponse, puis réponds bien pour garder la paire (+30). Une erreur et les cartes se
            retournent !
          </p>
        </div>
        <div className="card max-h-52 overflow-y-auto">
          {state.log.map((l, i) => (
            <div key={`${l.at}-${i}`} className="text-xs text-ninja-muted">
              • {l.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ------------------------------- SELECTEUR --------------------------------
export const GameStage: React.FC<{ room: Room; gameId: string; hostControls?: boolean }> = ({ room, gameId, hostControls }) => {
  const view = useMemo(() => {
    switch (gameId) {
      case 'plateau':
        return <PlateauView room={room} />;
      case 'kunai':
        return <KunaiView room={room} />;
      case 'boss':
        return <BossView room={room} />;
      case 'morpion':
        return <MorpionView room={room} />;
      case 'loto':
        return <LotoView room={room} />;
      case 'equipe':
        return <EquipeView room={room} hostControls={hostControls} />;
      case 'bataille':
        return <BatailleView room={room} />;
      case 'memory':
        return <MemoryView room={room} />;
      case 'course':
      case 'duel':
      case 'kahoot':
        return <CourseView room={room} hostControls={hostControls} />;
      default:
        return <PlateauView room={room} />;
    }
  }, [gameId, room, hostControls]);
  return view;
};
