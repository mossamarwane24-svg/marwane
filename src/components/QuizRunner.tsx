import React from 'react';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ui';
import { cx } from '../lib/format';
import type { Question } from '../types';

interface Props {
  question: Question;
  index: number;
  total: number;
  selected: number | null;
  revealed: boolean;
  secondsLeft: number;
  secondsTotal: number;
  correct: number;
  wrong: number;
  streak: number;
  answerCount: number;
  onAnswer: (choice: number) => void;
  onNext: () => void;
  onSkip?: () => void;
  showExplanations?: boolean;
  nextLabel?: string;
  isLast?: boolean;
}

export const QuizRunner: React.FC<Props> = ({
  question,
  index,
  total,
  selected,
  revealed,
  secondsLeft,
  secondsTotal,
  correct,
  wrong,
  streak,
  answerCount,
  onAnswer,
  onNext,
  onSkip,
  showExplanations = true,
  nextLabel,
  isLast
}) => (
  <div className="grid gap-3">
    <div className="flex flex-wrap items-center gap-3">
      <div className="min-w-[160px] flex-1">
        <ProgressBar value={index} max={total} />
      </div>
      <span className="chip !border-emerald-400/40 !text-emerald-200">✅ {correct}</span>
      <span className="chip !border-red-400/40 !text-red-200">❌ {wrong}</span>
      {streak >= 2 && <span className="chip !border-amber-400/60 !text-amber-200 animate-pulse">🔥 série {streak}</span>}
      <span className="chip">{answerCount}/{total}</span>
    </div>

    {question && (
      <QuestionCard
        question={question}
        index={index}
        total={total}
        selected={selected}
        revealed={revealed}
        secondsLeft={secondsLeft}
        secondsTotal={secondsTotal}
        onAnswer={onAnswer}
        showExplanation={showExplanations}
      />
    )}

    <div className="flex gap-2">
      {revealed ? (
        <button className={cx('btn-primary flex-1 text-base', isLast && '!bg-gradient-to-r !from-emerald-500 !to-lime-500')} onClick={onNext}>
          {nextLabel || (isLast ? '🏁 Voir mon résultat' : 'Question suivante →')}
        </button>
      ) : (
        onSkip && (
          <button className="btn-ghost flex-1" onClick={onSkip}>
            ⏭️ Passer cette question
          </button>
        )
      )}
    </div>
  </div>
);
