// Verifie que chaque badge est atteignable (aucun check() toujours faux)
// et qu'aucun n'est acquis des le depart. Lance avec `npm run check:badges`.
// Vérifie que chaque badge peut se débloquer (aucun check() qui reste toujours faux).
import { BADGES } from '../src/data/badges';
import { defaultSave } from '../src/lib/storage';

const base = defaultSave();
let alwaysFalse = 0;
let alwaysTrue = 0;

BADGES.forEach((b) => {
  // Sauvegarde "max" : tous les compteurs au maximum -> le badge doit se débloquer
  const maxSave = JSON.parse(JSON.stringify(base));
  maxSave.stats = {
    quizzesPlayed: 999, perfectQuizzes: 999, bestRun: 999, questionsAnswered: 99999,
    correctAnswers: 99999, examsTaken: 999, bestExam: 20, duelsPlayed: 999, duelsWon: 999,
    partyPlayed: 999, partyWon: 999, kahootPlayed: 999, kahootWon: 999, boardWins: 999,
    teamWins: 999, batailleWins: 999, memoryWins: 999, sheetsPrinted: 999, eclairPerfect: 999, slotSpins: 999, jackpots: 999,
    subjectsPlayed: ['maths', 'francais', 'histoire', 'sciences', 'anglais'],
    subjectQuizzes: { maths: 99, francais: 99, histoire: 99, sciences: 99, anglais: 99 },
    friendsAdded: 99, gamesPublished: 99, gamesPlayedFromOthers: 99, ryosEarnedTotal: 999999,
    daysPlayed: 999
  };
  maxSave.profile.ryos = 999999;
  maxSave.profile.elo = 2000;
  maxSave.streak.best = 99;

  const empty = JSON.parse(JSON.stringify(base));

  if (!b.check(maxSave.stats, maxSave)) { console.log(`❌ ${b.id} (${b.name}) ne se débloque JAMAIS`); alwaysFalse++; }
  if (b.check(empty.stats, empty)) { console.log(`⚠️  ${b.id} (${b.name}) est déjà débloqué au départ`); alwaysTrue++; }
});

console.log(`\n${BADGES.length} badges testés · ${alwaysFalse} injoignables · ${alwaysTrue} déjà acquis au départ`);
console.log(alwaysFalse === 0 && alwaysTrue === 0 ? '✅ Tous les badges sont atteignables et aucun n’est donné au démarrage.' : '❌ Problème de badges');
process.exit(alwaysFalse === 0 && alwaysTrue === 0 ? 0 : 1);
