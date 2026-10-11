import React from 'react';
import { RANKS, rankProgress } from '../data/ranks';
import { cx, formatRyos } from '../lib/format';
import { ProgressBar } from './ui';

export const RankBadge: React.FC<{ ryos: number; size?: 'sm' | 'md' | 'lg'; showProgress?: boolean }> = ({
  ryos,
  size = 'md',
  showProgress = true
}) => {
  const { current, next, pct, missing } = rankProgress(ryos);
  const dims = {
    sm: { box: 'h-14 w-14 text-2xl', title: 'text-sm', bg: 'text-xs' },
    md: { box: 'h-20 w-20 text-4xl', title: 'text-lg', bg: 'text-xs' },
    lg: { box: 'h-28 w-28 text-5xl', title: 'text-2xl', bg: 'text-sm' }
  }[size];

  return (
    <div className="flex items-center gap-4">
      <div
        className={cx('relative flex shrink-0 items-center justify-center rounded-2xl border border-white/10 shadow-xl', dims.box)}
        style={{ background: `linear-gradient(140deg, ${current.colors[0]}, ${current.colors[1]})` }}
      >
        <span className="drop-shadow">{current.emoji}</span>
        <span className="absolute -bottom-2 rounded-full border border-ninja-line bg-ninja-bg px-2 py-0.5 text-[10px] font-bold">
          {RANKS.indexOf(current) + 1}/{RANKS.length}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className={cx('font-black tracking-tight', dims.title)}>{current.name}</div>
        <div className="text-xs text-ninja-muted">
          {current.emoji} {formatRyos(ryos)} Ryos · {current.perk}
        </div>
        {showProgress && (
          <div className="mt-2">
            <ProgressBar value={pct} gradient="from-amber-400 to-orange-500" />
            <div className="mt-1 text-[11px] text-ninja-muted">
              {next ? (
                <>
                  Encore <b className="text-amber-300">{formatRyos(missing)}</b> Ryos pour devenir {next.emoji} <b>{next.name}</b>
                </>
              ) : (
                <>Grade maximal atteint : tu es une légende de Konoha ! 🔥</>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const RankList: React.FC<{ ryos: number }> = ({ ryos }) => (
  <div className="grid gap-2">
    {RANKS.map((r) => {
      const unlocked = ryos >= r.min;
      return (
        <div
          key={r.id}
          className={cx(
            'flex items-center gap-3 rounded-xl border p-3',
            unlocked ? 'border-amber-400/40 bg-amber-500/10' : 'border-ninja-line bg-ninja-panel2/40 opacity-80'
          )}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ background: `linear-gradient(140deg, ${r.colors[0]}, ${r.colors[1]})`, filter: unlocked ? 'none' : 'grayscale(.85)' }}
          >
            {unlocked ? r.emoji : '🔒'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold">{r.name}</div>
            <div className="text-[11px] text-ninja-muted">{r.perk}</div>
          </div>
          <div className="text-right text-xs font-bold text-ninja-muted">{formatRyos(r.min)} Ryos</div>
        </div>
      );
    })}
  </div>
);
