import type { AnswerMode, Band, Difficulty, GradeId, Question, QuestionFormat, SubjectId } from '../../types';
import { isTypeableAnswer } from '../../lib/answers';
import { gradeById, SUBJECTS } from '../grades';
import { CULTURE } from './culture';
import { genFrancaisBatch } from './francais';
import { genMathsBatch, shuffle, type RawQ } from './maths';

export { CULTURE } from './culture';
export type { RawQ } from './maths';

let counter = 0;
const uid = () => `q${++counter}_${Math.random().toString(36).slice(2, 7)}`;

export const gradeBand = (grade: GradeId): Band => gradeById(grade).band;

/** Poids des niveaux de difficulte (1 = facile, 3 = difficile). */
const WEIGHTS: Record<Difficulty, [number, number, number]> = {
  facile: [0.62, 0.33, 0.05],
  moyen: [0.22, 0.52, 0.26],
  difficile: [0.05, 0.35, 0.6]
};

export const pickLevel = (difficulty: Difficulty): 1 | 2 | 3 => {
  const w = WEIGHTS[difficulty] || WEIGHTS.moyen;
  const r = Math.random();
  if (r < w[0]) return 1;
  if (r < w[0] + w[1]) return 2;
  return 3;
};

const levelsFor = (difficulty: Difficulty): (1 | 2 | 3)[] => {
  if (difficulty === 'facile') return [1, 1, 2];
  if (difficulty === 'difficile') return [2, 3, 3];
  return [1, 2, 3];
};

const finalize = (raw: RawQ, subject: SubjectId, band: Band): Question => ({
  id: uid(),
  subject,
  band,
  level: raw.level,
  prompt: raw.prompt,
  choices: raw.choices,
  answer: raw.answer,
  explanation: raw.explanation,
  grades: raw.grades
});

/** Transforme une question QCM en vrai/faux (la reponse proposee est a valider). */
const toVraiFaux = (q: Question): Question => {
  const correct = q.choices[q.answer];
  const wrongs = q.choices.filter((_, i) => i !== q.answer);
  const showCorrect = Math.random() < 0.5;
  const proposal = showCorrect ? correct : wrongs[Math.floor(Math.random() * wrongs.length)] || '???';
  return {
    ...q,
    format: 'vf',
    proposal,
    choices: ['Vrai', 'Faux'],
    answer: showCorrect ? 0 : 1,
    explanation: showCorrect
      ? q.explanation || `Oui : la bonne réponse est bien « ${correct} ».`
      : `Non : la bonne réponse était « ${correct} ». ${q.explanation || ''}`.trim()
  };
};

/** Choisit le format de chaque question selon le mode demande. */
const applyFormat = (q: Question, mode: AnswerMode): Question => {
  if (mode === 'qcm') return { ...q, format: 'qcm' };
  const correct = q.choices[q.answer];
  const typeable = isTypeableAnswer(correct);
  if (mode === 'saisie') {
    if (typeable) return { ...q, format: 'input' };
    return toVraiFaux(q);
  }
  // Mode mixte : 60 % QCM, 20 % saisie, 20 % vrai/faux
  const r = Math.random();
  if (r < 0.6) return { ...q, format: 'qcm' };
  if (r < 0.8 && typeable) return { ...q, format: 'input' };
  return toVraiFaux(q);
};

const uniqueBatch = (batch: RawQ[], count: number): RawQ[] => {
  const out: RawQ[] = [];
  const seen = new Set<string>();
  for (const item of batch) {
    const key = item.prompt.slice(0, 48);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= count) break;
  }
  return out;
};

/** Tire des questions dans une banque fixe (histoire, sciences, anglais). */
const BAND_ORDER: Band[] = ['maternelle', 'elementaire', 'college'];

const sampleCulture = (subject: 'histoire' | 'sciences' | 'anglais', grade: GradeId, difficulty: Difficulty, count: number): RawQ[] => {
  const band = gradeBand(grade);
  const near = BAND_ORDER.slice()
    .sort((a, b) => Math.abs(BAND_ORDER.indexOf(a) - BAND_ORDER.indexOf(band)) - Math.abs(BAND_ORDER.indexOf(b) - BAND_ORDER.indexOf(band)));
  // Si la banque du cycle est trop petite (ex : maternelle en histoire), on
  // complete avec les questions des cycles voisins pour toujours avoir assez
  // de contenu.
  const pool = near.flatMap((b) => CULTURE[subject][b] || []);
  const wanted = pickLevel(difficulty);
  const tailored = pool.filter((x) => (x.grades ? x.grades.includes(grade) : true));
  const byLevel = tailored.filter((x) => Math.abs(x.level - wanted) <= 1);
  const source = byLevel.length >= count ? byLevel : tailored.length ? tailored : pool;
  return shuffle(source).slice(0, count);
};

export interface BuildOptions {
  grade: GradeId;
  difficulty: Difficulty;
  count: number;
  subjects: SubjectId[];
  /** Mode de reponse : QCM (defaut), mixte ou saisie clavier. */
  answerMode?: AnswerMode;
}

/** Construit une serie de questions pour une ou plusieurs matieres. */
export const buildQuiz = ({ grade, difficulty, count, subjects, answerMode = 'qcm' }: BuildOptions): Question[] => {
  const band = gradeBand(grade);
  const subs = subjects.length ? subjects : (['maths'] as SubjectId[]);
  const perSubject = Math.max(1, Math.ceil(count / subs.length));
  let raws: { raw: RawQ; subject: SubjectId }[] = [];

  for (const subject of subs) {
    let batch: RawQ[] = [];
    if (subject === 'maths') {
      batch = genMathsBatch(grade, levelsFor(difficulty), perSubject + 2);
    } else if (subject === 'francais') {
      batch = genFrancaisBatch(grade, levelsFor(difficulty), perSubject + 2);
    } else if (subject === 'histoire' || subject === 'sciences' || subject === 'anglais') {
      batch = sampleCulture(subject, grade, difficulty, perSubject + 2);
    } else {
      batch = genMathsBatch(grade, levelsFor(difficulty), perSubject + 2);
    }
    batch.forEach((raw) => raws.push({ raw, subject }));
  }

  raws = shuffle(raws);
  const kept = uniqueBatch(raws.map((r) => r.raw), count);
  // Si le dedoublonnage a retire trop de questions, on complete avec les
  // questions restantes (programmes riches mais banques finies).
  const extra: RawQ[] = [];
  if (kept.length < count) {
    for (const r of raws) {
      if (kept.includes(r.raw) || extra.includes(r.raw)) continue;
      extra.push(r.raw);
      if (kept.length + extra.length >= count) break;
    }
  }
  const questions = [...kept, ...extra].map((raw) => {
    const found = raws.find((r) => r.raw === raw);
    return applyFormat(finalize(raw, found ? found.subject : subs[0], band), answerMode);
  });
  return questions;
};

/** Examen Hokage : 20 questions, melange de toutes les matieres. */
export const buildExam = (grade: GradeId, difficulty: Difficulty, answerMode: AnswerMode = 'qcm'): Question[] => {
  const plan: SubjectId[] = [
    ...Array(8).fill('maths'),
    ...Array(7).fill('francais'),
    ...Array(5).fill('sciences')
  ] as SubjectId[];
  // On varie un peu la repartition des matieres "culture"
  const cultureSubjects: SubjectId[] = ['sciences', 'histoire', 'anglais'];
  const mixed = plan.map((s, i) => (i >= 15 ? cultureSubjects[i % 3] : s));
  const list = buildQuiz({ grade, difficulty, count: 20, subjects: ['maths', 'francais'], answerMode });
  const extra = buildQuiz({ grade, difficulty, count: 20, subjects: mixed.slice(15), answerMode });
  return shuffle([...list.slice(0, 15), ...extra.slice(0, 5)]).slice(0, 20);
};

/** Questions pour les defis quotidiens (un peu plus difficiles). */
export const buildDailyQuiz = (grade: GradeId, count = 8, answerMode: AnswerMode = 'qcm'): Question[] =>
  buildQuiz({ grade, difficulty: 'difficile', count, subjects: ['maths', 'francais'], answerMode });

/** Questions utilisees par les jeux a 4 joueurs (plateau, Kahoot, duels...). */
export const buildPartyQuestions = (grade: GradeId, difficulty: Difficulty, count: number, subjects?: SubjectId[]): Question[] =>
  buildQuiz({
    grade,
    difficulty,
    count,
    subjects: subjects && subjects.length ? subjects : (['maths', 'francais', 'sciences'] as SubjectId[])
  });

export const ALL_SUBJECT_IDS: SubjectId[] = SUBJECTS.map((s) => s.id);
