import React, { useMemo, useRef, useState } from 'react';
import { useGame } from '../state/GameContext';
import { ProgressBar, SectionTitle, StatBox } from '../components/ui';
import { QuizRunner } from '../components/QuizRunner';
import { useQuizSession } from '../hooks/useQuizSession';
import { buildDailyQuiz } from '../data/questions';
import { dailySelection } from '../data/challenges';
import { cx, formatDay, formatRyos, todayKey } from '../lib/format';
import type { Question } from '../types';

export const ChallengesPage: React.FC = () => {
  const { save, profile, dailyDefs, claimDaily, recordGame, toast } = useGame();
  const [dailyQuiz, setDailyQuiz] = useState<Question[] | null>(null);
  const [mode, setMode] = useState<'jour' | 'eclair'>('jour');
  const recorded = useRef(false);
  const today = todayKey();

  // Statistiques des 7 derniers jours
  const week = useMemo(() => {
    const since = Date.now() - 7 * 86400000;
    const entries = save.history.filter((h) => h.at >= since);
    const correct = entries.reduce((s, h) => s + h.correct, 0);
    const total = entries.reduce((s, h) => s + h.total, 0);
    const ryos = entries.reduce((s, h) => s + h.ryos, 0);
    return { entries, correct, total, ryos, accuracy: total ? Math.round((correct / total) * 100) : 0 };
  }, [save.history]);

  const allDone = dailyDefs.filter((d) => (save.daily.progress[d.id] || 0) >= d.goal).length;
  const allClaimed = dailyDefs.every((d) => save.daily.claimed.includes(d.id));

  const session = useQuizSession({
    questions: dailyQuiz || [],
    difficulty: profile.difficulty,
    ryosPerCorrect: 20,
    useTimer: true,
    secondsOverride: mode === 'eclair' ? 10 : undefined,
    onFinish: (s) => {
      if (recorded.current) return;
      recorded.current = true;
      recordGame({
        type: 'defi',
        label: mode === 'eclair' ? 'Défi éclair — 10 questions en 10 secondes' : 'Défi du jour (Ryos doublés)',
        eclair: mode === 'eclair',
        subject: 'maths',
        correct: s.correct,
        total: s.total,
        baseRyos: s.ryos,
        perfect: s.perfect
      });
      toast(`${mode === 'eclair' ? 'Défi éclair' : 'Défi du jour'} terminé : ${s.correct}/${s.total} !`, 'reward', mode === 'eclair' ? '⚡' : '🎯');
    }
  });

  const startDaily = () => {
    recorded.current = false;
    setMode('jour');
    const list = buildDailyQuiz(profile.grade, 6, save.settings.answerMode);
    setDailyQuiz(list);
    setTimeout(() => session.restart(), 0);
    toast('Défi du jour lancé : 6 questions, Ryos ×2 !', 'info', '🎯');
  };

  const startEclair = () => {
    recorded.current = false;
    setMode('eclair');
    const list = buildDailyQuiz(profile.grade, 10, save.settings.answerMode);
    setDailyQuiz(list);
    setTimeout(() => session.restart(), 0);
    toast('Défi éclair : 10 questions, 10 secondes chacune, Ryos ×2 !', 'info', '⚡');
  };

  if (dailyQuiz) {
    return (
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="h1">{mode === 'eclair' ? '⚡ Défi éclair' : '🎯 Défi du jour'}</h1>
          <button
            className="btn-ghost"
            onClick={() => {
              setDailyQuiz(null);
              recorded.current = false;
            }}
          >
            ← Retour
          </button>
        </div>
        {session.finished ? (
          <div className="card text-center">
            <div className="text-5xl">{mode === 'eclair' ? '⚡' : '🎯'}</div>
            <h2 className="h2 mt-2">
              {session.correct}/{dailyQuiz.length} — {session.ryos} Ryos gagnés (×2) !
            </h2>
            <p className="text-sm text-ninja-muted">
              {mode === 'eclair'
                ? '10 secondes par question : les Ryos sont doublés. Entraîne-toi à répondre vite !'
                : 'Reviens demain pour un nouveau défi. Ta série de jours continue !'}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button className="btn-primary" onClick={mode === 'eclair' ? startEclair : startDaily}>
                🔁 Rejouer {mode === 'eclair' ? 'le défi éclair' : 'le défi'}
              </button>
              <button className="btn-ghost" onClick={() => setDailyQuiz(null)}>
                📋 Voir mes défis
              </button>
            </div>
          </div>
        ) : session.current ? (
          <QuizRunner
            question={session.current}
            index={session.index}
            total={dailyQuiz.length}
            selected={session.selected}
            revealed={session.revealed}
            secondsLeft={session.secondsLeft}
            secondsTotal={session.totalSeconds}
            correct={session.correct}
            wrong={session.wrong}
            streak={session.streak}
            answerCount={session.answers.length}
            onAnswer={session.choose}
            onTextAnswer={session.submitText}
            typedAnswer={session.typedAnswer}
            onNext={session.next}
            onSkip={session.skip}
            isLast={session.index + 1 >= dailyQuiz.length}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="card">
        <h1 className="h1">🎯 Défis et récompenses</h1>
        <p className="mt-1 text-sm text-ninja-muted">
          Chaque jour, 4 défis tirés au sort te rapportent des Ryos bonus. Reviens tous les jours pour faire grandir ta série 🔥 et
          débloquer les badges de fidélité.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox icon="🔥" label="Série actuelle" value={`${save.streak.days} j`} hint={`record ${save.streak.best} j`} />
          <StatBox icon="✅" label="Défis réussis" value={`${allDone}/${dailyDefs.length}`} />
          <StatBox icon="🪙" label="Ryos de la semaine" value={formatRyos(week.ryos)} />
          <StatBox icon="📅" label="Jour" value={formatDay(today)} />
        </div>
      </div>

      <div className="card">
        <SectionTitle icon="🎯" title="Défis du jour" subtitle={allClaimed ? 'Tous les défis sont récompensés, bravo !' : `${save.daily.claimed.length}/${dailyDefs.length} récompenses récupérées`} />
        <div className="grid gap-3 sm:grid-cols-2">
          {dailyDefs.map((d) => {
            const progress = Math.min(save.daily.progress[d.id] || 0, d.goal);
            const done = progress >= d.goal;
            const claimed = save.daily.claimed.includes(d.id);
            return (
              <div
                key={d.id}
                className={cx(
                  'rounded-2xl border p-4',
                  claimed ? 'border-emerald-400/40 bg-emerald-500/10' : done ? 'border-amber-400/60 bg-amber-500/10' : 'border-ninja-line bg-ninja-panel2/40'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{d.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-black">{d.label}</div>
                    <div className="text-xs text-ninja-muted">{d.desc}</div>
                  </div>
                </div>
                <ProgressBar
                  className="mt-3"
                  value={progress}
                  max={d.goal}
                  gradient={done ? 'from-emerald-400 to-lime-400' : 'from-amber-400 to-orange-500'}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-ninja-muted">
                    {progress}/{d.goal}
                  </span>
                  {claimed ? (
                    <span className="chip !border-emerald-400/50 !text-emerald-200">✔ récupéré</span>
                  ) : done ? (
                    <button className="btn-primary !px-3 !py-1.5 text-xs animate-pulseRing" onClick={() => claimDaily(d.id)}>
                      🎁 Récupérer +{d.reward}
                    </button>
                  ) : (
                    <span className="text-xs text-amber-200">+{d.reward} Ryos</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card">
          <SectionTitle icon="⚡" title="Défi du jour spécial" subtitle="6 questions, Ryos ×2 — réussi = bonus assuré" />
          <div className="flex items-center gap-4">
            <div className="text-5xl floaty">🎯</div>
            <div className="flex-1">
              <p className="text-sm text-ninja-muted">
                Un défi rapide généré pour ta classe ({profile.grade}) : maths et français mélangés, avec le chrono. Idéal pour garder ta
                série de jours !
              </p>
              <button className="btn-primary mt-3" onClick={startDaily}>
                🚀 Lancer le défi du jour
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <SectionTitle icon="⚡" title="Défi éclair — 10 secondes" subtitle="10 questions, 10 secondes chacune, Ryos ×2" />
          <div className="flex items-center gap-4">
            <div className="text-5xl floaty">⚡</div>
            <div className="flex-1">
              <p className="text-sm text-ninja-muted">
                Le mode le plus rapide de l’Académie : réponds en moins de 10 secondes à chaque question. Parfait pour réviser les
                automatismes (tables, conjugaison, calcul mental) et décrocher le badge « Série de 10 » !
              </p>
              <button className="btn-blue mt-3" onClick={startEclair}>
                ⚡ Lancer le défi éclair
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <SectionTitle icon="📈" title="Ta semaine" subtitle="7 derniers jours" />
          <div className="grid grid-cols-3 gap-3">
            <StatBox icon="📝" label="Parties" value={week.entries.length} />
            <StatBox icon="🎯" label="Réussite" value={`${week.accuracy} %`} />
            <StatBox icon="🪙" label="Ryos" value={formatRyos(week.ryos)} />
          </div>
          <div className="mt-4 grid gap-1">
            {Array.from({ length: 7 }, (_, i) => {
              const day = new Date();
              day.setDate(day.getDate() - (6 - i));
              const key = day.toISOString().slice(0, 10);
              const entries = save.history.filter((h) => new Date(h.at).toISOString().slice(0, 10) === key);
              const total = entries.reduce((s, h) => s + h.correct, 0);
              return (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-ninja-muted">
                    {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ninja-bg/70">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${Math.min(100, total * 8)}%` }} />
                  </div>
                  <span className="w-14 text-right font-bold text-ninja-muted">{total} ✅</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <SectionTitle icon="🔮" title="Défis à venir" subtitle="Ils tournent automatiquement chaque jour" />
        <div className="flex flex-wrap gap-2">
          {dailySelection(todayKey() + '-demain')
            .filter((d) => !dailyDefs.some((x) => x.id === d.id))
            .map((d) => (
              <span key={d.id} className="chip">
                {d.emoji} {d.label} · +{d.reward}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};
