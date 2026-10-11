import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Difficulty, Question } from '../types';
import { DIFFICULTY_INFO } from '../data/grades';
import { sfx } from '../lib/sound';

export interface QuizSummary {
  correct: number;
  wrong: number;
  total: number;
  ryos: number;
  perfect: boolean;
  bestRun: number;
  durationMs: number;
}

interface Options {
  questions: Question[];
  difficulty: Difficulty;
  ryosPerCorrect?: number;
  streakBonus?: boolean;
  useTimer?: boolean;
  onFinish?: (summary: QuizSummary) => void;
}

export function useQuizSession({
  questions,
  difficulty,
  ryosPerCorrect = 10,
  streakBonus = true,
  useTimer = true,
  onFinish
}: Options) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestRun, setBestRun] = useState(0);
  const [ryos, setRyos] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<{ id: string; correct: boolean; choice: number | null }[]>([]);

  const info = DIFFICULTY_INFO[difficulty] || DIFFICULTY_INFO.moyen;
  const totalSeconds = useTimer ? info.seconds : 0;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const startedAt = useRef(Date.now());
  const finishedRef = useRef(false);

  const current = questions[index];

  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [index, totalSeconds]);

  useEffect(() => {
    if (finished || revealed || !useTimer || !current) return;
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, revealed, finished, useTimer, current]);

  const finalize = useCallback(
    (finalCorrect: number, finalWrong: number, finalRyos: number, finalBest: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setFinished(true);
      const summary: QuizSummary = {
        correct: finalCorrect,
        wrong: finalWrong,
        total: questions.length,
        ryos: finalRyos,
        perfect: finalCorrect === questions.length && questions.length > 0,
        bestRun: finalBest,
        durationMs: Date.now() - startedAt.current
      };
      onFinish?.(summary);
    },
    [onFinish, questions.length]
  );

  const mark = useCallback(
    (choice: number | null) => {
      if (!current || revealed) return;
      const isGood = choice === current.answer;
      const nextStreak = isGood ? streak + 1 : 0;
      const bonus = streakBonus && nextStreak >= 3 ? (nextStreak - 2) * 2 : 0;
      const gained = isGood ? Math.round(ryosPerCorrect * info.ryosMultiplier) + bonus : 0;
      const nextCorrect = correct + (isGood ? 1 : 0);
      const nextWrong = wrong + (isGood ? 0 : 1);
      const nextRyos = ryos + gained;
      const nextBest = Math.max(bestRun, nextStreak);

      setSelected(choice);
      setRevealed(true);
      setCorrect(nextCorrect);
      setWrong(nextWrong);
      setRyos(nextRyos);
      setStreak(nextStreak);
      setBestRun(nextBest);
      setAnswers((prev) => [...prev, { id: current.id, correct: isGood, choice }]);
      isGood ? sfx.correct() : sfx.wrong();
    },
    [bestRun, correct, current, info.ryosMultiplier, revealed, ryos, ryosPerCorrect, streak, streakBonus, wrong]
  );

  // Temps ecoule = mauvaise reponse
  useEffect(() => {
    if (!useTimer || revealed || finished || !current) return;
    if (secondsLeft > 0) return;
    mark(null);
  }, [secondsLeft, useTimer, revealed, finished, current, mark]);

  const next = useCallback(() => {
    if (index + 1 >= questions.length) {
      finalize(correct, wrong, ryos, bestRun);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    sfx.click();
  }, [bestRun, correct, finalize, index, questions.length, ryos, wrong]);

  const skip = useCallback(() => {
    if (!revealed) mark(null);
    setTimeout(() => next(), 900);
  }, [mark, next, revealed]);

  const restart = useCallback(() => {
    finishedRef.current = false;
    startedAt.current = Date.now();
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setCorrect(0);
    setWrong(0);
    setStreak(0);
    setBestRun(0);
    setRyos(0);
    setFinished(false);
    setAnswers([]);
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  const progress = useMemo(() => ({ current: index + 1, total: questions.length }), [index, questions.length]);

  return {
    index,
    current,
    selected,
    revealed,
    correct,
    wrong,
    streak,
    bestRun,
    ryos,
    finished,
    answers,
    progress,
    secondsLeft,
    totalSeconds,
    difficultyInfo: info,
    choose: mark,
    next,
    skip,
    restart
  };
}
