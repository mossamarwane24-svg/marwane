import React from 'react';
import type { EnginePlayer, EngineState } from '../../shared/partyEngine';
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
