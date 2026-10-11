// ---------------------------------------------------------------------------
// Cahier d'erreurs : on memorise les questions ratees pour les rejouer plus
// tard. Fonctions pures (testables sans navigateur).
// ---------------------------------------------------------------------------

import type { Question, SubjectId } from '../types';

export interface StoredQuestion {
  prompt: string;
  choices: string[];
  answer: number;
  explanation?: string;
  subject: SubjectId;
}

export interface ErrorEntry {
  /** Cle stable : matiere + debut de l'enonce. */
  id: string;
  question: StoredQuestion;
  /** Nombre de fois ou la question a ete ratee. */
  wrongCount: number;
  /** Nombre de tentatives de revision. */
  seenCount: number;
  /** Nombre de revisions reussies (2 = notion acquise). */
  fixedCount: number;
  /** Vrai quand la question est consideree comme revue et comprise. */
  mastered: boolean;
  at: number;
  lastAt: number;
}

export const errorKey = (q: StoredQuestion): string =>
  `${q.subject}:${q.prompt
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)}`;

/** Transforme une question du jeu en question stockable. */
export const toStored = (q: Question): StoredQuestion => ({
  prompt: q.prompt,
  choices: [...q.choices],
  answer: q.answer,
  explanation: q.explanation,
  subject: q.subject
});

/** Rejoue une erreur sous forme de question du jeu. */
export const fromStored = (q: StoredQuestion, id: string): Question => ({
  id,
  subject: q.subject,
  band: 'elementaire',
  level: 2,
  prompt: q.prompt,
  choices: [...q.choices],
  answer: q.answer,
  explanation: q.explanation
});

/** Ajoute (ou met a jour) les questions ratees d'une serie. */
export const addErrors = (list: ErrorEntry[], questions: Question[]): ErrorEntry[] => {
  if (!questions.length) return list;
  const copy = [...list];
  questions.forEach((q) => {
    const stored = toStored(q);
    const key = errorKey(stored);
    const existing = copy.find((e) => e.id === key);
    if (existing) {
      existing.wrongCount += 1;
      existing.lastAt = Date.now();
      // Une nouvelle erreur remet la notion en revision.
      if (existing.mastered && existing.wrongCount > existing.fixedCount) {
        existing.mastered = false;
        existing.fixedCount = 0;
      }
      return;
    }
    copy.push({
      id: key,
      question: stored,
      wrongCount: 1,
      seenCount: 0,
      fixedCount: 0,
      mastered: false,
      at: Date.now(),
      lastAt: Date.now()
    });
  });
  return copy;
};

/** Enregistre le resultat d'une revision d'erreur. */
export const reviewError = (list: ErrorEntry[], id: string, correct: boolean): ErrorEntry[] =>
  list.map((e) => {
    if (e.id !== id) return e;
    const next: ErrorEntry = { ...e, seenCount: e.seenCount + 1, lastAt: Date.now() };
    if (correct) {
      next.fixedCount += 1;
      // Deux bonnes revisions : la notion est acquise.
      if (next.fixedCount >= 2) next.mastered = true;
    } else {
      // Une rechute remet la question en revision.
      next.wrongCount += 1;
      next.fixedCount = 0;
      next.mastered = false;
    }
    return next;
  });

/** Erreurs encore a revoir (les plus recentes d'abord, plafonnees). */
export const pendingErrors = (list: ErrorEntry[], limit = 20): ErrorEntry[] =>
  list
    .filter((e) => !e.mastered)
    .sort((a, b) => b.lastAt - a.lastAt)
    .slice(0, limit);

/** Erreurs deja maitrisees (les plus recentes d'abord). */
export const masteredErrors = (list: ErrorEntry[]): ErrorEntry[] =>
  list.filter((e) => e.mastered).sort((a, b) => b.lastAt - a.lastAt);

/** Compte les erreurs en attente par matiere. */
export const errorsBySubject = (list: ErrorEntry[]): { subject: SubjectId; count: number }[] => {
  const map = new Map<SubjectId, number>();
  pendingErrors(list, 1000).forEach((e) => {
    map.set(e.question.subject, (map.get(e.question.subject) || 0) + 1);
  });
  return [...map.entries()]
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);
};
