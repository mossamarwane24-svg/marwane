import type { PartyGameId, SubjectId } from '../src/types';

export declare const GAME_IDS: PartyGameId[];
export declare const SQUARE_TYPES: string[];
export declare const BOARD_SIZE: number;

export interface EngineQuestion {
  prompt: string;
  choices: string[];
  answer: number;
  explanation?: string;
  subject?: SubjectId;
}

export interface EnginePlayer {
  id: string;
  name: string;
  avatar: string;
  bot: boolean;
  pos: number;
  score: number;
  hp: number;
  alive: boolean;
  correct: number;
  wrong: number;
  streak: number;
  best: number;
  finished: boolean;
  card: number[];
  marks: number[];
  pick: string | null;
  ready: boolean;
  answered: boolean;
  lastPoints: number;
  /** Equipe (0 ou 1) pour le mode Bataille d'equipes. */
  team?: number;
  /** Navires du joueur (bataille navale). Les cases adverses sont masquees cote client. */
  ships: { size: number; cells: number[]; hits: number[]; sunk?: boolean }[];
  /** Cases deja visees par l'adversaire : { [cell]: 'hit' | 'miss' } */
  incoming: Record<number, 'hit' | 'miss'>;
}

export interface EngineShip {
  size: number;
  cells: number[];
  hits: number[];
  sunk?: boolean;
}

export interface EngineState {
  gameId: PartyGameId;
  players: EnginePlayer[];
  turn: number;
  round: number;
  maxRounds: number;
  phase: 'lancer' | 'question' | 'pick' | 'fin';
  question: EngineQuestion | null;
  questions: EngineQuestion[];
  qIndex: number;
  board: { index: number; type: string }[];
  grid: (number | null)[];
  drawn: number[];
  pending: { dice: number | null; pick: any; bossHp: number; answers: Record<string, number> };
  log: { at: number; text: string }[];
  winners: string[];
  over: boolean;
  /** Mort subite (bataille d'equipes) : nombre de prolongations. */
  suddenDeath: number;
  hardCap: number;
  createdAt: number;
  updatedAt: number;
}

export type EngineAction =
  | { type: 'roll'; playerId: string; dice?: number }
  | { type: 'answer'; playerId: string; choice: number; pick?: string }
  | { type: 'pick'; playerId: string; payload: any };

export declare function shuffle<T>(list: T[]): T[];
export declare function makeBoard(size?: number): { index: number; type: string }[];
export declare function createGameState(
  gameId: PartyGameId,
  players: { id: string; name: string; avatar?: string; bot?: boolean }[],
  options?: { questions?: EngineQuestion[]; maxRounds?: number; boardSize?: number }
): EngineState;
export declare function reduce(state: EngineState, action: EngineAction): EngineState;
export declare function publicState(state: EngineState, forPlayerId?: string | null): EngineState & { forPlayerId: string | null };
export declare function currentIsBot(state: EngineState): boolean;
export declare function botAction(state: EngineState, skill?: number): EngineAction | null;
export declare function botDelay(): number;
export declare function computeRewards(
  state: EngineState,
  playerId: string
): { ryos: number; elo: number; won: boolean; rank: number };
export declare function ranking(
  state: EngineState
): { id: string; name: string; avatar: string; bot: boolean; score: number; correct: number; wrong: number; best: number }[];
export declare function eloDelta(eloA: number, eloB: number, scoreA: number): number;
export declare function hasLine(p: EnginePlayer): boolean;
