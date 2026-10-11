import { createGameState, reduce, botAction, currentIsBot, ranking } from '../shared/partyEngine.js';

const GAMES = ['plateau', 'kunai', 'boss', 'morpion', 'loto', 'course', 'equipe'];
const questions = Array.from({ length: 30 }, (_, i) => ({
  prompt: `Question ${i + 1} : combien font ${i} + ${i + 1} ?`,
  choices: [String(2 * i + 1), '1', '2', '3'],
  answer: 0,
  explanation: 'test',
  subject: 'maths'
}));

let failures = 0;
for (const g of GAMES) {
  const players = ['A', 'B', 'C', 'D'].map((n, i) => ({ id: `p${i}`, name: n, avatar: '🦊', bot: true }));
  let state = createGameState(g, players, { questions, maxRounds: g === 'course' ? 8 : undefined });
  let iter = 0;
  let botTurns = 0;
  while (!state.over && iter < 20000) {
    const act = botAction(state, 0.6);
    if (!act) {
      // personne ne peut jouer : on force une reponse pour debloquer
      const stuck = state.players.find((p) => !p.answered && p.alive);
      if (!stuck) {
        console.log(`  ⚠️  ${g} : blocage detecte (phase ${state.phase}, over=${state.over})`);
        failures++;
        break;
      }
      state = reduce(state, { type: 'answer', playerId: stuck.id, choice: -1, pick: 'pierre' });
      iter++;
      continue;
    }
    state = reduce(state, act);
    botTurns++;
    iter++;
  }
  const r = ranking(state);
  const teams = state.gameId === 'equipe'
    ? ` | equipe1=${state.players.filter((p) => p.team === 0).reduce((s, p) => s + p.score, 0)} equipe2=${state.players.filter((p) => p.team === 1).reduce((s, p) => s + p.score, 0)} morts subites=${state.suddenDeath}`
    : '';
  console.log(
    `${state.over ? '✅' : '❌'} ${g.padEnd(8)} manches=${String(state.round).padStart(2)} actions=${String(iter).padStart(4)} ` +
      `gagnant(s)=${state.winners.map((w) => r.find((x) => x.id === w)?.name).join(',') || 'aucun'} `
      + `score top=${r[0]?.score}`
  );
  if (!state.over) failures++;
}
console.log(failures === 0 ? '\n🎉 Tous les jeux se terminent correctement.' : `\n${failures} jeu(x) en echec.`);
process.exit(failures ? 1 : 0);
