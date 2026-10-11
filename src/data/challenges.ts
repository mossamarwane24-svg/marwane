import type { DailyChallenges } from '../types';

export type ChallengeMetric = 'quiz' | 'correct' | 'perfect' | 'duel' | 'party' | 'ryos' | 'exam' | 'custom' | 'kahoot';

export interface ChallengeDef {
  id: string;
  label: string;
  emoji: string;
  goal: number;
  metric: ChallengeMetric;
  reward: number;
  desc: string;
}

const ALL: ChallengeDef[] = [
  { id: 'quiz2', label: '2 quiz terminés', emoji: '📝', goal: 2, metric: 'quiz', reward: 120, desc: 'Termine 2 quiz d’entraînement' },
  { id: 'correct20', label: '20 bonnes réponses', emoji: '✅', goal: 20, metric: 'correct', reward: 180, desc: 'Réponds correctement à 20 questions' },
  { id: 'perfect1', label: '1 quiz sans faute', emoji: '🎯', goal: 1, metric: 'perfect', reward: 220, desc: 'Termine un quiz avec 100 % de réussite' },
  { id: 'duel1', label: '1 duel gagné', emoji: '⚔️', goal: 1, metric: 'duel', reward: 250, desc: 'Remporte un duel classé' },
  { id: 'party1', label: '1 partie à 4 joueurs', emoji: '🎲', goal: 1, metric: 'party', reward: 160, desc: 'Joue à un jeu à plusieurs' },
  { id: 'ryos600', label: '600 Ryos gagnés', emoji: '🪙', goal: 600, metric: 'ryos', reward: 200, desc: 'Gagne 600 Ryos aujourd’hui' },
  { id: 'exam1', label: '1 Examen Hokage', emoji: '📜', goal: 1, metric: 'exam', reward: 200, desc: 'Passe l’Examen Hokage (20 questions)' },
  { id: 'kahoot1', label: '1 partie Kahoot', emoji: '📺', goal: 1, metric: 'kahoot', reward: 180, desc: 'Rejoins une partie Kahoot avec un PIN' },
  { id: 'custom1', label: '1 jeu créé par un autre', emoji: '🛠️', goal: 1, metric: 'custom', reward: 170, desc: 'Joue à un jeu de la communauté' },
  { id: 'correct35', label: '35 bonnes réponses', emoji: '🔥', goal: 35, metric: 'correct', reward: 320, desc: 'Dépasse les 35 bonnes réponses' },
  { id: 'party3', label: '3 parties à plusieurs', emoji: '🤝', goal: 3, metric: 'party', reward: 300, desc: 'Enchaîne 3 parties multijoueur' },
  { id: 'duel3', label: '3 duels gagnés', emoji: '🗡️', goal: 3, metric: 'duel', reward: 400, desc: 'Gagne 3 duels dans la journée' }
];

/** Selection deterministe de 4 defis pour une date donnee. */
export const dailySelection = (dateKey: string): ChallengeDef[] => {
  let seed = 0;
  for (let i = 0; i < dateKey.length; i++) seed = (seed * 31 + dateKey.charCodeAt(i)) % 100000;
  const pool = [...ALL];
  const picked: ChallengeDef[] = [];
  for (let i = 0; i < 4 && pool.length; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const idx = seed % pool.length;
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
};

export const challengeById = (id: string) => ALL.find((c) => c.id === id);

export const isChallengeDone = (d: DailyChallenges, def: ChallengeDef) => (d.progress[def.id] || 0) >= def.goal;
