import React, { useEffect, useState } from 'react';
import type { Question } from '../types';
import { cx } from '../lib/format';
import { subjectById } from '../data/grades';
import { Timer } from './ui';
import { answerHint } from '../lib/answers';

interface Props {
  question: Question;
  index: number;
  total: number;
  selected: number | null;
  revealed: boolean;
  secondsLeft?: number;
  secondsTotal?: number;
  onAnswer?: (choice: number) => void;
  /** Reponse tapee au clavier (mode saisie). */
  onTextAnswer?: (text: string) => void;
  /** Ce que l'eleve a tape, pour l'afficher dans la correction. */
  typedAnswer?: string | null;
  showExplanation?: boolean;
  disabled?: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export const QuestionCard: React.FC<Props> = ({
  question,
  index,
  total,
  selected,
  revealed,
  secondsLeft,
  secondsTotal = 30,
  onAnswer,
  onTextAnswer,
  typedAnswer,
  showExplanation = true,
  disabled
}) => {
  const subject = subjectById(question.subject);
  const format = question.format || 'qcm';
  const [typed, setTyped] = useState('');

  useEffect(() => {
    setTyped('');
  }, [question.id]);

  const submitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (revealed || !typed.trim()) return;
    onTextAnswer?.(typed);
  };

  // En mode saisie, la session encode 0 = bonne réponse, -1 = erreur.
  const isGoodPick = format === 'input' ? selected === 0 : selected === question.answer;

  const badge =
    format === 'vf' ? { text: 'Vrai ou Faux', cls: 'from-purple-500 to-fuchsia-400' } : format === 'input' ? { text: 'Réponse à écrire', cls: 'from-emerald-500 to-lime-400' } : { text: 'Choix multiples', cls: 'from-slate-500 to-slate-400' };

  return (
    <div className="card animate-pop">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cx('rounded-lg bg-gradient-to-r px-2 py-1 text-xs font-black text-slate-950', subject.color)}>
            {subject.emoji} {subject.name}
          </span>
          <span className={cx('rounded-lg bg-gradient-to-r px-2 py-1 text-xs font-black text-slate-950', badge.cls)}>{badge.text}</span>
          <span className="chip">
            Question {index + 1}/{total}
          </span>
        </div>
        {typeof secondsLeft === 'number' && secondsTotal > 0 && <Timer seconds={secondsLeft} total={secondsTotal} />}
      </div>

      <p className="mb-4 whitespace-pre-line text-lg font-bold leading-snug sm:text-xl">{question.prompt}</p>

      {/* ---------------------------- VRAI / FAUX ---------------------------- */}
      {format === 'vf' && (
        <>
          <div className="mb-3 rounded-2xl border border-purple-400/40 bg-purple-500/10 p-4 text-center">
            <div className="text-[11px] uppercase tracking-widest text-ninja-muted">Réponse proposée</div>
            <div className="mt-1 text-2xl font-black">{question.proposal}</div>
            <div className="mt-1 text-xs text-ninja-muted">Cette réponse est-elle correcte ?</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['✅ Vrai', '❌ Faux'].map((label, i) => {
              const isCorrect = i === question.answer;
              const isPicked = selected === i;
              return (
                <button
                  key={label}
                  disabled={disabled || revealed}
                  onClick={() => onAnswer?.(i)}
                  className={cx(
                    'rounded-2xl border-2 p-5 text-xl font-black transition active:scale-[.97]',
                    !revealed && i === 0 && 'border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20',
                    !revealed && i === 1 && 'border-red-400/50 bg-red-500/10 hover:bg-red-500/20',
                    revealed && isCorrect && 'border-emerald-400/80 bg-emerald-500/25',
                    revealed && isPicked && !isCorrect && 'animate-shake border-red-400/80 bg-red-500/25',
                    revealed && !isCorrect && !isPicked && 'border-ninja-line bg-ninja-panel2/30 opacity-60'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ----------------------------- SAISIE ------------------------------- */}
      {format === 'input' && (
        <form onSubmit={submitTyped} className="grid gap-3">
          <div className="relative">
            <input
              className={cx(
                'input text-center text-2xl font-black',
                revealed && selected === 0 && '!border-emerald-400/70',
                revealed && selected !== 0 && '!border-red-400/70'
              )}
              placeholder="Ta réponse…"
              value={revealed ? typedAnswer || typed : typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={disabled || revealed}
              autoFocus
              inputMode={/^\s*-?\d/.test(question.choices[question.answer]) ? 'decimal' : 'text'}
              autoComplete="off"
              spellCheck={false}
              aria-label="Ta réponse"
            />
            {!revealed && <span className="absolute -bottom-5 left-1 text-[11px] text-ninja-muted">{answerHint(question.choices[question.answer])}</span>}
          </div>
          {!revealed && (
            <button type="submit" className="btn-primary mt-4 !py-3 text-base" disabled={!typed.trim()}>
              ✅ Valider ma réponse
            </button>
          )}
        </form>
      )}

      {/* ------------------------------- QCM -------------------------------- */}
      {format === 'qcm' && (
        <div className="grid gap-2">
          {question.choices.map((choice, i) => {
            const isCorrect = i === question.answer;
            const isPicked = selected === i;
            return (
              <button
                key={`${question.id}-${i}`}
                disabled={disabled || revealed}
                onClick={() => onAnswer?.(i)}
                className={cx(
                  'flex items-center gap-3 rounded-xl border p-3 text-left font-semibold transition',
                  !revealed && 'border-ninja-line bg-ninja-panel2/60 hover:border-amber-400/60 hover:bg-ninja-panel2',
                  revealed && isCorrect && 'border-emerald-400/70 bg-emerald-500/20',
                  revealed && isPicked && !isCorrect && 'animate-shake border-red-400/70 bg-red-500/20',
                  revealed && !isCorrect && !isPicked && 'border-ninja-line bg-ninja-panel2/30 opacity-60'
                )}
              >
                <span
                  className={cx(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black',
                    revealed && isCorrect ? 'bg-emerald-400 text-slate-950' : revealed && isPicked ? 'bg-red-400 text-slate-950' : 'bg-ninja-bg/80'
                  )}
                >
                  {LETTERS[i]}
                </span>
                <span>{choice}</span>
                {revealed && isCorrect && <span className="ml-auto">✅</span>}
                {revealed && isPicked && !isCorrect && <span className="ml-auto">❌</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* ---------------------------- CORRECTION ---------------------------- */}
      {revealed && showExplanation && (
        <div
          className={cx(
            'mt-3 rounded-xl border p-3 text-sm',
            isGoodPick ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-amber-400/50 bg-amber-500/10'
          )}
        >
          <div className="font-black">
            {isGoodPick
              ? format === 'vf'
                ? '🎉 Bien vu !'
                : '🎉 Bravo, bonne réponse !'
              : format === 'vf'
                ? `💡 Il fallait répondre « ${question.choices[question.answer]} »`
                : `💡 La bonne réponse était : ${question.choices[question.answer]}`}
          </div>
          {format === 'input' && typedAnswer && (
            <div className="mt-1 text-ninja-muted">
              Ta réponse : <b>{typedAnswer}</b>
            </div>
          )}
          {question.explanation && <div className="mt-1 text-ninja-muted">{question.explanation}</div>}
        </div>
      )}
    </div>
  );
};
