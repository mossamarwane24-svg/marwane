import { createGameState, reduce, publicState, botAction, placeFleet, GRID_SIZE } from '/home/user/marwane/shared/partyEngine.js';

// 1) Validité des flottes générées
let bad = 0;
for (let i = 0; i < 3000; i++) {
  const fleet = placeFleet();
  const all = fleet.flatMap((s) => s.cells);
  if (fleet.length !== 3) bad++;
  else if (all.length !== 7) bad++;
  else if (new Set(all).size !== 7) bad++;
  else if (all.some((c) => c < 0 || c >= 25)) bad++;
  else if (fleet.some((s) => s.cells.length !== s.size)) bad++;
  // cases contiguës en ligne ou en colonne
  else if (fleet.some((s) => {
    const rows = new Set(s.cells.map((c) => Math.floor(c / GRID_SIZE)));
    const cols = new Set(s.cells.map((c) => c % GRID_SIZE));
    return !(rows.size === 1 || cols.size === 1);
  })) bad++;
}
console.log(`Flottes : ${3000 - bad}/3000 valides`);
if (bad) { console.log('❌ placement des navires incorrect'); process.exit(1); }

// 2) Partie complète 1v1 (bots)
const questions = Array.from({ length: 40 }, (_, i) => ({ prompt: `Q${i}`, choices: ['a','b','c','d'], answer: 0 }));
let wins = { p0: 0, p1: 0, nul: 0 };
let rounds = [];
for (let run = 0; run < 40; run++) {
  const players = [{ id: 'p0', name: 'Alpha', avatar: '🦊', bot: true }, { id: 'p1', name: 'Beta', avatar: '🐍', bot: true }];
  let st = createGameState('bataille', players, { questions });
  let guard = 0;
  while (!st.over && guard < 20000) {
    const act = botAction(st, 0.6 + Math.random() * 0.25);
    if (!act) { console.log(`❌ run ${run} : aucune action (phase ${st.phase})`); process.exit(1); }
    st = reduce(st, act);
    guard++;
  }
  if (!st.over) { console.log(`❌ run ${run} bloquée`); process.exit(1); }
  rounds.push(st.round);
  if (!st.winners.length) wins.nul++;
  else wins[st.winners[0]]++;
}
console.log(`40 parties 1v1 : Alpha ${wins.p0} · Beta ${wins.p1} · nuls ${wins.nul} · manches moy. ${(rounds.reduce((a,b)=>a+b,0)/rounds.length).toFixed(1)}`);

// 3) Confidentialité : l'adversaire ne voit pas la flotte
const players = [{ id: 'me', name: 'Moi', avatar: '🦊', bot: false }, { id: 'foe', name: 'Ennemi', avatar: '🐍', bot: false }];
let st = createGameState('bataille', players, { questions });
const vue = publicState(st, 'me');
const enemy = vue.players.find((p) => p.id === 'foe');
const mine = vue.players.find((p) => p.id === 'me');
const enemyCells = enemy.ships.flatMap((s) => s.cells).length;
const myCells = mine.ships.flatMap((s) => s.cells).length;
console.log(`Côté client : ma flotte = ${myCells} cases visibles · flotte adverse = ${enemyCells} cases visibles (doit être 0)`);
if (enemyCells !== 0) { console.log('❌ la flotte adverse est visible !'); process.exit(1); }
if (myCells !== 7) { console.log('❌ ma propre flotte est masquée !'); process.exit(1); }

// 4) Tir réel : toucher coule la flotte et termine la partie
st = createGameState('bataille', players, { questions });
let guard = 0;
// Force : Alpha répond toujours juste, puis tire sur toutes les cases
while (!st.over && guard < 500) {
  const c = st.players[st.turn % st.players.length];
  if (st.phase === 'question') st = reduce(st, { type: 'answer', playerId: c.id, choice: st.question.answer });
  else if (st.phase === 'pick') {
    const target = st.players.find((p) => p.id === st.pending.pick.targetId);
    let cell = 0;
    while (target.incoming[cell] !== undefined && cell < 25) cell++;
    st = reduce(st, { type: 'pick', playerId: c.id, payload: cell });
  }
  guard++;
}
const hits = st.players.map((p) => p.ships.reduce((n, s) => n + s.hits.length, 0));
console.log(`Partie forcée : over=${st.over} manches=${st.round} gagnant=${st.winners[0]} · cases touchées ${hits.join('/')}`);
if (!st.over || !st.winners.length) { console.log('❌ la partie ne se termine pas'); process.exit(1); }
console.log('✅ Bataille navale : flottes valides, parties terminées, flotte adverse masquée.');
