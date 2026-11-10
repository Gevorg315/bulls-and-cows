import { createDigitValidator } from '../logic/createDigitValidator.js';
import { countPossibleSecrets } from '../logic/countPossibleSecrets.js';
import { generateSecret } from '../logic/generateSecret.js';
import type { GuessResult } from '../logic/evaluateGuess.js';

export type GameStatus = 'setup' | 'playing' | 'won';

export interface GuessHistoryEntry {
  guess: string;
  bulls: number;
  cows: number;
}

export interface GameState {
  base: number;
  length: number;
  secret: string;
  possibleSecrets: number;
  status: GameStatus;
  isDigitValid: ((char: string) => boolean) | null;
  attempts: number;
  history: GuessHistoryEntry[];
}

export const createInitialGameState = (): GameState => ({
  base: 10,
  length: 4,
  secret: '',
  possibleSecrets: 0,
  status: 'setup',
  isDigitValid: null,
  attempts: 0,
  history: [],
});

export const startGame = (
  base: number,
  length: number,
  random: () => number = Math.random,
): GameState => ({
  base,
  length,
  secret: generateSecret(length, base, random),
  possibleSecrets: countPossibleSecrets(length, base),
  status: 'playing',
  isDigitValid: createDigitValidator(base),
  attempts: 0,
  history: [],
});

export const addGuess = (state: GameState, guess: string, result: GuessResult): GameState => {
  if (state.status !== 'playing') {
    return state;
  }

  const newEntry: GuessHistoryEntry = {
    guess,
    bulls: result.bulls,
    cows: result.cows,
  };

  return {
    ...state,
    attempts: state.attempts + 1,
    history: [...state.history, newEntry],
    status: result.bulls === state.length ? 'won' : 'playing',
  };
};

export const resetGame = (base: number, length: number): GameState => ({
  base,
  length,
  secret: '',
  possibleSecrets: 0,
  status: 'setup',
  isDigitValid: null,
  attempts: 0,
  history: [],
});
