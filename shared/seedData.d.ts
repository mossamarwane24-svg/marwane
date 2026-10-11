import type { CustomGame } from '../src/types';

export interface SeedUser {
  name: string;
  avatar: string;
  grade: string;
  elo: number;
  ryos: number;
  streak: number;
}

export declare const SEED_USERS: SeedUser[];
export declare const SEED_GAMES: CustomGame[];
