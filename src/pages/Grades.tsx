import React from 'react';
import { useGame } from '../state/GameContext';
import { RankBadge, RankList } from '../components/RankBadge';
import { SectionTitle, StatBox } from '../components/ui';
import { ELO_TIERS, RANKS, eloTier, rankFromRyos } from '../data/ranks';
import { cx, formatRyos } from '../lib/format';

export const GradesPage: React.FC = () => {
  const { profile, save } = useGame();
  const current = rankFromRyos(profile.ryos);
  const tier = eloTier(profile.elo);
  const unlocked = RANKS.filter((r) => profile.ryos >= r.min).length;

  return (
    <div className="grid gap-5">
      <div className="card">
        <h1 className="h1">🍥 Grades ninja</h1>
        <p className="mt-1 text-sm text-ninja-muted">
          Tu montes en grade en accumulant des <b>Ryos</b> : chaque quiz, duel, examen et partie à 4 joueurs t’en rapporte. Il y a{' '}
          {RANKS.length} grades, du simple <b>Aspirant</b> jusqu’au <b>Hokage Éternel</b>. Chaque grade débloque un bonus de gain (jusqu’à
          +30 % de Ryos).
        </p>
        <div className="mt-4">
          <RankBadge ryos={profile.ryos} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox icon="🍥" label="Grade débloqués" value={`${unlocked}/${RANKS.length}`} />
        <StatBox icon="🪙" label="Ryos actuels" value={formatRyos(profile.ryos)} />
        <StatBox icon="🏅" label="ELO" value={profile.elo} hint={tier.name} />
        <StatBox icon="📈" label="Bonus de gain" value={`+${RANKS.indexOf(current) * 2} %`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="card">
          <SectionTitle icon="📜" title="Tous les grades" subtitle="Ton grade actuel est surligné" />
          <RankList ryos={profile.ryos} />
        </div>

        <div className="grid content-start gap-4">
          <div className="card">
            <SectionTitle icon="⚔️" title="Ligues de duel (ELO)" />
            <div className="grid gap-1 text-sm">
              {ELO_TIERS.map((t) => (
                <div
                  key={t.name}
                  className={cx(
                    'flex items-center justify-between rounded-lg px-2 py-1.5',
                    profile.elo >= t.min ? 'bg-amber-500/15 text-amber-200' : 'text-ninja-muted'
                  )}
                >
                  <span>
                    {t.emoji} {t.name}
                  </span>
                  <span className="text-xs">{t.min}+</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <SectionTitle icon="💰" title="Comment gagner des Ryos ?" />
            <ul className="grid gap-1 text-sm text-ninja-muted">
              <li>📝 10 Ryos par bonne réponse (×2 en difficile)</li>
              <li>📜 15 Ryos par bonne réponse à l’Examen Hokage</li>
              <li>🎲 30 à 200 Ryos par partie multijoueur</li>
              <li>⚔️ 40+ Ryos et ~10 ELO par duel gagné</li>
              <li>🏅 Bonus de Ryos à chaque badge débloqué</li>
              <li>🎯 Défis quotidiens : jusqu’à 400 Ryos</li>
              <li>🎰 Arcade : tentatives payantes, jackpots possibles</li>
            </ul>
          </div>

          <div className="card text-xs text-ninja-muted">
            <div className="label">Série de connexion</div>
            Nous sommes le jour {save.streak.days} d’affilée 🔥 — record : {save.streak.best} jours. Reviens chaque jour pour garder ta
            série et gagner des badges.
          </div>
        </div>
      </div>
    </div>
  );
};
