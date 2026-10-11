import React from 'react';
import type { Question } from '../types';
import { cx } from '../lib/format';
import { subjectById } from '../data/grades';
import { Timer } from './ui';

interface Props {
  question: Question;
  index: number;
  total: number;
  selected: number | null;
  revealed: boolean;
  secondsLeft?: number;
  secondsTotal?: number;
  onAnswer?: (choice: number) => void;
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
  showExplanation = true,
  disabled
}) => {
  const subject = subjectById(question.subject);
  return (
    <div className="card animate-pop">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cx('rounded-lg bg-gradient-to-r px-2 py-1 text-xs font-black text-slate-950', subject.color)}>
            {subject.emoji} {subject.name}
          </span>
          <span className="chip">
            Question {index + 1}/{total}
          </span>
        </div>
        {typeof secondsLeft === 'number' && secondsTotal > 0 && <Timer seconds={secondsLeft} total={secondsTotal} />}
      </div>

      <p className="mb-4 whitespace-pre-line text-lg font-bold leading-snug sm:text-xl">{question.prompt}</p>

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

      {revealed && showExplanation && (
        <div
          className={cx(
            'mt-3 rounded-xl border p-3 text-sm',
            selected === question.answer ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-amber-400/50 bg-amber-500/10'
          )}
        >
          <div className="font-black">
            {selected === question.answer ? '🎉 Bravo, bonne réponse !' : `💡 La bonne réponse était : ${question.choices[question.answer]}`}
          </div>
          {question.explanation && <div className="mt-1 text-ninja-muted">{question.explanation}</div>}
        </div>
      )}
    </div>
  );
};
