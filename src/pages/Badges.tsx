import React, { useState } from 'react';
import { useGame } from '../state/GameContext';
import { BADGES } from '../data/badges';
import { ProgressBar, SectionTitle, Tabs } from '../components/ui';
import { cx, formatRyos } from '../lib/format';
import { RANKS } from '../data/ranks';

const TIER_STYLE: Record<string, { label: string; color: string; ring: string }> = {
  bronze: { label: 'Bronze', color: 'from-amber-700 to-amber-500', ring: 'ring-amber-600/40' },
  argent: { label: 'Argent', color: 'from-slate-400 to-slate-200', ring: 'ring-slate-300/40' },
  or: { label: 'Or', color: 'from-yellow-500 to-amber-300', ring: 'ring-amber-400/50' },
  legende: { label: 'Légende', color: 'from-fuchsia-600 to-purple-400', ring: 'ring-fuchsia-400/50' }
};

export const BadgesPage: React.FC = () => {
  const { save, profile } = useGame();
  const [filter, setFilter] = useState<'tous' | 'bronze' | 'argent' | 'or' | 'legende' | 'manquants'>('tous');

  const list = BADGES.filter((b) => {
    if (filter === 'tous') return true;
    if (filter === 'manquants') return !save.badges.includes(b.id);
    return b.tier === filter;
  });
  const owned = save.badges.length;
  const total = BADGES.length;
  const rewardTotal = BADGES.filter((b) => save.badges.includes(b.id)).reduce((sum, b) => sum + (b.reward || 0), 0);

  const nextBadges = BADGES.filter((b) => !save.badges.includes(b.id)).slice(0, 4);

  return (
    <div className="grid gap-5">
      <div className="card">
        <h1 className="h1">🏅 Badges et trophées</h1>
        <p className="mt-1 text-sm text-ninja-muted">
          {owned} badge(s) sur {total} débloqués · {formatRyos(rewardTotal)} Ryos gagnés grâce aux badges. Chaque badge débloqué
          t’offre des Ryos bonus !
        </p>
        <ProgressBar className="mt-3" value={owned} max={total} gradient="from-purple-500 to-fuchsia-400" showLabel />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card-soft">
          <div className="label">Grade actuel</div>
          <div className="text-lg font-black">
            {RANKS.find((r) => r.min <= profile.ryos && profile.ryos < (RANKS[RANKS.indexOf(r) + 1]?.min ?? Infinity))?.emoji}{' '}
            {RANKS.filter((r) => r.min <= profile.ryos).slice(-1)[0]?.name}
          </div>
        </div>
        <div className="card-soft">
          <div className="label">Meilleure série de réponses</div>
          <div className="text-lg font-black">🔥 {save.stats.bestRun}</div>
        </div>
        <div className="card-soft">
          <div className="label">Jours de connexion</div>
          <div className="text-lg font-black">📅 {save.streak.days} (record {save.streak.best})</div>
        </div>
      </div>

      <div className="card">
        <SectionTitle icon="🎯" title="À débloquer bientôt" subtitle="Les badges les plus proches de tomber" />
        <div className="grid gap-2 sm:grid-cols-2">
          {nextBadges.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-xl border border-ninja-line bg-ninja-panel2/40 p-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ninja-bg/60 text-2xl grayscale">{b.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="font-bold">{b.name}</div>
                <div className="text-[11px] text-ninja-muted">{b.desc}</div>
              </div>
              {b.reward && <span className="chip !border-amber-400/40 !text-amber-200">+{b.reward} 🪙</span>}
            </div>
          ))}
          {nextBadges.length === 0 && <p className="text-sm text-emerald-300">Tous les badges sont débloqués, tu es une légende ! 🏆</p>}
        </div>
      </div>

      <div>
        <Tabs
          tabs={[
            { id: 'tous', label: 'Tous', icon: '🏅' },
            { id: 'manquants', label: 'Manquants', icon: '🔒' },
            { id: 'bronze', label: 'Bronze', icon: '🥉' },
            { id: 'argent', label: 'Argent', icon: '🥈' },
            { id: 'or', label: 'Or', icon: '🥇' },
            { id: 'legende', label: 'Légende', icon: '💎' }
          ]}
          value={filter}
          onChange={(v) => setFilter(v as typeof filter)}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => {
            const got = save.badges.includes(b.id);
            const tier = TIER_STYLE[b.tier];
            return (
              <div
                key={b.id}
                className={cx(
                  'relative overflow-hidden rounded-2xl border p-4 transition',
                  got ? 'border-amber-400/50 bg-amber-500/10' : 'border-ninja-line bg-ninja-panel/60'
                )}
              >
                <div className={cx('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', tier.color)} />
                <div className="flex items-start gap-3">
                  <div
                    className={cx(
                      'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl ring-2',
                      tier.color,
                      tier.ring,
                      !got && 'grayscale opacity-45'
                    )}
                  >
                    {got ? b.emoji : '🔒'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black">{b.name}</div>
                    <div className="text-xs text-ninja-muted">{b.desc}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <span className="chip !text-[10px]">{tier.label}</span>
                      {b.reward && <span className="chip !border-amber-400/40 !text-[10px] !text-amber-200">+{b.reward} Ryos</span>}
                      {got && <span className="chip !border-emerald-400/50 !text-[10px] !text-emerald-200">débloqué</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
