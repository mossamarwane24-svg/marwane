import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Difficulty, Question } from '../types';
import { DIFFICULTY_INFO } from '../data/grades';
import { answersMatch } from '../lib/answers';
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

export interface AnswerLog {
  id: string;
  correct: boolean;
  choice: number | null;
  typed?: string | null;
}

interface Options {
  questions: Question[];
  difficulty: Difficulty;
  ryosPerCorrect?: number;
  streakBonus?: boolean;
  useTimer?: boolean;
  /** Force une duree par question (ex : 10 s pour le défi éclair). */
  secondsOverride?: number;
  /** Multiplicateur de Ryos (ex : ×2 pour le défi du jour). */
  ryosMultiplierOverride?: number;
  onFinish?: (summary: QuizSummary) => void;
}

export function useQuizSession({
  questions,
  difficulty,
  ryosPerCorrect = 10,
  streakBonus = true,
  useTimer = true,
  secondsOverride,
  ryosMultiplierOverride,
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
  const [answers, setAnswers] = useState<AnswerLog[]>([]);
  const [typedAnswer, setTypedAnswer] = useState<string | null>(null);

  const info = DIFFICULTY_INFO[difficulty] || DIFFICULTY_INFO.moyen;
  const multiplier = ryosMultiplierOverride ?? info.ryosMultiplier;
  const totalSeconds = useTimer ? secondsOverride ?? info.seconds : 0;
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

  /** Enregistre une reponse (choix multiple, vrai/faux ou saisie clavier). */
  const apply = useCallback(
    (isGood: boolean, choice: number | null, typed?: string | null) => {
      if (!current || revealed) return;
      const nextStreak = isGood ? streak + 1 : 0;
      const bonus = streakBonus && nextStreak >= 3 ? (nextStreak - 2) * 2 : 0;
      const gained = isGood ? Math.round(ryosPerCorrect * multiplier) + bonus : 0;
      const nextCorrect = correct + (isGood ? 1 : 0);
      const nextWrong = wrong + (isGood ? 0 : 1);
      const nextRyos = ryos + gained;
      const nextBest = Math.max(bestRun, nextStreak);

      setSelected(choice);
      setTypedAnswer(typed ?? null);
      setRevealed(true);
      setCorrect(nextCorrect);
      setWrong(nextWrong);
      setRyos(nextRyos);
      setStreak(nextStreak);
      setBestRun(nextBest);
      setAnswers((prev) => [...prev, { id: current.id, correct: isGood, choice, typed: typed ?? null }]);
      isGood ? sfx.correct() : sfx.wrong();
    },
    [bestRun, correct, current, multiplier, revealed, ryos, ryosPerCorrect, streak, streakBonus, wrong]
  );

  /** Reponse a un choix multiple ou a un vrai/faux. */
  const choose = useCallback(
    (choice: number | null) => {
      if (!current) return;
      apply(choice !== null && choice === current.answer, choice);
    },
    [apply, current]
  );

  /** Reponse tapee au clavier (mode saisie). */
  const submitText = useCallback(
    (text: string) => {
      if (!current) return;
      const expected = current.choices[current.answer] ?? '';
      const isGood = answersMatch(text, expected);
      apply(isGood, isGood ? 0 : -1, text.trim());
    },
    [apply, current]
  );

  // Temps ecoule = mauvaise reponse
  useEffect(() => {
    if (!useTimer || revealed || finished || !current) return;
    if (secondsLeft > 0) return;
    apply(false, null);
  }, [secondsLeft, useTimer, revealed, finished, current, apply]);

  const next = useCallback(() => {
    if (index + 1 >= questions.length) {
      finalize(correct, wrong, ryos, bestRun);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    setTypedAnswer(null);
    sfx.click();
  }, [bestRun, correct, finalize, index, questions.length, ryos, wrong]);

  const skip = useCallback(() => {
    if (!revealed) apply(false, null);
    setTimeout(() => next(), 900);
  }, [apply, next, revealed]);

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
    setTypedAnswer(null);
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
    typedAnswer,
    progress,
    secondsLeft,
    totalSeconds,
    difficultyInfo: info,
    ryosMultiplier: multiplier,
    choose,
    submitText,
    next,
    skip,
    restart
  };
}
