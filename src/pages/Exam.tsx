import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../state/GameContext';
import { buildExam } from '../data/questions';
import { gradeLabel } from '../data/grades';
import { useQuizSession, type QuizSummary } from '../hooks/useQuizSession';
import { QuizRunner } from '../components/QuizRunner';
import { Confetti, ProgressBar, SectionTitle } from '../components/ui';
import { RANKS } from '../data/ranks';
import { cx, formatRyos } from '../lib/format';
import type { Question } from '../types';

const VERDICT = (score: number, total: number) => {
  const pct = (score / total) * 100;
  if (pct >= 100) return { emoji: '🔥', title: 'HOKAGE !', text: 'Sans faute : tu es une légende de Konoha.' };
  if (pct >= 85) return { emoji: '🗻', title: 'Rang Kage', text: 'Impressionnant, tu maîtrises ton programme.' };
  if (pct >= 70) return { emoji: '⚔️', title: 'Rang Jonin', text: 'Très bon niveau, encore un petit effort !' };
  if (pct >= 55) return { emoji: '🏅', title: 'Rang Chunin', text: 'Bien joué, continue l’entraînement.' };
  if (pct >= 40) return { emoji: '🎒', title: 'Rang Genin', text: 'C’est un bon début, révise et retente !' };
  return { emoji: '🌱', title: 'Rang Aspirant', text: 'Pas de panique : entraîne-toi et reviens plus fort.' };
};

export const ExamPage: React.FC = () => {
  const { save, profile, recordGame, toast } = useGame();
  const [phase, setPhase] = useState<'intro' | 'play' | 'result'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [summary, setSummary] = useState<QuizSummary | null>(null);
  const recorded = useRef(false);

  const begin = () => {
    const list = buildExam(profile.grade, profile.difficulty);
    recorded.current = false;
    setQuestions(list);
    setSummary(null);
    setPhase('play');
    toast('Examen Hokage lancé : 20 questions, note sur 20. Bonne chance !', 'info', '📜');
  };

  const session = useQuizSession({
    questions,
    difficulty: profile.difficulty,
    ryosPerCorrect: 15,
    useTimer: save.settings.timer,
    onFinish: (s) => {
      if (recorded.current) return;
      recorded.current = true;
      setSummary(s);
      setPhase('result');
      recordGame({
        type: 'examen',
        label: `Examen Hokage — ${gradeLabel(profile.grade)}`,
        correct: s.correct,
        total: s.total,
        baseRyos: s.ryos,
        perfect: s.perfect
      });
    }
  });

  if (phase === 'intro') {
    return (
      <div className="grid gap-4">
        <div className="card relative overflow-hidden text-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent" />
          <div className="relative">
            <div className="text-6xl floaty">📜</div>
            <h1 className="h1 mt-2">Examen Hokage</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-ninja-muted">
              Le défi ultime : <b className="text-ninja-fg">20 questions</b> mélangeant maths, français et culture, notées{' '}
              <b className="text-ninja-fg">sur 20</b>. Chaque bonne réponse rapporte <b className="text-amber-300">15 Ryos</b> (jusqu’à ×2 en
              difficile). Ton meilleur score est conservé.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="stat">
                <div className="text-xl">🎓</div>
                <div className="font-black">{gradeLabel(profile.grade)}</div>
                <div className="text-[11px] uppercase text-ninja-muted">Ton niveau</div>
              </div>
              <div className="stat">
                <div className="text-xl">📜</div>
                <div className="font-black">{save.stats.bestExam}/20</div>
                <div className="text-[11px] uppercase text-ninja-muted">Meilleur score</div>
              </div>
              <div className="stat">
                <div className="text-xl">🔁</div>
                <div className="font-black">{save.stats.examsTaken}</div>
                <div className="text-[11px] uppercase text-ninja-muted">Examens passés</div>
              </div>
            </div>
            <button className="btn-primary mt-5 !px-8 !py-3 text-base" onClick={begin}>
              🔥 Commencer l’examen
            </button>
          </div>
        </div>

        <div className="card">
          <SectionTitle icon="🍥" title="Ce que l’examen débloque" subtitle="Plus ton score est élevé, plus ton grade grimpe vite" />
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { score: '20/20', badge: '🏆 Badge Hokage Parfait (+1000 Ryos)' },
              { score: '15/20 et +', badge: '🏅 Badge « Presque Hokage » (+150 Ryos)' },
              { score: '10/20 et +', badge: '📜 Badge « Examen Réussi » (+50 Ryos)' },
              { score: 'Tous les jours', badge: '🎯 Défi quotidien « 1 Examen Hokage » (+200 Ryos)' }
            ].map((r) => (
              <div key={r.score} className="flex items-center gap-2 rounded-xl border border-ninja-line bg-ninja-panel2/50 p-3 text-sm">
                <span className="font-black text-amber-300">{r.score}</span>
                <span className="text-ninja-muted">{r.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result' && summary) {
    const verdict = VERDICT(summary.correct, summary.total);
    const pct = Math.round((summary.correct / summary.total) * 100);
    const rank = RANKS[Math.min(RANKS.length - 1, Math.floor((summary.correct / summary.total) * (RANKS.length - 1)))];
    return (
      <div className="grid gap-4">
        <Confetti show={pct >= 70} count={60} />
        <div className="card text-center">
          <div className="text-6xl">{verdict.emoji}</div>
          <h1 className="mt-2 text-4xl font-black gradient-text">{summary.correct} / {summary.total}</h1>
          <div className="mt-1 text-lg font-black">{verdict.title}</div>
          <p className="text-sm text-ninja-muted">{verdict.text}</p>
          <div className="mx-auto mt-4 max-w-md">
            <ProgressBar value={pct} gradient="from-red-500 via-orange-500 to-amber-400" height="h-3" showLabel />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="stat">
              <div className="text-xl">🪙</div>
              <div className="font-black">+{formatRyos(summary.ryos)}</div>
              <div className="text-[11px] uppercase text-ninja-muted">Ryos</div>
            </div>
            <div className="stat">
              <div className="text-xl">{rank.emoji}</div>
              <div className="font-black">{rank.name}</div>
              <div className="text-[11px] uppercase text-ninja-muted">Niveau atteint</div>
            </div>
            <div className="stat">
              <div className="text-xl">🎯</div>
              <div className="font-black">{pct} %</div>
              <div className="text-[11px] uppercase text-ninja-muted">Réussite</div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button className="btn-primary" onClick={begin}>
              🔁 Repasser l’examen
            </button>
            <Link className="btn-ghost" to="/quiz">
              📝 M’entraîner d’abord
            </Link>
            <Link className="btn-ghost" to="/classement">
              🏆 Classement
            </Link>
          </div>
        </div>

        <div className="card">
          <SectionTitle icon="🔍" title="Correction complète" subtitle="20 questions, 20 explications" />
          <div className="grid gap-2">
            {questions.map((q, i) => {
              const ok = session.answers[i]?.correct;
              return (
                <div
                  key={q.id}
                  className={cx('rounded-xl border p-3 text-sm', ok ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-red-500/40 bg-red-500/10')}
                >
                  <div className="font-bold">
                    {i + 1}. {ok ? '✅' : '❌'} {q.prompt.split('\n')[0]}
                  </div>
                  <div className="mt-1 text-xs text-ninja-muted">
                    Bonne réponse : <b className="text-emerald-200">{q.choices[q.answer]}</b>
                    {q.explanation && ` — ${q.explanation}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="h1">📜 Examen Hokage</h1>
        <button className="btn-ghost" onClick={() => setPhase('intro')}>
          ⏹ Abandonner
        </button>
      </div>
      {session.current && (
        <QuizRunner
          question={session.current}
          index={session.index}
          total={questions.length}
          selected={session.selected}
          revealed={session.revealed}
          secondsLeft={session.secondsLeft}
          secondsTotal={session.totalSeconds}
          correct={session.correct}
          wrong={session.wrong}
          streak={session.streak}
          answerCount={session.answers.length}
          onAnswer={session.choose}
          onNext={session.next}
          showExplanations={save.settings.showExplanations}
          isLast={session.index + 1 >= questions.length}
        />
      )}
    </div>
  );
};
