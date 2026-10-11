import type { SaveState, Stats } from '../types';

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  tier: 'bronze' | 'argent' | 'or' | 'legende';
  /** Retourne true quand le badge doit etre debloque. */
  check: (s: Stats, save: SaveState) => boolean;
  reward?: number; // Ryos offerts
}

const pct = (s: Stats) => (s.questionsAnswered ? (s.correctAnswers / s.questionsAnswered) * 100 : 0);

export const BADGES: BadgeDef[] = [
  { id: 'premier-pas', name: 'Premier Pas', emoji: '👣', desc: 'Termine ton premier quiz', tier: 'bronze', reward: 25, check: (s) => s.quizzesPlayed >= 1 },
  { id: 'sans-faute', name: 'Sans Faute', emoji: '🎯', desc: 'Un quiz parfait (100 %)', tier: 'argent', reward: 60, check: (s) => s.perfectQuizzes >= 1 },
  { id: 'serie-5', name: 'Série de 5', emoji: '🔥', desc: '5 bonnes réponses d’affilée', tier: 'bronze', reward: 30, check: (s) => s.bestRun >= 5 },
  { id: 'serie-10', name: 'Série de 10', emoji: '💥', desc: '10 bonnes réponses d’affilée', tier: 'argent', reward: 80, check: (s) => s.bestRun >= 10 },
  { id: 'serie-20', name: 'Combo Légendaire', emoji: '🌊', desc: '20 bonnes réponses d’affilée', tier: 'or', reward: 200, check: (s) => s.bestRun >= 20 },
  { id: 'cent-questions', name: 'Centurion', emoji: '💯', desc: '100 questions répondues', tier: 'bronze', reward: 40, check: (s) => s.questionsAnswered >= 100 },
  { id: 'mille-questions', name: 'Machine à Réviser', emoji: '🤖', desc: '1 000 questions répondues', tier: 'or', reward: 300, check: (s) => s.questionsAnswered >= 1000 },
  { id: 'maths-x10', name: 'Roi du Calcul', emoji: '➗', desc: '10 quiz de Maths terminés', tier: 'bronze', reward: 80, check: (s) => (s.subjectQuizzes?.maths || 0) >= 10 },
  { id: 'francais-x10', name: 'Plume d’Or', emoji: '🖋️', desc: '10 quiz de Français terminés', tier: 'bronze', reward: 80, check: (s) => (s.subjectQuizzes?.francais || 0) >= 10 },
  { id: 'culture-x5', name: 'Curieux de Tout', emoji: '🌍', desc: '5 quiz d’Histoire-Géo, Sciences ou Anglais', tier: 'bronze', reward: 60, check: (s) => (s.subjectQuizzes?.histoire || 0) + (s.subjectQuizzes?.sciences || 0) + (s.subjectQuizzes?.anglais || 0) >= 5 },
  { id: 'exam-10', name: 'Examen Réussi', emoji: '📜', desc: '10/20 ou plus à l’Examen Hokage', tier: 'bronze', reward: 50, check: (s) => s.bestExam >= 10 },
  { id: 'exam-15', name: 'Presque Hokage', emoji: '🏯', desc: '15/20 à l’Examen Hokage', tier: 'argent', reward: 150, check: (s) => s.bestExam >= 15 },
  { id: 'exam-parfait', name: 'Hokage Parfait', emoji: '🔥', desc: '20/20 à l’Examen Hokage', tier: 'legende', reward: 1000, check: (s) => s.bestExam >= 20 },
  { id: 'premier-duel', name: 'Premier Duel', emoji: '⚔️', desc: 'Gagne ton premier duel', tier: 'bronze', reward: 40, check: (s) => s.duelsWon >= 1 },
  { id: 'duel-10', name: 'Duelliste', emoji: '🗡️', desc: '10 duels gagnés', tier: 'argent', reward: 120, check: (s) => s.duelsWon >= 10 },
  { id: 'duel-50', name: 'Bras Droit du Kage', emoji: '🛡️', desc: '50 duels gagnés', tier: 'or', reward: 500, check: (s) => s.duelsWon >= 50 },
  { id: 'elo-1350', name: 'ANBU de Platine', emoji: '💎', desc: 'Atteins 1350 ELO', tier: 'or', reward: 300, check: (_s, save) => save.profile.elo >= 1350 },
  { id: 'elo-1600', name: 'Kage Légendaire', emoji: '👑', desc: 'Atteins 1600 ELO', tier: 'legende', reward: 800, check: (_s, save) => save.profile.elo >= 1600 },
  { id: 'party-joueur', name: 'Esprit d’Équipe', emoji: '🤝', desc: 'Joue à un jeu à 4 joueurs', tier: 'bronze', reward: 30, check: (s) => s.partyPlayed >= 1 },
  { id: 'party-win', name: 'Champion du Plateau', emoji: '🏆', desc: 'Gagne une partie à 4 joueurs', tier: 'argent', reward: 100, check: (s) => s.partyWon >= 1 },
  { id: 'board-5', name: 'Maître des Dés', emoji: '🎲', desc: '5 victoires au Plateau Ninja', tier: 'or', reward: 250, check: (s) => s.boardWins >= 5 },
  { id: 'equipe-win', name: 'Nakama Suprême', emoji: '🛡️', desc: 'Gagne une Bataille d’Équipes (2 vs 2)', tier: 'argent', reward: 120, check: (s) => s.teamWins >= 1 },
  { id: 'equipe-10', name: 'Capitaine d’Équipe', emoji: '⚔️', desc: '10 Batailles d’Équipes gagnées', tier: 'or', reward: 350, check: (s) => s.teamWins >= 10 },
  { id: 'bataille-win', name: 'Amiral des Vagues', emoji: '🌊', desc: 'Gagne une Bataille navale (1 contre 1)', tier: 'argent', reward: 130, check: (s) => s.batailleWins >= 1 },
  { id: 'bataille-5', name: 'Corsaire de Konoha', emoji: '🚢', desc: '5 Batailles navales gagnées', tier: 'or', reward: 400, check: (s) => s.batailleWins >= 5 },
  { id: 'eclair-parfait', name: 'Éclair Parfait', emoji: '⚡', desc: '10/10 au Défi éclair (10 secondes par question)', tier: 'or', reward: 300, check: (s) => s.eclairPerfect >= 1 },
  { id: 'kahoot-joueur', name: 'Kahooteur', emoji: '📺', desc: 'Participe à une partie Kahoot', tier: 'bronze', reward: 30, check: (s) => s.kahootPlayed >= 1 },
  { id: 'kahoot-win', name: 'Roi du Kahoot', emoji: '🥇', desc: 'Gagne une partie Kahoot', tier: 'argent', reward: 120, check: (s) => s.kahootWon >= 1 },
  { id: 'slot-first', name: 'Veinard', emoji: '🎰', desc: 'Joue à la machine à sous', tier: 'bronze', check: (s) => s.slotSpins >= 1 },
  { id: 'slot-jackpot', name: 'Jackpot !', emoji: '💰', desc: 'Décroche le jackpot de la machine à sous', tier: 'or', reward: 200, check: (s) => s.jackpots >= 1 },
  { id: 'streak-3', name: 'Fidèle', emoji: '📅', desc: '3 jours de connexion d’affilée', tier: 'bronze', reward: 40, check: (_s, save) => save.streak.best >= 3 },
  { id: 'streak-7', name: 'Semaine Ninja', emoji: '🗓️', desc: '7 jours d’affilée', tier: 'argent', reward: 150, check: (_s, save) => save.streak.best >= 7 },
  { id: 'streak-30', name: 'Discipline de Fer', emoji: '🛡️', desc: '30 jours d’affilée', tier: 'legende', reward: 800, check: (_s, save) => save.streak.best >= 30 },
  { id: 'riche-1000', name: 'Petite Fortune', emoji: '🪙', desc: 'Posséder 1 000 Ryos', tier: 'bronze', reward: 50, check: (_s, save) => save.profile.ryos >= 1000 },
  { id: 'riche-5000', name: 'Banquier de Konoha', emoji: '🏦', desc: 'Posséder 5 000 Ryos (mode Créateur !)', tier: 'or', reward: 250, check: (_s, save) => save.profile.ryos >= 5000 },
  { id: 'riche-20000', name: 'Trésor du Kazekage', emoji: '💎', desc: 'Posséder 20 000 Ryos', tier: 'legende', reward: 1000, check: (_s, save) => save.profile.ryos >= 20000 },
  { id: 'polyvalent', name: 'Polyvalent', emoji: '🧠', desc: 'Joue à 3 matières différentes', tier: 'argent', reward: 100, check: (s) => s.subjectsPlayed.length >= 3 },
  { id: 'createur', name: 'Créateur de Jeux', emoji: '🛠️', desc: 'Publie ton premier jeu', tier: 'or', reward: 300, check: (s) => s.gamesPublished >= 1 },
  { id: 'testeur', name: 'Testeur Officiel', emoji: '🧪', desc: 'Joue à 3 jeux créés par d’autres', tier: 'argent', reward: 150, check: (s) => s.gamesPlayedFromOthers >= 3 },
  { id: 'ami', name: 'Nakama', emoji: '🫂', desc: 'Ajoute un ami', tier: 'bronze', reward: 40, check: (s) => s.friendsAdded >= 1 },
  { id: 'assidu', name: 'Assidu', emoji: '📚', desc: 'Joue 10 jours différents', tier: 'argent', reward: 200, check: (s) => s.daysPlayed >= 10 },
  { id: 'precision', name: 'Franc-Tireur', emoji: '🏹', desc: '80 % de réussite sur 200 questions', tier: 'or', reward: 250, check: (s) => s.questionsAnswered >= 200 && pct(s) >= 80 },
  { id: 'hokage-badge', name: 'Hokage', emoji: '🗻', desc: 'Atteindre le grade Hokage (21 000 Ryos)', tier: 'legende', reward: 1500, check: (_s, save) => save.profile.ryos >= 21000 }
];

export const badgeById = (id: string) => BADGES.find((b) => b.id === id);
