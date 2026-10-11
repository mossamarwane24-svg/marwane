import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../state/GameContext';
import { buildQuiz } from '../data/questions';
import { DIFFICULTIES, GRADES, SUBJECTS, gradeLabel, subjectById } from '../data/grades';
import { useQuizSession, type QuizSummary } from '../hooks/useQuizSession';
import { QuizRunner } from '../components/QuizRunner';
import { Confetti, ProgressBar, SectionTitle } from '../components/ui';
import { cx, formatRyos } from '../lib/format';
import type { AnswerMode, Difficulty, GradeId, Question, SubjectId } from '../types';

export const QuizPage: React.FC = () => {
  const { save, recordGame, toast, updateSettings } = useGame();
  const [subject, setSubject] = useState<SubjectId>('maths');
  const [grade, setGrade] = useState<GradeId>(save.profile.grade);
  const [difficulty, setDifficulty] = useState<Difficulty>(save.profile.difficulty);
  const [count, setCount] = useState(8);
  const [eclair, setEclair] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'play' | 'result'>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [summary, setSummary] = useState<QuizSummary | null>(null);
  const recorded = useRef(false);

  const start = (newQuestions?: Question[], fast = false) => {
    const list =
      newQuestions ||
      buildQuiz({
        grade,
        difficulty,
        count: fast ? 10 : count,
        subjects: [subject],
        answerMode: save.settings.answerMode
      });
    if (!newQuestions) setEclair(fast);
    else setEclair(false);
    if (!list.length) {
      toast('Aucune question disponible pour ce réglage.', 'error', '🤔');
      return;
    }
    recorded.current = false;
    setQuestions(list);
    setSummary(null);
    setPhase('play');
    // Redemarre la session : sans cela, un rejeu resterait bloque sur la fin.
    setTimeout(() => session.restart(), 0);
  };

  const session = useQuizSession({
    questions,
    difficulty,
    ryosPerCorrect: 10,
    useTimer: save.settings.timer,
    secondsOverride: eclair ? 10 : undefined,
    ryosMultiplierOverride: eclair ? 2 : undefined,
    onFinish: (s) => {
      if (recorded.current) return;
      recorded.current = true;
      setSummary(s);
      setPhase('result');
      recordGame({
        type: 'quiz',
        label: `${eclair ? 'Défi éclair · ' : ''}${subjectById(subject).name} — ${gradeLabel(grade)}`,
        subject,
        correct: s.correct,
        total: s.total,
        baseRyos: s.ryos,
        perfect: s.perfect,
        played: true
      });
    }
  });

  const subjectStats = useMemo(() => {
    return SUBJECTS.map((s) => {
      const entries = save.history.filter((h) => h.label.startsWith(s.name));
      const correct = entries.reduce((sum, h) => sum + h.correct, 0);
      const total = entries.reduce((sum, h) => sum + h.total, 0);
      return { ...s, accuracy: total ? Math.round((correct / total) * 100) : 0, played: entries.length };
    });
  }, [save.history]);

  // ------------------------------- Ecran de reglages -----------------------
  if (phase === 'setup') {
    return (
      <div className="grid gap-5">
        <div className="card">
          <h1 className="h1">📝 Entraînement ciblé</h1>
          <p className="mt-1 text-sm text-ninja-muted">
            Choisis une matière, une classe et une difficulté. Chaque bonne réponse te rapporte des Ryos, un quiz parfait te donne un
            bonus de série !
          </p>
        </div>

        <div>
          <SectionTitle icon="📚" title="Matière" subtitle="Les maths et le français sont les modules principaux" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={cx(
                  'rounded-2xl border p-4 text-left transition',
                  subject === s.id ? 'border-amber-400/80 bg-amber-500/10' : 'border-ninja-line bg-ninja-panel/70 hover:border-amber-400/40'
                )}
              >
                <div className={cx('mb-2 inline-flex rounded-lg bg-gradient-to-r px-2 py-1 text-xs font-black text-slate-950', s.color)}>
                  {s.emoji} {s.name}
                </div>
                <div className="text-xs text-ninja-muted">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card">
            <SectionTitle icon="🎓" title="Classe" />
            <select className="input" value={grade} onChange={(e) => setGrade(e.target.value as GradeId)}>
              {GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.emoji} {g.label} ({g.age})
                </option>
              ))}
            </select>
          </div>
          <div className="card">
            <SectionTitle icon="🔥" title="Difficulté" />
            <div className="grid gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={cx(
                    'flex items-center gap-2 rounded-xl border p-2 text-left text-sm',
                    difficulty === d.id ? 'border-amber-400/70 bg-amber-500/15' : 'border-ninja-line bg-ninja-panel2/50'
                  )}
                >
                  <span className="text-lg">{d.emoji}</span>
                  <span className="font-bold">{d.name}</span>
                  <span className="ml-auto text-[11px] text-ninja-muted">×{d.id === 'facile' ? 1 : d.id === 'moyen' ? 1.5 : 2} Ryos</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <SectionTitle icon="🔤" title="Mode de réponse" subtitle="« QCM ou autre » : choisis la façon de répondre" />
            <div className="grid gap-2">
              {([
                { id: 'qcm', label: 'QCM', emoji: '🔘', desc: 'Toujours 4 choix à cliquer' },
                { id: 'mixte', label: 'Mixte', emoji: '🎲', desc: 'QCM + Vrai/Faux + réponses à écrire' },
                { id: 'saisie', label: 'Réponses écrites', emoji: '⌨️', desc: 'L’élève tape sa réponse (ou Vrai/Faux)' }
              ] as { id: AnswerMode; label: string; emoji: string; desc: string }[]).map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    updateSettings({ answerMode: m.id });
                    toast(`Mode de réponse : ${m.label}`, 'info', m.emoji);
                  }}
                  className={cx(
                    'flex items-start gap-2 rounded-xl border p-2 text-left text-sm',
                    save.settings.answerMode === m.id ? 'border-amber-400/70 bg-amber-500/15' : 'border-ninja-line bg-ninja-panel2/50'
                  )}
                >
                  <span className="text-lg">{m.emoji}</span>
                  <span>
                    <span className="font-bold">{m.label}</span>
                    <span className="block text-[11px] text-ninja-muted">{m.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <SectionTitle icon="🔢" title="Nombre de questions" />
            <div className="flex gap-2">
              {[5, 8, 12, 16].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={cx(
                    'flex-1 rounded-xl border py-2 font-black',
                    count === n ? 'border-amber-400/70 bg-amber-500/20 text-amber-200' : 'border-ninja-line bg-ninja-panel2/50'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <button className="btn-primary mt-4 w-full" onClick={() => start()}>
              🚀 Lancer le quiz
            </button>
            <button className="btn-ghost mt-2 w-full" onClick={() => start(undefined, true)}>
              ⚡ Défi éclair (10 questions · 10 s chacune)
            </button>
            <p className="mt-2 text-center text-[11px] text-ninja-muted">
              {save.settings.timer ? 'Chronomètre activé' : 'Chronomètre désactivé (mode zen)'} · {count} questions
            </p>
          </div>
        </div>

        <div className="card">
          <SectionTitle icon="📈" title="Ta réussite par matière" />
          <div className="grid gap-3 sm:grid-cols-2">
            {subjectStats.map((s) => (
              <div key={s.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-bold">
                    {s.emoji} {s.name}
                  </span>
                  <span className="text-ninja-muted">{s.played ? `${s.accuracy} % (${s.played} quiz)` : 'à découvrir'}</span>
                </div>
                <ProgressBar value={s.accuracy} gradient={`bg-gradient-to-r ${s.color}`} height="h-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------- Fin du quiz -----------------------------
  if (phase === 'result' && summary) {
    const accuracy = Math.round((summary.correct / summary.total) * 100);
    return (
      <div className="grid gap-4">
        <Confetti show={summary.perfect || accuracy >= 80} />
        <div className="card text-center">
          <div className="text-5xl">{summary.perfect ? '🏆' : accuracy >= 70 ? '🎉' : accuracy >= 40 ? '💪' : '📚'}</div>
          <h1 className="h1 mt-2">
            {summary.perfect ? 'Parfait !' : accuracy >= 70 ? 'Beau travail !' : accuracy >= 40 ? 'Continue comme ça !' : 'Il faut réviser'}
          </h1>
          <p className="text-sm text-ninja-muted">
            {summary.correct} / {summary.total} bonnes réponses · {accuracy} % de réussite · meilleure série {summary.bestRun}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="stat">
              <div className="text-xl">✅</div>
              <div className="text-lg font-black">{summary.correct}</div>
              <div className="text-[11px] uppercase text-ninja-muted">Bonnes</div>
            </div>
            <div className="stat">
              <div className="text-xl">❌</div>
              <div className="text-lg font-black">{summary.wrong}</div>
              <div className="text-[11px] uppercase text-ninja-muted">Erreurs</div>
            </div>
            <div className="stat">
              <div className="text-xl">🪙</div>
              <div className="text-lg font-black">{formatRyos(summary.ryos)}</div>
              <div className="text-[11px] uppercase text-ninja-muted">Ryos</div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              className="btn-primary"
              onClick={() =>
                start(
                  buildQuiz({
                    grade,
                    difficulty,
                    count: eclair ? 10 : count,
                    subjects: [subject],
                    answerMode: save.settings.answerMode
                  }),
                  eclair
                )
              }
            >
              🔁 Rejouer
            </button>
            <button className="btn-ghost" onClick={() => setPhase('setup')}>
              ⚙️ Changer les réglages
            </button>
            <Link className="btn-ghost" to="/examen">
              📜 Examen Hokage
            </Link>
          </div>
        </div>

        <div className="card">
          <SectionTitle icon="🔍" title="Correction détaillée" subtitle="Revois chaque question pour progresser" />
          <div className="grid gap-2">
            {questions.map((q, i) => {
              const ans = session.answers[i];
              const ok = ans?.correct;
              return (
                <div
                  key={q.id}
                  className={cx('rounded-xl border p-3 text-sm', ok ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-red-500/40 bg-red-500/10')}
                >
                  <div className="font-bold">
                    {ok ? '✅' : '❌'} {q.prompt.split('\n')[0]}
                  </div>
                  <div className="mt-1 text-xs text-ninja-muted">
                    {q.format === 'vf' && `Réponse proposée : ${q.proposal} → `}
                    Bonne réponse : <b className="text-emerald-200">{q.format === 'vf' ? q.choices[q.answer] : q.choices[q.answer]}</b>
                    {ans?.typed && ` · ta réponse écrite : « ${ans.typed} »`}
                    {!ans?.typed && ans?.choice !== null && ans?.choice !== undefined && !ok && q.format !== 'vf' && ` · ton choix : ${q.choices[ans.choice]}`}
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

  // ---------------------------------- En jeu --------------------------------
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="h1">
          {subjectById(subject).emoji} {subjectById(subject).name}
        </h1>
        <button className="btn-ghost" onClick={() => setPhase('setup')}>
          ⏹ Quitter
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
          onTextAnswer={session.submitText}
          typedAnswer={session.typedAnswer}
          onNext={session.next}
          onSkip={session.skip}
          showExplanations={save.settings.showExplanations}
          isLast={session.index + 1 >= questions.length}
        />
      )}
      <button className="btn-ghost text-xs" onClick={session.skip}>
        ⏭️ Passer
      </button>
    </div>
  );
};
