import React, { useState } from 'react';
import { useGame } from '../state/GameContext';
import { AVATARS, DIFFICULTIES, GRADES, THEMES } from '../data/grades';
import { RankBadge } from '../components/RankBadge';
import { ConfirmButton, ProgressBar, SectionTitle, StatBox, Tabs } from '../components/ui';
import { RANKS, rankFromRyos } from '../data/ranks';
import { BADGES } from '../data/badges';
import { cx, formatDate, formatRyos } from '../lib/format';
import type { AnswerMode, Difficulty, GradeId } from '../types';

const AVATAR_PRICE = 250;
const THEME_PRICE = 400;

export const ProfilePage: React.FC = () => {
  const { save, profile, updateProfile, updateSettings, buyAvatar, buyTheme, setTheme, resetAll, netStatus } = useGame();
  const [tab, setTab] = useState<'profil' | 'boutique' | 'reglages' | 'historique'>('profil');
  const [name, setName] = useState(profile.name);

  const freeAvatars = AVATARS.slice(0, 4);

  return (
    <div className="grid gap-5">
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-ninja-panel2 text-5xl">
            {profile.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="h1">{profile.name}</h1>
            <p className="text-sm text-ninja-muted">
              {GRADES.find((g) => g.id === profile.grade)?.label} · difficulté {profile.difficulty} · membre depuis{' '}
              {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="chip !border-amber-400/40 !text-amber-200">🪙 {formatRyos(profile.ryos)} Ryos</span>
              <span className="chip">{rankFromRyos(profile.ryos).emoji} {rankFromRyos(profile.ryos).name}</span>
              <span className="chip">🏅 {profile.elo} ELO</span>
              <span className="chip">🔥 {save.streak.days} jours</span>
              <span className={cx('chip', netStatus === 'online' ? '!border-emerald-400/50 !text-emerald-200' : '')}>
                {netStatus === 'online' ? '📡 en ligne' : '🔌 hors ligne'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'profil', label: 'Mon profil', icon: '🧑' },
          { id: 'boutique', label: 'Boutique', icon: '🛍️' },
          { id: 'reglages', label: 'Réglages', icon: '⚙️' },
          { id: 'historique', label: 'Historique', icon: '🕘' }
        ]}
        value={tab}
        onChange={(v) => setTab(v as typeof tab)}
      />

      {tab === 'profil' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card">
            <SectionTitle icon="✏️" title="Mes informations" />
            <label className="label">Prénom / pseudo</label>
            <div className="mb-3 flex gap-2">
              <input className="input" value={name} maxLength={18} onChange={(e) => setName(e.target.value)} />
              <button
                className="btn-primary"
                onClick={() => {
                  if (name.trim().length < 2) return;
                  updateProfile({ name: name.trim() });
                }}
              >
                Enregistrer
              </button>
            </div>
            <label className="label">Ma classe</label>
            <select
              className="input mb-3"
              value={profile.grade}
              onChange={(e) => updateProfile({ grade: e.target.value as GradeId })}
            >
              {GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.emoji} {g.label}
                </option>
              ))}
            </select>
            <label className="label">Difficulté par défaut</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => updateProfile({ difficulty: d.id as Difficulty })}
                  className={cx(
                    'rounded-xl border p-2 text-sm font-bold',
                    profile.difficulty === d.id ? 'border-amber-400/70 bg-amber-500/20 text-amber-200' : 'border-ninja-line bg-ninja-panel2/50'
                  )}
                >
                  {d.emoji} {d.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid content-start gap-5">
            <div className="card">
              <RankBadge ryos={profile.ryos} size="md" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatBox icon="📝" label="Quiz" value={save.stats.quizzesPlayed} />
              <StatBox icon="📜" label="Examens" value={save.stats.examsTaken} />
              <StatBox icon="⚔️" label="Duels" value={`${save.stats.duelsWon}/${save.stats.duelsPlayed}`} />
              <StatBox icon="🎲" label="Jeux à 4" value={save.stats.partyPlayed} />
              <StatBox icon="🏅" label="Badges" value={`${save.badges.length}/${BADGES.length}`} />
              <StatBox icon="🎰" label="Tirages" value={save.stats.slotSpins} />
              <StatBox icon="🛠️" label="Jeux créés" value={save.stats.gamesPublished} />
              <StatBox icon="📅" label="Jours joués" value={save.stats.daysPlayed} />
            </div>
          </div>
        </div>
      )}

      {tab === 'boutique' && (
        <div className="grid gap-5">
          <div className="card">
            <SectionTitle
              icon="🛍️"
              title="Avatars"
              subtitle={`Solde : ${formatRyos(profile.ryos)} Ryos · les 4 premiers sont offerts`}
            />
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {AVATARS.map((a, i) => {
                const free = freeAvatars.includes(a) || i < 4;
                const owned = free || save.shop.avatars.includes(a);
                const active = profile.avatar === a;
                return (
                  <button
                    key={a}
                    onClick={() => (owned ? updateProfile({ avatar: a }) : buyAvatar(a, AVATAR_PRICE))}
                    className={cx(
                      'relative aspect-square rounded-xl border text-2xl transition',
                      active ? 'border-amber-400/80 bg-amber-500/20' : owned ? 'border-ninja-line bg-ninja-panel2/50' : 'border-ninja-line bg-ninja-bg/40 opacity-70'
                    )}
                    title={owned ? a : `${AVATAR_PRICE} Ryos`}
                  >
                    {a}
                    {!owned && <span className="absolute bottom-0 right-0 text-[9px] font-black text-amber-300">{AVATAR_PRICE}🪙</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card">
            <SectionTitle icon="🌈" title="Thèmes" subtitle={`Un thème coûte ${THEME_PRICE} Ryos`} />
            <div className="grid gap-3 sm:grid-cols-5">
              {THEMES.map((t) => {
                const owned = save.shop.themes.includes(t.id);
                const active = save.shop.theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => (owned ? setTheme(t.id) : buyTheme(t.id, THEME_PRICE))}
                    className={cx(
                      'rounded-2xl border p-3 text-left transition',
                      active ? 'border-amber-400/80 bg-amber-500/15' : 'border-ninja-line bg-ninja-panel2/40'
                    )}
                  >
                    <div className={cx('mb-2 h-10 rounded-lg bg-gradient-to-br', t.glow)} />
                    <div className="font-bold">{t.name}</div>
                    <div className="text-[11px] text-ninja-muted">{owned ? (active ? 'actif' : 'débloqué') : `${THEME_PRICE} 🪙`}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'reglages' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card">
            <SectionTitle icon="⚙️" title="Réglages du jeu" />
            {[
              { key: 'sound' as const, label: 'Effets sonores', desc: 'Sons de réussite, pièces et victoires' },
              { key: 'timer' as const, label: 'Chronomètre', desc: 'Temps limité par question (désactive pour le mode zen)' },
              { key: 'showExplanations' as const, label: 'Explications', desc: 'Affiche la correction détaillée après chaque réponse' }
            ].map((row) => (
              <div key={row.key} className="mb-3 flex items-center gap-3 rounded-xl border border-ninja-line bg-ninja-panel2/40 p-3">
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{row.label}</div>
                  <div className="text-[11px] text-ninja-muted">{row.desc}</div>
                </div>
                <button
                  onClick={() => updateSettings({ [row.key]: !save.settings[row.key] } as never)}
                  className={cx(
                    'h-7 w-12 rounded-full border transition',
                    save.settings[row.key] ? 'border-emerald-400/60 bg-emerald-500/30' : 'border-ninja-line bg-ninja-bg/70'
                  )}
                >
                  <span
                    className={cx(
                      'block h-5 w-5 translate-y-[3px] rounded-full bg-white transition',
                      save.settings[row.key] ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            ))}
            <div className="rounded-xl border border-ninja-line bg-ninja-panel2/40 p-3">
              <div className="font-bold">Mode de réponse</div>
              <div className="text-[11px] text-ninja-muted">
                « QCM ou autre » : choisis entre choix multiples, mode mixte (QCM + Vrai/Faux + réponses écrites) ou réponses écrites.
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {([
                  { id: 'qcm', label: '🔘 QCM', desc: '4 choix' },
                  { id: 'mixte', label: '🎲 Mixte', desc: 'QCM + VF + écrit' },
                  { id: 'saisie', label: '⌨️ Écrit', desc: 'taper la réponse' }
                ] as { id: AnswerMode; label: string; desc: string }[]).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => updateSettings({ answerMode: m.id })}
                    className={cx(
                      'rounded-xl border p-2 text-sm font-bold',
                      save.settings.answerMode === m.id ? 'border-amber-400/70 bg-amber-500/20 text-amber-200' : 'border-ninja-line bg-ninja-bg/50'
                    )}
                  >
                    {m.label}
                    <span className="block text-[10px] font-normal text-ninja-muted">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <SectionTitle icon="👨‍👩‍👧" title="Espace parent / enseignant" />
            <ul className="grid gap-2 text-sm text-ninja-muted">
              <li>💾 La progression est sauvegardée automatiquement dans le navigateur et synchronisée en ligne.</li>
              <li>🎓 Les questions suivent les programmes de la Maternelle (MS/GS) au collège (6ème → 3ème).</li>
              <li>🚫 Aucune donnée personnelle sensible n’est demandée : un prénom ou un pseudo suffit.</li>
              <li>✍️ Le mode créateur permet de préparer vos propres questions (5 000 Ryos à gagner par l’élève).</li>
              <li>📊 L’historique détaille les scores, utiles pour repérer les notions à revoir.</li>
            </ul>
            <div className="mt-4">
              <ConfirmButton label="🧹 Réinitialiser la progression" confirmLabel="Confirmer la remise à zéro ?" onConfirm={resetAll} />
            </div>
          </div>

          <div className="card lg:col-span-2">
            <SectionTitle icon="📡" title="Mode en ligne" subtitle="Comment jouer avec d’autres personnes ?" />
            <div className="grid gap-2 text-sm text-ninja-muted sm:grid-cols-2">
              <div className="card-soft">
                <b className="text-ninja-text">1. Lance le serveur</b>
                <p className="mt-1">
                  Dans le dossier du projet : <code className="text-amber-200">npm run dev</code> (interface) et{' '}
                  <code className="text-amber-200">npm run server</code> (temps réel).
                </p>
              </div>
              <div className="card-soft">
                <b className="text-ninja-text">2. Partage l’adresse</b>
                <p className="mt-1">Ouvre le site sur plusieurs appareils du même réseau, ou utilise la preview publique d’Arena.</p>
              </div>
              <div className="card-soft">
                <b className="text-ninja-text">3. Cherche des joueurs</b>
                <p className="mt-1">
                  Onglet « Amis & joueurs » : les ninjas connectés apparaissent en direct, tu peux les ajouter en ami et les défier.
                </p>
              </div>
              <div className="card-soft">
                <b className="text-ninja-text">4. Duels, salons, Kahoot</b>
                <p className="mt-1">Duels classés (ELO), salons de jeux à 4 avec code, et parties Kahoot avec un PIN à 6 caractères.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'historique' && (
        <div className="card">
          <SectionTitle
            icon="🕘"
            title={`Historique (${save.history.length} parties)`}
            subtitle={`Taux de réussite global : ${
              save.stats.questionsAnswered ? Math.round((save.stats.correctAnswers / save.stats.questionsAnswered) * 100) : 0
            } %`}
          />
          {save.history.length === 0 ? (
            <p className="text-sm text-ninja-muted">Aucune partie enregistrée pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-ninja-muted">
                    <th className="py-2">Date</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Partie</th>
                    <th className="py-2 text-right">Score</th>
                    <th className="py-2 text-right">Ryos</th>
                    <th className="py-2 text-right">ELO</th>
                  </tr>
                </thead>
                <tbody>
                  {save.history.map((h) => (
                    <tr key={h.id} className="border-t border-ninja-line/60">
                      <td className="py-2 text-ninja-muted">{formatDate(h.at)}</td>
                      <td className="py-2">
                        {h.type === 'quiz' ? '📝' : h.type === 'examen' ? '📜' : h.type === 'duel' ? '⚔️' : h.type === 'kahoot' ? '📺' : h.type === 'party' ? '🎲' : '🎯'}
                      </td>
                      <td className="py-2">{h.label}</td>
                      <td className="py-2 text-right font-bold">
                        {h.correct}/{h.total}
                      </td>
                      <td className="py-2 text-right text-amber-300">+{h.ryos}</td>
                      <td className={cx('py-2 text-right', (h.eloDelta || 0) >= 0 ? 'text-emerald-300' : 'text-red-300')}>
                        {h.eloDelta ? `${h.eloDelta > 0 ? '+' : ''}${h.eloDelta}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="card text-center text-xs text-ninja-muted">
        Grades possibles : {RANKS.map((r) => r.emoji).join(' ')} — {RANKS.length} paliers, du plus modeste au plus glorieux.
        <ProgressBar className="mt-3" value={save.badges.length} max={BADGES.length} gradient="from-purple-500 to-fuchsia-400" />
      </div>
    </div>
  );
};
