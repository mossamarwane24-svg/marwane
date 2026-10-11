// Verifie les banques de questions : structure, formats de reponse et
// tolerance de la saisie clavier. Lance avec `npm run check:questions`.
import { buildQuiz, buildExam, buildDailyQuiz } from '../src/data/questions/index';
import { GRADES, SUBJECTS } from '../src/data/grades';
import { answersMatch, isTypeableAnswer } from '../src/lib/answers';
import type { AnswerMode, Difficulty, SubjectId } from '../src/types';

const difficulties: Difficulty[] = ['facile', 'moyen', 'difficile'];
const modes: AnswerMode[] = ['qcm', 'mixte', 'saisie'];

let total = 0;
let problems = 0;
let formats = { qcm: 0, input: 0, vf: 0 };
const dupes: string[] = [];
const fail = (msg: string) => {
  console.log('⚠️ ', msg);
  problems++;
};

for (const g of GRADES) {
  for (const d of difficulties) {
    for (const mode of modes) {
      for (const s of SUBJECTS) {
        const qs = buildQuiz({ grade: g.id, difficulty: d, count: 8, subjects: [s.id as SubjectId], answerMode: mode });
        total += qs.length;
        if (qs.length !== 8) fail(`${g.id}/${d}/${s.id}/${mode} : ${qs.length} questions au lieu de 8`);
        const seen = new Set<string>();
        for (const q of qs) {
          const fmt = q.format || 'qcm';
          formats[fmt]++;
          if (!q.prompt || q.prompt.length < 3) fail(`énoncé vide (${g.id}/${s.id})`);
          if (!q.explanation) fail(`pas d'explication : ${q.prompt}`);
          if (seen.has(q.prompt)) dupes.push(`${g.id}/${s.id}/${mode}: ${q.prompt.slice(0, 40)}`);
          seen.add(q.prompt);

          if (fmt === 'qcm') {
            if (q.choices.length !== 4) fail(`${q.choices.length} choix : ${q.prompt}`);
            if (q.answer < 0 || q.answer > 3) fail(`index de réponse hors bornes : ${q.prompt}`);
            if (new Set(q.choices).size !== 4) fail(`choix identiques : ${q.prompt} -> ${q.choices.join(' | ')}`);
          } else if (fmt === 'vf') {
            if (q.choices.length !== 2 || q.choices[0] !== 'Vrai' || q.choices[1] !== 'Faux') fail(`vrai/faux mal formé : ${q.prompt}`);
            if (q.answer !== 0 && q.answer !== 1) fail(`vrai/faux sans réponse valide : ${q.prompt}`);
            if (!q.proposal) fail(`vrai/faux sans réponse proposée : ${q.prompt}`);
            if (q.explanation && q.explanation.trim().length < 5) fail(`explication vrai/faux trop courte : ${q.prompt}`);
          } else if (fmt === 'input') {
            const expected = q.choices[q.answer];
            if (!isTypeableAnswer(expected)) fail(`réponse trop longue pour la saisie : « ${expected} »`);
            if (q.choices.length !== 4) fail(`la saisie doit conserver les 4 choix pour la correction : ${q.prompt}`);
          }
        }
      }
      const exam = buildExam(g.id, d, mode);
      total += exam.length;
      if (exam.length !== 20) fail(`examen ${g.id}/${d}/${mode} : ${exam.length} questions`);
      const daily = buildDailyQuiz(g.id, 6, mode);
      total += daily.length;
      if (daily.length !== 6) fail(`défi ${g.id}/${mode} : ${daily.length} questions`);
    }
  }
}

// --- Tolerance de la saisie clavier -----------------------------------------
const cases: [string, string, boolean][] = [
  ['12', '12', true],
  [' 12 ', '12', true],
  ['12,5', '12.5', true],
  ['ÉLÉPHANT', 'éléphant', true],
  ['elephant', 'éléphant', true],
  ['des chiens', 'chiens', true],
  ['nous jouions', 'Nous jouions', true],
  ['5 cm', '5', true],
  ['3,14', '3.14', true],
  ['7', '12', false],
  ['chien', 'chat', false],
  ['', '4', false],
  ['54', '45', false]
];
let matchProblems = 0;
cases.forEach(([typed, expected, want]) => {
  const got = answersMatch(typed, expected);
  if (got !== want) {
    matchProblems++;
    fail(`answersMatch("${typed}", "${expected}") = ${got} (attendu ${want})`);
  }
});

console.log(`\n${total} questions générées et vérifiées sur ${modes.length} modes de réponse.`);
console.log(`Formats : ${formats.qcm} QCM · ${formats.input} réponses écrites · ${formats.vf} vrai/faux`);
console.log(`Comparaison des réponses écrites : ${cases.length - matchProblems}/${cases.length} cas corrects`);
console.log(`Doublons dans une même série : ${dupes.length}`);
dupes.slice(0, 5).forEach((d) => console.log('   •', d));
console.log(problems === 0 ? '✅ Toutes les questions sont valides.' : `❌ ${problems} problème(s) détecté(s).`);
process.exit(problems === 0 ? 0 : 1);
