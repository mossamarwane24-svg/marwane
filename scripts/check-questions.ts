import { buildQuiz, buildExam, buildDailyQuiz } from '../src/data/questions/index';
import { GRADES, SUBJECTS } from '../src/data/grades';
import type { Difficulty, SubjectId } from '../src/types';

const difficulties: Difficulty[] = ['facile', 'moyen', 'difficile'];
let total = 0;
let problems = 0;
const dupes: string[] = [];

for (const g of GRADES) {
  for (const d of difficulties) {
    for (const s of SUBJECTS) {
      const qs = buildQuiz({ grade: g.id, difficulty: d, count: 8, subjects: [s.id as SubjectId] });
      total += qs.length;
      if (qs.length !== 8) {
        console.log(`⚠️  ${g.id}/${d}/${s.id} : ${qs.length} questions au lieu de 8`);
        problems++;
      }
      const seen = new Set<string>();
      for (const q of qs) {
        if (!q.prompt || q.prompt.length < 3) { console.log(`⚠️  énoncé vide: ${g.id}/${s.id}`); problems++; }
        if (q.choices.length !== 4) { console.log(`⚠️  ${q.choices.length} choix: ${q.prompt}`); problems++; }
        if (q.answer < 0 || q.answer > 3) { console.log(`⚠️  index de réponse hors bornes: ${q.prompt}`); problems++; }
        if (new Set(q.choices).size !== 4) { console.log(`⚠️  choix identiques: ${q.prompt} -> ${q.choices.join(' | ')}`); problems++; }
        if (!q.explanation) { console.log(`⚠️  pas d'explication: ${q.prompt}`); problems++; }
        if (seen.has(q.prompt)) dupes.push(`${g.id}/${s.id}: ${q.prompt.slice(0, 40)}`);
        seen.add(q.prompt);
      }
    }
    const exam = buildExam(g.id, d);
    total += exam.length;
    if (exam.length !== 20) { console.log(`⚠️  examen ${g.id}/${d} : ${exam.length} questions`); problems++; }
    const daily = buildDailyQuiz(g.id, 6);
    total += daily.length;
    if (daily.length !== 6) { console.log(`⚠️  défi ${g.id} : ${daily.length} questions`); problems++; }
  }
}

console.log(`\n${total} questions générées et vérifiées.`);
console.log(`Doublons dans une même série : ${dupes.length}`);
dupes.slice(0, 5).forEach((d) => console.log('   •', d));
console.log(problems === 0 ? '✅ Toutes les questions sont valides.' : `❌ ${problems} problème(s) détecté(s).`);
process.exit(problems === 0 ? 0 : 1);
