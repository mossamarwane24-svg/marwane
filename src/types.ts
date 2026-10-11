// ---------------------------------------------------------------------------
// Types partages de l'application Academie Ninja
// ---------------------------------------------------------------------------

export type GradeId =
  | 'MS' | 'GS'
  | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2'
  | '6E' | '5E' | '4E' | '3E';

export type Band = 'maternelle' | 'elementaire' | 'college';

export type SubjectId = 'maths' | 'francais' | 'histoire' | 'sciences' | 'anglais';

export type Difficulty = 'facile' | 'moyen' | 'difficile';

/** Maniere dont l'eleve repond : choix multiples, saisie clavier, vrai/faux. */
export type QuestionFormat = 'qcm' | 'input' | 'vf';

/** Mode de reponse choisi par l'enfant ou le parent. */
export type AnswerMode = 'qcm' | 'mixte' | 'saisie';

export interface Question {
  id: string;
  subject: SubjectId;
  band: Band;
  /** Si defini, la question n'est tiree que pour ces classes. */
  grades?: GradeId[];
  /** 1 = facile, 2 = moyen, 3 = difficile */
  level: 1 | 2 | 3;
  prompt: string;
  choices: string[];
  answer: number;
  explanation?: string;
  /** qcm (defaut) : 4 choix · input : reponse a taper · vf : vrai/faux */
  format?: QuestionFormat;
  /** En mode vrai/faux : la reponse proposee a valider ou refuser. */
  proposal?: string;
}

export interface GradeInfo {
  id: GradeId;
  label: string;
  band: Band;
  order: number;
  age: string;
  emoji: string;
}

export interface RankInfo {
  id: string;
  name: string;
  min: number;
  emoji: string;
  colors: [string, string];
  perk: string;
}

export type GameType =
  | 'quiz' | 'examen' | 'duel' | 'party' | 'kahoot' | 'arcade' | 'creator' | 'defi' | 'revision';

export interface HistoryEntry {
  id: string;
  type: GameType;
  label: string;
  correct: number;
  total: number;
  score: number;
  max: number;
  ryos: number;
  eloDelta?: number;
  opponent?: string;
  at: number;
}

export interface Stats {
  questionsAnswered: number;
  correctAnswers: number;
  quizzesPlayed: number;
  perfectQuizzes: number;
  examsTaken: number;
  bestExam: number;
  duelsPlayed: number;
  duelsWon: number;
  partyPlayed: number;
  partyWon: number;
  kahootPlayed: number;
  kahootWon: number;
  boardWins: number;
  /** Victoires en Bataille d'equipes (2 vs 2). */
  teamWins: number;
  /** Victoires en Bataille navale (1 contre 1). */
  batailleWins: number;
  /** Victoires au Memory des Ninjas. */
  memoryWins: number;
  /** Feuilles de revision generees pour impression. */
  sheetsPrinted: number;
  /** Erreurs corrigees dans le cahier d'erreurs. */
  errorsFixed: number;
  /** Defis eclair (10 questions en 10 s) reussis avec 10/10. */
  eclairPerfect: number;
  /** Nombre de quiz termines par matiere (ex : { maths: 4 }). */
  subjectQuizzes: Partial<Record<SubjectId, number>>;
  slotSpins: number;
  jackpots: number;
  bestRun: number;
  subjectsPlayed: SubjectId[];
  friendsAdded: number;
  gamesPublished: number;
  gamesPlayedFromOthers: number;
  ryosEarnedTotal: number;
  daysPlayed: number;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  grade: GradeId;
  difficulty: Difficulty;
  ryos: number;
  elo: number;
  createdAt: number;
  favoriteSubject: SubjectId;
}

export interface DailyChallenges {
  date: string;
  progress: Record<string, number>;
  claimed: string[];
}

export interface StreakInfo {
  days: number;
  best: number;
  last: string;
}

export interface FriendsState {
  ids: string[];
  incoming: { from: string; name: string; at: number }[];
  outgoing: string[];
}

export interface Settings {
  sound: boolean;
  timer: boolean;
  showExplanations: boolean;
  /** QCM classique, mixte (QCM + vrai/faux + saisie) ou saisie clavier. */
  answerMode: AnswerMode;
}

export interface CustomQuestion {
  prompt: string;
  choices: string[];
  answer: number;
  explanation?: string;
  /** qcm (defaut) : 4 choix · input : reponse a taper · vf : vrai/faux */
  format?: QuestionFormat;
  /** En mode vrai/faux : la reponse proposee a valider ou refuser. */
  proposal?: string;
}

export interface CustomGame {
  id: string;
  title: string;
  subject: string;
  grades: GradeId[];
  difficulty: Difficulty;
  questions: CustomQuestion[];
  authorId: string;
  authorName: string;
  createdAt: number;
  plays: number;
  likes: number;
}

export interface ShopItem {
  id: string;
  kind: 'avatar' | 'theme';
  name: string;
  price: number;
  preview: string;
  desc: string;
}

export interface SaveState {
  version: number;
  profile: Profile;
  stats: Stats;
  badges: string[];
  history: HistoryEntry[];
  daily: DailyChallenges;
  streak: StreakInfo;
  shop: { avatars: string[]; themes: string[]; theme: string };
  customGames: CustomGame[];
  /** Cahier d'erreurs : questions ratees a rejouer. */
  errors: ErrorEntry[];
  friends: FriendsState;
  settings: Settings;
  seenRanks: string[];
}

// --- Multijoueur -----------------------------------------------------------

import type { ErrorEntry } from './lib/errors';

export interface NetPlayer {
  id: string;
  name: string;
  avatar: string;
  elo: number;
  ryos: number;
  grade: GradeId;
  status: 'lobby' | 'playing';
  socketId?: string;
  bot?: boolean;
}

export interface RoomState {
  code: string;
  hostId: string;
  game: PartyGameId | 'duel' | 'kahoot';
  players: NetPlayer[];
  started: boolean;
  round: number;
  phase: string;
  payload: any;
}

export type PartyGameId = 'plateau' | 'kunai' | 'boss' | 'morpion' | 'loto' | 'course' | 'equipe' | 'bataille' | 'memory';

export interface PartyGameInfo {
  id: PartyGameId;
  name: string;
  emoji: string;
  desc: string;
  minPlayers: number;
  maxPlayers: number;
  rules: string[];
  tag: string;
}

export interface ChatMessage {
  id: string;
  from: string;
  name: string;
  text: string;
  at: number;
}
