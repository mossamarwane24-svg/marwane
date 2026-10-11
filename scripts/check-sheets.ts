// Verifie la generation des feuilles de revision imprimables : nombre de
// questions, enonces uniques, 4 choix et corrige coherent.
// Lance avec `npm run check:sheets`.
import { buildQuiz } from '../src/data/questions';
import { GRADES, SUBJECTS } from '../src/data/grades';
import type { Difficulty, SubjectId } from '../src/types';

const difficulties: Difficulty[] = ['facile', 'moyen', 'difficile'];
let problems = 0;
let total = 0;

GRADES.forEach((g) => {
  difficulties.forEach((d) => {
    // Une matiere, et le melange "toutes les matieres"
    const combos: SubjectId[][] = SUBJECTS.map((s) => [s.id]);
    combos.push(SUBJECTS.map((s) => s.id));
    combos.forEach((subjects) => {
      [10, 20, 30].forEach((count) => {
        const qs = buildQuiz({ grade: g.id, difficulty: d, count, subjects });
        total += qs.length;
        if (qs.length !== count) {
          console.log(`⚠️  ${g.id}/${d}/${subjects.join('+')} : ${qs.length} questions au lieu de ${count}`);
          problems++;
        }
        const prompts = new Set(qs.map((q) => q.prompt));
        if (prompts.size !== qs.length) {
          console.log(`⚠️  ${g.id}/${d}/${subjects.join('+')} : énoncés en doublon (${prompts.size}/${qs.length})`);
          problems++;
        }
        qs.forEach((q) => {
          if (!q.choices[q.answer] || q.choices[q.answer].trim() === '') {
            console.log(`⚠️  réponse vide : ${q.prompt}`);
            problems++;
          }
          if (q.choices.length !== 4) {
            console.log(`⚠️  ${q.choices.length} choix : ${q.prompt}`);
            problems++;
          }
          if (new Set(q.choices).size !== 4) {
            console.log(`⚠️  choix identiques : ${q.prompt}`);
            problems++;
          }
        });
      });
    });
  });
});

console.log(`\n${total} questions de feuilles générées et vérifiées (11 niveaux × 3 difficultés × 6 matières × 10/20/30).`);
console.log(problems === 0 ? '✅ Toutes les feuilles sont imprimables et correctes.' : `❌ ${problems} problème(s)`);
process.exit(problems === 0 ? 0 : 1);
