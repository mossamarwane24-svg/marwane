import React from 'react';
import type { EnginePlayer, EngineState } from '../../shared/partyEngine';
import { P4_COLS, P4_ROWS } from '../../shared/partyEngine';
import { cx, formatRyos } from '../lib/format';

export const SQUARE_ICONS: Record<string, string> = {
  start: '🚩',
  quiz: '📝',
  ryos: '💰',
  trap: '🕳️',
  bonus: '⚡',
  boss: '👹',
  swap: '🔄',
  final: '🏁'
};

export const SQUARE_LABEL: Record<string, string> = {
  start: 'Départ',
  quiz: 'Défi question',
  ryos: 'Trésor (+50 Ryos)',
  trap: 'Piège (recule de 3)',
  bonus: 'Bonus (+80 Ryos, rejoue)',
  boss: 'Case Boss (gros Ryos)',
  swap: 'Échange de place',
  final: 'Arrivée'
};

// ---------------------------------- Dé -------------------------------------
export const Dice: React.FC<{ value: number | null; rolling?: boolean; onRoll?: () => void; disabled?: boolean; label?: string }> = ({
  value,
  rolling,
  onRoll,
  disabled,
  label = 'Lancer le dé'
}) => {
  const pips: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };
  const cells = pips[value || 1] || [4];
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cx(
          'grid h-24 w-24 grid-cols-3 grid-rows-3 gap-1 rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-ninja-panel2 to-ninja-panel p-2.5 shadow-xl',
          rolling && 'animate-dice'
        )}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={cx('rounded-full', cells.includes(i) ? 'bg-amber-300' : 'bg-transparent')} />
        ))}
      </div>
      {onRoll && (
        <button className="btn-primary w-full" onClick={onRoll} disabled={disabled}>
          🎲 {label}
        </button>
      )}
      {value && !rolling && <div className="text-xs font-bold text-ninja-muted">Résultat : {value}</div>}
    </div>
  );
};

// --------------------------------- Plateau ---------------------------------
export const Board: React.FC<{ board: { index: number; type: string }[]; players: EnginePlayer[]; youId?: string }> = ({
  board,
  players,
  youId
}) => (
  <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-6">
    {board.map((sq) => {
      const here = players.filter((p) => p.pos === sq.index);
      const isYou = here.some((p) => p.id === youId);
      return (
        <div
          key={sq.index}
          className={cx('board-square', isYou && 'active')}
          title={`Case ${sq.index + 1} — ${SQUARE_LABEL[sq.type] || sq.type}`}
        >
          <span className="text-lg">{SQUARE_ICONS[sq.type] || '❔'}</span>
          <span className="text-[9px] font-bold text-ninja-muted">{sq.index + 1}</span>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-0.5 text-[11px]">
            {here.map((p) => (
              <span key={p.id} className="token" style={{ position: 'static' }}>
                {p.avatar}
              </span>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

// ------------------------------- Tableau de bord --------------------------
export const Scoreboard: React.FC<{ state: EngineState; youId?: string; showPos?: boolean }> = ({ state, youId, showPos }) => {
  const currentId = state.players[state.turn % state.players.length]?.id;
  return (
    <div className="grid gap-2">
      {state.players.map((p, i) => {
        const isTurn = p.id === currentId && !state.over;
        return (
          <div
            key={p.id}
            className={cx(
              'flex items-center gap-2 rounded-xl border p-2 text-sm transition',
              p.id === youId ? 'border-amber-400/60 bg-amber-500/10' : 'border-ninja-line bg-ninja-panel2/50',
              !p.alive && 'opacity-50',
              isTurn && 'ring-2 ring-amber-400/70'
            )}
          >
            <span className="text-xl">{p.avatar}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">
                {p.name} {p.bot && <span className="text-[10px] font-normal text-ninja-muted">bot</span>}
                {p.id === youId && <span className="ml-1 text-[10px] text-amber-300">toi</span>}
              </div>
              <div className="text-[11px] text-ninja-muted">
                {showPos ? `Case ${p.pos + 1}` : `Score ${p.score}`} · ✅ {p.correct} · ❌ {p.wrong} · série {p.streak}
                {state.gameId === 'boss' && ` · ❤️ ${p.hp}`}
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-amber-300">{formatRyos(p.score)}</div>
              <div className="text-[10px] text-ninja-muted">Ryos en jeu</div>
            </div>
            <span className="text-[10px] font-bold text-ninja-muted">#{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
};

// ----------------------------------- Loto ---------------------------------
export const LotoCard: React.FC<{ player: EnginePlayer; drawn: number[] }> = ({ player, drawn }) => (
  <div className="grid grid-cols-3 gap-1.5">
    {player.card.map((n) => {
      const marked = player.marks.includes(n);
      return (
        <div
          key={n}
          className={cx(
            'flex aspect-square items-center justify-center rounded-xl border text-lg font-black',
            marked ? 'border-emerald-400/70 bg-emerald-500/25 text-emerald-100' : drawn.includes(n) ? 'border-amber-400/50 bg-amber-500/10' : 'border-ninja-line bg-ninja-panel2/50'
          )}
        >
          {n}
        </div>
      );
    })}
  </div>
);

// --------------------------------- Morpion --------------------------------
export const MorpionGrid: React.FC<{
  grid: (number | null)[];
  players: EnginePlayer[];
  onPick?: (cell: number) => void;
  canPick?: boolean;
  youSymbol?: number;
}> = ({ grid, players, onPick, canPick, youSymbol }) => (
  <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
    {grid.map((cell, i) => {
      const owner = cell ? players[cell - 1] : null;
      return (
        <button
          key={i}
          disabled={!canPick || !!cell}
          onClick={() => onPick?.(i)}
          className={cx(
            'flex aspect-square items-center justify-center rounded-xl border text-3xl font-black transition',
            cell ? 'border-ninja-line bg-ninja-panel2/70' : 'border-dashed border-ninja-line bg-ninja-bg/40',
            canPick && !cell && 'hover:border-amber-400/70 hover:bg-amber-500/10'
          )}
        >
          {owner ? <span className={cx(players.indexOf(owner) + 1 === youSymbol ? 'scale-110 drop-shadow-[0_0_6px_rgba(245,165,36,.9)]' : undefined)}>{owner.avatar}</span> : ''}
        </button>
      );
    })}
  </div>
);

// ------------------------------ Puissance 4 --------------------------------
/** Une couleur par joueur, pour distinguer les jetons meme avec le meme avatar. */
export const P4_COLORS = [
  'from-rose-500 to-rose-700 border-rose-300',
  'from-amber-400 to-amber-600 border-amber-200',
  'from-sky-500 to-sky-700 border-sky-300',
  'from-emerald-500 to-emerald-700 border-emerald-300'
];

export const Puissance4Grid: React.FC<{
  grid: (number | null)[];
  players: EnginePlayer[];
  onPick?: (col: number) => void;
  canPick?: boolean;
  youSymbol?: number;
  winLine?: number[];
}> = ({ grid, players, onPick, canPick, youSymbol, winLine = [] }) => {
  const free = (col: number) => {
    for (let r = P4_ROWS - 1; r >= 0; r -= 1) if (!grid[r * P4_COLS + col]) return true;
    return false;
  };
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-2 grid grid-cols-6 gap-1.5">
        {Array.from({ length: P4_COLS }, (_, col) => (
          <button
            key={col}
            type="button"
            disabled={!canPick || !free(col)}
            onClick={() => onPick?.(col)}
            title={`Colonne ${col + 1}`}
            className={cx(
              'rounded-lg border py-1 text-xs font-black transition',
              canPick && free(col)
                ? 'border-amber-400/70 bg-amber-500/20 text-amber-100 hover:bg-amber-500/40'
                : 'border-ninja-line bg-ninja-panel2/40 text-ninja-muted'
            )}
          >
            ↓ {col + 1}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-ninja-line bg-gradient-to-b from-sky-950/60 to-ninja-panel2/70 p-2">
        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: P4_ROWS * P4_COLS }, (_, i) => {
            const cell = grid[i] || 0;
            const owner = cell ? players[cell - 1] : null;
            const mine = cell === youSymbol;
            const won = winLine.includes(i);
            return (
              <div
                key={i}
                className={cx(
                  'flex aspect-square items-center justify-center rounded-full border-2 text-lg transition',
                  owner
                    ? cx('bg-gradient-to-b shadow-inner', P4_COLORS[(cell - 1) % P4_COLORS.length])
                    : 'border-ninja-line/60 bg-ninja-bg/70',
                  mine && 'ring-2 ring-amber-300/70',
                  won && 'animate-pulse ring-4 ring-amber-300'
                )}
              >
                {owner ? <span className="drop-shadow">{owner.avatar}</span> : ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------- Kunai ---------------------------------
export const KunaiPicker: React.FC<{ value: string | null; onChange: (v: string) => void; disabled?: boolean }> = ({
  value,
  onChange,
  disabled
}) => {
  const options = [
    { id: 'pierre', label: 'Pierre', emoji: '🪨' },
    { id: 'feuille', label: 'Feuille', emoji: '🍃' },
    { id: 'ciseaux', label: 'Ciseaux', emoji: '✂️' }
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          disabled={disabled}
          onClick={() => onChange(o.id)}
          className={cx(
            'rounded-xl border p-3 font-bold transition',
            value === o.id ? 'border-amber-400/80 bg-amber-500/20 text-amber-100' : 'border-ninja-line bg-ninja-panel2/60 hover:border-amber-400/40'
          )}
        >
          <div className="text-2xl">{o.emoji}</div>
          <div className="text-xs">{o.label}</div>
        </button>
      ))}
    </div>
  );
};

// -------------------------------- MEMORY ----------------------------------
export const MemoryBoard: React.FC<{
  state: EngineState;
  youId?: string;
  interactive?: boolean;
  onPick?: (cell: number) => void;
}> = ({ state, youId, interactive, onPick }) => {
  const cards = state.cards || [];
  const owners = state.owners || [];
  const flipped = state.flipped || [];
  const ownerColor = (i: number) => {
    const palette = [
      'border-amber-400/70 bg-amber-500/25',
      'border-sky-400/70 bg-sky-500/25',
      'border-emerald-400/70 bg-emerald-500/25',
      'border-fuchsia-400/70 bg-fuchsia-500/25'
    ];
    return palette[i % palette.length];
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {cards.map((card, i) => {
        const owner = owners[i];
        const isFlipped = flipped.includes(i);
        const visible = owner >= 0 || isFlipped;
        const mine = owner >= 0 && state.players[owner]?.id === youId;
        const clickable = interactive && !visible && flipped.length < 2;
        return (
          <button
            key={i}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onPick?.(i)}
            className={cx(
              'flex min-h-[64px] items-center justify-center rounded-xl border-2 p-2 text-center text-xs font-bold transition',
              !visible && 'border-ninja-line bg-ninja-panel2/70',
              visible && owner >= 0 && ownerColor(owner),
              visible && owner < 0 && 'border-amber-400/70 bg-amber-500/15',
              clickable && 'cursor-pointer hover:scale-[1.03] hover:border-amber-400',
              !clickable && visible && 'cursor-default'
            )}
          >
            {visible ? (
              <span className={cx(card.kind === 'a' && 'text-base')}>
                {card.kind === 'a' && '💡 '}
                {card.text}
                {mine && <span className="ml-1">✅</span>}
              </span>
            ) : (
              <span className="text-2xl">🌀</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// ---------------------------- BATAILLE NAVALE -----------------------------
/** Grille 4x4 d'un joueur : ma flotte (et les tirs subis) ou la flotte adverse (brouillard). */
export const FleetGrid: React.FC<{
  player: EnginePlayer;
  mode: 'mine' | 'enemy';
  interactive?: boolean;
  onPick?: (cell: number) => void;
  title?: string;
}> = ({ player, mode, interactive, onPick, title }) => {
  const shipCells = new Set((player.ships || []).flatMap((s) => s.cells || []));
  const hitCells = new Set((player.ships || []).flatMap((s) => s.hits || []));
  const inc = player.incoming || {};
  const cellStyle = 'aspect-square rounded-lg border text-base font-black flex items-center justify-center transition';

  return (
    <div>
      {title && <div className="mb-1 text-center text-[11px] font-black uppercase tracking-widest text-ninja-muted">{title}</div>}
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 16 }, (_, i) => {
          const res = inc[i];
          const isHit = res === 'hit' || hitCells.has(i);
          const isMiss = res === 'miss';
          let bg = 'border-ninja-line bg-ninja-bg/60';
          let icon = '';
          if (isHit) { bg = 'border-red-400/70 bg-red-500/30'; icon = '💥'; }
          else if (isMiss) { bg = 'border-sky-400/40 bg-sky-500/10'; icon = '💧'; }
          else if (mode === 'mine' && shipCells.has(i)) { bg = 'border-emerald-400/50 bg-emerald-500/15'; icon = '⛵'; }
          else if (mode === 'enemy') icon = '🌫️';
          const clickable = mode === 'enemy' && interactive && !res;
          return (
            <button
              key={i}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onPick?.(i)}
              className={cx(
                cellStyle,
                bg,
                clickable && 'cursor-pointer hover:scale-105 hover:border-amber-400 hover:bg-amber-500/20',
                !clickable && 'cursor-default'
              )}
              title={mode === 'enemy' ? `Case ${i + 1}` : undefined}
            >
              {icon}
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-1">
        {(player.ships || []).map((s, i) => {
          const h = (s.hits || []).length;
          const sunk = s.sunk !== undefined ? s.sunk : h >= (s.cells?.length || s.size);
          return (
            <span key={i} className={cx('chip !text-[10px]', sunk && '!border-red-400/60 !text-red-200')}>
              {sunk ? '💀' : '🚢'} {mode === 'mine' ? `${h}/${s.size}` : `${h}/${s.size}`}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// -------------------------------- EQUIPES ---------------------------------
export const TeamScore: React.FC<{ state: EngineState; youId?: string }> = ({ state, youId }) => {
  const scores = [0, 1].map((t) => state.players.filter((p) => p.team === t).reduce((sum, p) => sum + p.score, 0));
  const total = Math.max(1, scores[0] + scores[1]);
  const myTeam = state.players.find((p) => p.id === youId)?.team ?? 0;
  return (
    <div className="card">
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((t) => (
          <div
            key={t}
            className={cx(
              'rounded-xl border p-3 text-center',
              t === myTeam ? 'border-amber-400/60 bg-amber-500/10' : 'border-ninja-line bg-ninja-panel2/40'
            )}
          >
            <div className="text-[11px] font-black uppercase tracking-widest text-ninja-muted">
              {t === 0 ? 'Équipe 1' : 'Équipe 2'}
              {t === myTeam && <span className="ml-1 text-amber-300">(toi)</span>}
            </div>
            <div className="mt-1 text-3xl font-black">{scores[t]}</div>
            <div className="mt-1 flex flex-wrap justify-center gap-1">
              {state.players
                .filter((p) => p.team === t)
                .map((p) => (
                  <span key={p.id} className="chip !text-[10px]">
                    {p.avatar} {p.name} · ✅{p.correct}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full border border-ninja-line">
        <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{ width: `${(scores[0] / total) * 100}%` }} />
        <div className="h-full bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: `${(scores[1] / total) * 100}%` }} />
      </div>
      {state.suddenDeath > 0 && <p className="mt-2 text-center text-xs font-bold text-amber-300">⚡ MORT SUBITE en cours !</p>}
    </div>
  );
};

// ----------------------------------- Boss ---------------------------------
export const BossBar: React.FC<{ hp: number; maxHp: number }> = ({ hp, maxHp }) => (
  <div className="card-soft">
    <div className="mb-1 flex items-center justify-between text-sm font-bold">
      <span>👹 Démon Renard</span>
      <span className="text-red-300">
        {Math.max(0, Math.round(hp))}/{maxHp} PV
      </span>
    </div>
    <div className="h-3 overflow-hidden rounded-full border border-ninja-line bg-ninja-bg/70">
      <div
        className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-500"
        style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%` }}
      />
    </div>
  </div>
);

// ----------------------------- Fin de partie ------------------------------
export interface FinalRow {
  id: string;
  name: string;
  avatar: string;
  bot: boolean;
  score: number;
  correct: number;
  wrong: number;
}

export const GameOverPanel: React.FC<{
  ranking: FinalRow[];
  rewards?: Record<string, { ryos: number; elo: number; won: boolean; rank: number }> | null;
  youId?: string;
  onReplay?: () => void;
  onExit?: () => void;
  title?: string;
}> = ({ ranking, rewards, youId, onReplay, onExit, title = 'Fin de la partie' }) => {
  const me = rewards?.[youId || ''];
  return (
    <div className="card animate-pop">
      <h3 className="h2 mb-1">🏁 {title}</h3>
      {me && (
        <p className="mb-3 text-sm text-ninja-muted">
          Tu termines <b className="text-amber-300">#{me.rank}</b> · +{me.ryos} Ryos
          {me.elo ? ` · ${me.elo > 0 ? '+' : ''}${me.elo} ELO` : ''} {me.won && '🏆'}
        </p>
      )}
      <div className="grid gap-2">
        {ranking.map((p, i) => (
          <div
            key={p.id}
            className={cx(
              'flex items-center gap-2 rounded-xl border p-2',
              p.id === youId ? 'border-amber-400/60 bg-amber-500/10' : 'border-ninja-line bg-ninja-panel2/50',
              i === 0 && 'ring-1 ring-amber-400/50'
            )}
          >
            <span className="w-6 text-center font-black">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
            <span className="text-xl">{p.avatar}</span>
            <span className="flex-1 truncate font-bold">{p.name}</span>
            <span className="text-xs text-ninja-muted">
              ✅ {p.correct} · ❌ {p.wrong}
            </span>
            <span className="font-black text-amber-300">{formatRyos(p.score)}</span>
            {rewards?.[p.id] && <span className="text-[11px] text-emerald-300">+{rewards[p.id].ryos}🪙</span>}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {onReplay && (
          <button className="btn-primary flex-1" onClick={onReplay}>
            🔁 Rejouer
          </button>
        )}
        {onExit && (
          <button className="btn-ghost flex-1" onClick={onExit}>
            🚪 Quitter
          </button>
        )}
      </div>
    </div>
  );
};
