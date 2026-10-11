import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Question } from '../types';
import { useGame } from '../state/GameContext';
import { SectionTitle } from '../components/ui';
import { QuizRunner } from '../components/QuizRunner';
import { useQuizSession } from '../hooks/useQuizSession';
import { subjectById } from '../data/grades';
import { errorsBySubject, fromStored, masteredErrors, pendingErrors, type ErrorEntry } from '../lib/errors';
import { cx, formatRyos } from '../lib/format';

/** Cahier d'erreurs : on rejoue les questions ratees jusqu'à les maîtriser. */
export const ErrorsPage: React.FC = () => {
  const { save, reviewError, recordGame, toast } = useGame();
  const [revision, setRevision] = useState<ErrorEntry[] | null>(null);
  const [result, setResult] = useState<{ correct: number; total: number; ryos: number } | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const recorded = useRef(false);

  const pending = useMemo(() => pendingErrors(save.errors || [], 200), [save.errors]);
  const mastered = useMemo(() => masteredErrors(save.errors || []), [save.errors]);
  const bySubject = useMemo(() => errorsBySubject(save.errors || []), [save.errors]);

  const questions: Question[] = useMemo(
    () => (revision || []).map((e) => fromStored(e.question, e.id)),
    [revision]
  );

  const finish = useCallback(
    (summary: { correct: number; total: number; ryos: number }) => {
      if (recorded.current) return;
      recorded.current = true;
      setResult({ correct: summary.correct, total: summary.total, ryos: summary.ryos });
      setRevision(null);
      recordGame({
        type: 'revision',
        label: `Révision du cahier d'erreurs (${summary.total} questions)`,
        correct: summary.correct,
        total: summary.total,
        baseRyos: summary.ryos,
        perfect: summary.correct === summary.total,
        played: true
      });
      toast(
        summary.correct === summary.total ? 'Toutes tes erreurs sont corrigées, bravo !' : 'Révision terminée, continue !',
        'reward',
        '📕'
      );
    },
    [recordGame, toast]
  );

  const session = useQuizSession({
    questions,
    difficulty: save.profile.difficulty,
    ryosPerCorrect: 15,
    useTimer: save.settings.timer,
    onFinish: finish
  });

  /** Lance une serie de revision avec un maximum de 10 erreurs. */
  const start = () => {
    const list = pendingErrors(save.errors || [], 10);
    if (!list.length) {
      toast('Aucune erreur à revoir pour le moment, bravo !', 'info', '🎉');
      return;
    }
    recorded.current = false;
    setResult(null);
    setRevision(list);
    setTimeout(() => session.restart(), 0);
  };

  useEffect(() => {
    if (revision && !questions.length) setRevision(null);
  }, [revision, questions.length]);

  // ----------------------------- Mode revision -----------------------------
  if (revision && questions.length) {
    if (session.current) {
      return (
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h1 className="h1">📕 Révision de mes erreurs</h1>
            <button className="btn-ghost" onClick={() => setRevision(null)}>
              ⏹ Quitter
            </button>
          </div>
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
            onAnswer={(choice) => {
              // Une bonne reponse => l'erreur progresse vers la maitrise.
              reviewError(session.current!.id, choice === session.current!.answer);
              session.choose(choice);
            }}
            onNext={session.next}
            onSkip={session.skip}
            showExplanations
            isLast={session.index + 1 >= questions.length}
          />
          <p className="text-center text-xs text-ninja-muted">
            Deux bonnes réponses sur la même question et elle quitte le cahier ✅ (une erreur remet le compteur à zéro)
          </p>
        </div>
      );
    }
    return (
      <div className="card text-center">
        <p>Révision terminée…</p>
        <button className="btn-primary mt-3" onClick={() => setRevision(null)}>
          Retour au cahier
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="card">
        <h1 className="h1">📕 Cahier d’erreurs</h1>
        <p className="mt-1 text-sm text-ninja-muted">
          Chaque question ratée en quiz, examen ou défi est rangée ici. Rejoue-la : après{' '}
          <b>deux révisions réussies</b>, la notion est considérée comme acquise et sort du cahier (une nouvelle erreur
          remet le compteur à zéro).
        </p>
      </div>

      {result && (
        <div className="card animate-pop text-center">
          <div className="text-4xl">{result.correct === result.total ? '🏆' : result.correct > 0 ? '💪' : '📚'}</div>
          <p className="mt-1 font-black">
            {result.correct} / {result.total} bonnes réponses · {formatRyos(result.ryos)} gagnés
          </p>
          <p className="text-xs text-ninja-muted">
            Les questions réussies se rapprochent de la maîtrise ; les autres restent au cahier.
          </p>
          <button className="btn-primary mt-3" onClick={() => setResult(null)}>
            👍 Compris
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="grid content-start gap-3">
          <div className="card text-center">
            <div className="text-5xl floaty">📕</div>
            <div className="mt-1 text-3xl font-black">{pending.length}</div>
            <div className="text-xs text-ninja-muted">question(s) à revoir</div>
            <button className="btn-primary mt-3 w-full" onClick={start} disabled={!pending.length}>
              🔁 Réviser mes erreurs
            </button>
            <p className="mt-2 text-[11px] text-ninja-muted">
              Série de 10 questions maximum, 15 Ryos par bonne réponse.
            </p>
          </div>

          <div className="card">
            <SectionTitle icon="📊" title="Par matière" />
            {bySubject.length === 0 && <p className="text-sm text-ninja-muted">Aucune erreur enregistrée 🎉</p>}
            <div className="grid gap-2">
              {bySubject.map((row) => {
                const s = subjectById(row.subject);
                return (
                  <div key={row.subject} className="flex items-center gap-2 text-sm">
                    <span className="w-24 shrink-0">
                      {s.emoji} {s.name}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ninja-bg">
                      <div
                        className={cx('h-full bg-gradient-to-r', s.color)}
                        style={{ width: `${Math.min(100, (row.count / Math.max(1, pending.length)) * 100)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-bold">{row.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <SectionTitle icon="✅" title="Notions maîtrisées" subtitle={`${mastered.length} question(s) acquise(s)`} />
            {mastered.length === 0 ? (
              <p className="text-sm text-ninja-muted">Réponds bien deux fois à une erreur pour l’acquérir.</p>
            ) : (
              <div className="grid gap-1">
                {mastered.slice(0, 6).map((e) => (
                  <div key={e.id} className="truncate text-xs text-ninja-muted">
                    ✅ {e.question.prompt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <SectionTitle icon="🔁" title="À revoir" subtitle="Clique sur une question pour voir la correction" />
          {pending.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-4xl">🎊</div>
              <p className="mt-2 font-bold">Ton cahier est vide !</p>
              <p className="text-sm text-ninja-muted">
                Soit tu n’as rien raté, soit tu as tout révisé. Continue les quiz pour garder ce rythme.
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {pending.slice(0, 40).map((e) => {
                const s = subjectById(e.question.subject);
                const open = openError === e.id;
                return (
                  <div key={e.id} className="rounded-xl border border-ninja-line bg-ninja-panel2/40 p-3">
                    <button className="flex w-full items-start gap-2 text-left" onClick={() => setOpenError(open ? null : e.id)}>
                      <span className="chip shrink-0 !text-[10px]">
                        {s.emoji} {s.name}
                      </span>
                      <span className="flex-1 text-sm font-semibold">{e.question.prompt}</span>
                      <span className="shrink-0 text-xs text-ninja-muted">
                        {e.fixedCount > 0 ? `1/2 ✅` : `ratée ${e.wrongCount}×`}
                      </span>
                    </button>
                    {open && (
                      <div className="mt-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-2 text-sm">
                        <div className="font-bold">✅ {e.question.choices[e.question.answer]}</div>
                        {e.question.explanation && (
                          <div className="text-xs text-ninja-muted">{e.question.explanation}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {pending.length > 40 && (
                <p className="text-center text-xs text-ninja-muted">… et {pending.length - 40} autre(s) erreur(s).</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
