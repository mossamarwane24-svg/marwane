// Verifie la logique du cahier d'erreurs (fonctions pures).
// Lance avec `npm run check:errors`.
import {
  addErrors,
  reviewError,
  pendingErrors,
  masteredErrors,
  errorsBySubject,
  errorKey,
  toStored
} from '../src/lib/errors';
import type { Question } from '../src/types';
import type { ErrorEntry } from '../src/lib/errors';

let problems = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) {
    console.log(`⚠️  ${label}`);
    problems += 1;
  }
};

const q = (prompt: string, subject: 'maths' | 'francais' = 'maths'): Question => ({
  id: `q_${prompt}`,
  subject,
  band: 'elementaire',
  level: 2,
  prompt,
  choices: ['4', '5', '6', '7'],
  answer: 0,
  explanation: 'explication'
});

// 1) Ajout d'erreurs
let list: ErrorEntry[] = [];
list = addErrors(list, [q('2 + 2 = ?'), q('Une capitale')]);
check('deux erreurs enregistrées', list.length === 2);
check('compteur d’erreurs à 1', list.every((e) => e.wrongCount === 1));
check('aucune maîtrisée au départ', list.every((e) => !e.mastered));

// 2) La même question ratée deux fois ne crée pas de doublon
list = addErrors(list, [q('2 + 2 = ?')]);
check('pas de doublon', list.length === 2);
const first = list.find((e) => e.id === errorKey(toStored(q('2 + 2 = ?'))))!;
check('compteur incrémenté', first.wrongCount === 2);

// 3) Deux bonnes révisions = acquis
list = reviewError(list, first.id, true);
check('1 bonne révision : pas encore acquis', !list.find((e) => e.id === first.id)!.mastered);
list = reviewError(list, first.id, true);
check('2 bonnes révisions : acquis', list.find((e) => e.id === first.id)!.mastered);
check('une seule erreur en attente', pendingErrors(list).length === 1);
check('une seule erreur maîtrisée', masteredErrors(list).length === 1);

// 4) Une erreur sur une question maîtrisée la remet en révision
list = reviewError(list, first.id, false);
const rechute = list.find((e) => e.id === first.id)!;
check('rechute : retour en révision', !rechute.mastered && rechute.fixedCount === 0);
check('rechute comptabilisée', rechute.wrongCount === 3);

// 5) Une nouvelle erreur sur une question maîtrisée la remet aussi en révision
list = reviewError(list, first.id, true);
list = reviewError(list, first.id, true);
check('de nouveau maîtrisée', list.find((e) => e.id === first.id)!.mastered);
list = addErrors(list, [q('2 + 2 = ?')]);
check('nouvelle erreur : retour en révision', !list.find((e) => e.id === first.id)!.mastered);

// 6) La limite de série fonctionne
const big: ErrorEntry[] = [];
for (let i = 0; i < 30; i++) big.push(...addErrors([], [q(`Question ${i}`)]));
check('30 erreurs enregistrées', big.length === 30);
check('série limitée à 10', pendingErrors(big, 10).length === 10);
check('série limitée à 20 par défaut', pendingErrors(big).length === 20);

// 7) Répartition par matière
const mixed = addErrors(addErrors([], [q('A', 'maths'), q('B', 'maths')]), [q('C', 'francais')]);
const bySubject = errorsBySubject(mixed);
check('deux matières comptées', bySubject.length === 2);
check('maths en tête avec 2', bySubject[0].subject === 'maths' && bySubject[0].count === 2);

// 8) Stabilité de la clé (espaces et casse)
const k1 = errorKey(toStored(q('  2 + 2 = ?  ')));
const k2 = errorKey(toStored(q('2 + 2 = ?')));
check('clé stable malgré les espaces', k1 === k2);

console.log(`\n${problems === 0 ? '✅' : '❌'} Cahier d'erreurs : 8 scénarios testés, ${problems} problème(s).`);
process.exit(problems === 0 ? 0 : 1);
