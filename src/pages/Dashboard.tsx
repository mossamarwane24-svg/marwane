import React from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../state/GameContext';
import { RankBadge } from '../components/RankBadge';
import { ProgressBar, SectionTitle, StatBox } from '../components/ui';
import { SUBJECTS, gradeLabel, subjectById } from '../data/grades';
import { challengeById } from '../data/challenges';
import { eloTier, rankProgress } from '../data/ranks';
import { cx, formatDate, formatRyos } from '../lib/format';
import { BADGES } from '../data/badges';

export const Dashboard: React.FC = () => {
  const { save, profile, dailyDefs, claimDaily, netStatus, onlineCount, communityGames, friends } = useGame();
  const { stats } = save;
  const accuracy = stats.questionsAnswered ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) : 0;
  const tier = eloTier(profile.elo);
  const { next, missing } = rankProgress(profile.ryos);

  // Maitrise par matiere a partir de l'historique
  const mastery = SUBJECTS.map((s) => {
    const entries = save.history.filter((h) => h.label.toLowerCase().includes(s.name.toLowerCase().slice(0, 4)));
    const correct = entries.reduce((sum, h) => sum + h.correct, 0);
    const total = entries.reduce((sum, h) => sum + h.total, 0);
    return { ...s, pct: total ? Math.round((correct / total) * 100) : 0, played: total };
  });

  const quickActions = [
    { to: '/quiz', icon: '📝', label: 'Entraînement', desc: 'Quiz Maths & Français', color: 'from-orange-500 to-amber-400' },
    { to: '/examen', icon: '📜', label: 'Examen Hokage', desc: '20 questions / 20', color: 'from-red-500 to-orange-400' },
    { to: '/party', icon: '🎲', label: 'Jeux à 4 joueurs', desc: 'Plateau, dé, Kahoot…', color: 'from-purple-500 to-fuchsia-400' },
    { to: '/duel', icon: '⚔️', label: 'Duel classé', desc: `ELO ${profile.elo} · ${tier.name}`, color: 'from-blue-500 to-cyan-400' },
    { to: '/kahoot', icon: '📺', label: 'Kahoot', desc: 'PIN de partie', color: 'from-pink-500 to-rose-400' },
    { to: '/defis', icon: '⚡', label: 'Défi éclair', desc: '10 questions en 10 s', color: 'from-yellow-400 to-amber-300' },
    { to: '/arcade', icon: '🎰', label: 'Arcade', desc: 'Machine à sous', color: 'from-emerald-500 to-lime-400' }
  ];

  return (
    <div className="grid gap-5">
      {/* Bandeau principal */}
      <div className="card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 text-[140px] opacity-10">{profile.avatar}</div>
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-ninja-panel2 text-4xl">
            {profile.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="h1">
              Salut <span className="gradient-text">{profile.name}</span> ! 🔥
            </h1>
            <p className="text-sm text-ninja-muted">
              {gradeLabel(profile.grade)} · difficulté {save.profile.difficulty} ·{' '}
              {netStatus === 'online' ? `${onlineCount} ninja(s) en ligne` : 'mode hors ligne (bots disponibles)'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="chip !border-amber-400/50 !text-amber-200">🪙 {formatRyos(profile.ryos)} Ryos</div>
            <div className="chip">
              {tier.emoji} {tier.name} · {profile.elo} ELO
            </div>
            <div className="chip !border-orange-400/40 !text-orange-200">
              🔥 Série {save.streak.days} jour{save.streak.days > 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className="relative mt-5">
          <RankBadge ryos={profile.ryos} size="md" />
        </div>
        {next && (
          <p className="mt-2 text-xs text-ninja-muted">
            Prochain palier dans {formatRyos(missing)} Ryos — les quiz, duels et jeux rapportent des Ryos.
          </p>
        )}
      </div>

      {/* Actions rapides */}
      <div>
        <SectionTitle icon="⚡" title="Jouer maintenant" subtitle="Tout rapporte des Ryos et fait progresser ton grade" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group relative overflow-hidden rounded-2xl border border-ninja-line bg-ninja-panel/80 p-4 transition hover:-translate-y-0.5 hover:border-amber-400/50"
            >
              <div className={cx('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', a.color)} />
              <div className="text-3xl">{a.icon}</div>
              <div className="mt-1 font-black">{a.label}</div>
              <div className="text-xs text-ninja-muted">{a.desc}</div>
              <span className="absolute bottom-4 right-4 text-ninja-muted transition group-hover:translate-x-1">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div>
        <SectionTitle icon="📊" title="Tes statistiques" subtitle="Tout est sauvegardé automatiquement" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatBox icon="📝" label="Quiz joués" value={stats.quizzesPlayed} />
          <StatBox icon="✅" label="Bonnes réponses" value={stats.correctAnswers} hint={`${accuracy} % de réussite`} />
          <StatBox icon="🎯" label="Quiz parfaits" value={stats.perfectQuizzes} />
          <StatBox icon="📜" label="Meilleur examen" value={`${stats.bestExam}/20`} />
          <StatBox icon="⚔️" label="Duels gagnés" value={`${stats.duelsWon}/${stats.duelsPlayed}`} />
          <StatBox icon="🪙" label="Ryos gagnés" value={formatRyos(stats.ryosEarnedTotal)} hint="depuis le début" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Defis du jour */}
        <div className="card">
          <SectionTitle
            icon="🎯"
            title="Défis du jour"
            subtitle={`${save.daily.claimed.length}/${dailyDefs.length} récompensés`}
            right={<Link to="/defis" className="link text-xs">tout voir</Link>}
          />
          <div className="grid gap-2">
            {dailyDefs.map((d) => {
              const progress = Math.min(save.daily.progress[d.id] || 0, d.goal);
              const done = progress >= d.goal;
              const claimed = save.daily.claimed.includes(d.id);
              return (
                <div key={d.id} className="rounded-xl border border-ninja-line bg-ninja-panel2/50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{d.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{d.label}</div>
                      <div className="text-[11px] text-ninja-muted">{d.desc}</div>
                    </div>
                    {claimed ? (
                      <span className="chip !border-emerald-400/50 !text-emerald-200">✔ pris</span>
                    ) : done ? (
                      <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => claimDaily(d.id)}>
                        +{d.reward} 🪙
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-ninja-muted">
                        {progress}/{d.goal}
                      </span>
                    )}
                  </div>
                  <ProgressBar
                    className="mt-2"
                    value={progress}
                    max={d.goal}
                    height="h-1.5"
                    gradient={done ? 'from-emerald-400 to-lime-400' : 'from-amber-400 to-orange-500'}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Maitrise par matiere */}
        <div className="card">
          <SectionTitle icon="🧠" title="Maitrise par matière" subtitle="Basée sur tes dernières parties" />
          <div className="grid gap-3">
            {mastery.map((m) => (
              <div key={m.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-bold">
                    {m.emoji} {m.name}
                  </span>
                  <span className="text-ninja-muted">
                    {m.played ? `${m.pct} %` : 'pas encore joué'}
                  </span>
                </div>
                <ProgressBar value={m.pct} gradient={`bg-gradient-to-r ${m.color}`} height="h-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Historique */}
        <div className="card">
          <SectionTitle icon="🕘" title="Dernières parties" subtitle="Historique de tes scores" right={<Link className="link text-xs" to="/profil">profil</Link>} />
          {save.history.length === 0 ? (
            <p className="text-sm text-ninja-muted">Aucune partie pour le moment. Lance ton premier quiz !</p>
          ) : (
            <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
              {save.history.slice(0, 8).map((h) => (
                <div key={h.id} className="flex items-center gap-3 rounded-xl border border-ninja-line bg-ninja-panel2/40 p-2 text-sm">
                  <span className="text-lg">
                    {h.type === 'examen' ? '📜' : h.type === 'duel' ? '⚔️' : h.type === 'party' ? '🎲' : h.type === 'kahoot' ? '📺' : '📝'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold">{h.label}</div>
                    <div className="text-[11px] text-ninja-muted">
                      {h.correct}/{h.total} · {formatDate(h.at)}
                      {h.opponent ? ` · vs ${h.opponent}` : ''}
                    </div>
                  </div>
                  <span className="font-black text-amber-300">+{h.ryos}🪙</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges + amis + communauté */}
        <div className="grid gap-4">
          <div className="card">
            <SectionTitle
              icon="🏅"
              title="Badges"
              subtitle={`${save.badges.length}/${BADGES.length} débloqués`}
              right={<Link to="/badges" className="link text-xs">voir tout</Link>}
            />
            <div className="flex flex-wrap gap-2">
              {BADGES.slice(0, 12).map((b) => {
                const owned = save.badges.includes(b.id);
                return (
                  <span
                    key={b.id}
                    title={`${b.name} — ${b.desc}`}
                    className={cx(
                      'flex h-10 w-10 items-center justify-center rounded-xl border text-xl',
                      owned ? 'border-amber-400/50 bg-amber-500/15' : 'border-ninja-line bg-ninja-panel2/40 opacity-40 grayscale'
                    )}
                  >
                    {b.emoji}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="card">
            <SectionTitle icon="🛠️" title="Jeux de la communauté" subtitle="Créés par des élèves et des parents" right={<Link to="/creer" className="link text-xs">créer</Link>} />
            <div className="grid gap-2">
              {communityGames.slice(0, 3).map((g) => (
                <Link
                  key={g.id}
                  to="/creer"
                  className="flex items-center gap-2 rounded-xl border border-ninja-line bg-ninja-panel2/40 p-2 text-sm hover:border-amber-400/40"
                >
                  <span className="text-lg">{subjectById(g.subject as never)?.emoji || '🎮'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold">{g.title}</div>
                    <div className="text-[11px] text-ninja-muted">
                      par {g.authorName} · {g.questions.length} questions · {g.plays} parties
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {(friends.incoming.length > 0 || save.friends.ids.length > 0) && (
            <div className="card">
              <SectionTitle icon="🫂" title="Tes amis ninja" subtitle={`${save.friends.ids.length} ami(s)`} right={<Link to="/amis" className="link text-xs">gérer</Link>} />
              {friends.incoming.length > 0 && (
                <p className="text-sm text-amber-200">
                  {friends.incoming.length} demande(s) d’ami en attente → <Link to="/amis" className="link">répondre</Link>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
