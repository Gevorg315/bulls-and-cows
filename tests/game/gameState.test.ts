import { describe, it, expect } from 'vitest';
import {
  addGuess,
  createInitialGameState,
  resetGame,
  startGame,
} from '../../src/game/gameState.js';

describe('createInitialGameState', () => {
  it('should create the initial game state', () => {
    const state = createInitialGameState();

    expect(state).toEqual({
      base: 10,
      length: 4,
      secret: '',
      possibleSecrets: 0,
      status: 'setup',
      isDigitValid: null,
      attempts: 0,
      history: [],
    });
  });
});

describe('startGame', () => {
  it('should create a new game with the selected settings', () => {
    const randomValues = [0.01, 0.11, 0.21, 0.31];
    let index = 0;

    const random = (): number => randomValues[index++] ?? 0;

    const state = startGame(10, 4, random);

    expect(state.base).toBe(10);
    expect(state.length).toBe(4);
    expect(state.secret).toBe('0123');
    expect(state.possibleSecrets).toBe(5040);
    expect(state.status).toBe('playing');
    expect(state.attempts).toBe(0);
    expect(state.history).toEqual([]);
    expect(state.isDigitValid?.('5')).toBe(true);
    expect(state.isDigitValid?.('A')).toBe(false);
  });
});

describe('addGuess', () => {
  it('should add a guess and increment attempts', () => {
    const randomValues = [0.01, 0.11, 0.21, 0.31];
    let index = 0;

    const random = (): number => randomValues[index++] ?? 0;

    const initialState = startGame(10, 4, random);

    const updatedState = addGuess(initialState, '1234', {
      bulls: 2,
      cows: 1,
    });

    expect(updatedState.attempts).toBe(1);
    expect(updatedState.history).toEqual([
      {
        guess: '1234',
        bulls: 2,
        cows: 1,
      },
    ]);
    expect(updatedState.status).toBe('playing');
  });

  it('should not mutate the original state or history', () => {
    const initialState = startGame(
      10,
      4,
      (() => {
        const values = [0.01, 0.11, 0.21, 0.31];
        let index = 0;
        return () => values[index++] ?? 0;
      })(),
    );

    const originalHistory = initialState.history;

    const updatedState = addGuess(initialState, '4567', {
      bulls: 1,
      cows: 2,
    });

    expect(updatedState).not.toBe(initialState);
    expect(updatedState.history).not.toBe(originalHistory);
    expect(initialState.attempts).toBe(0);
    expect(initialState.history).toEqual([]);
    expect(updatedState.attempts).toBe(1);
  });

  it('should preserve previous guesses when adding a new guess', () => {
    const initialState = startGame(
      10,
      4,
      (() => {
        const values = [0.01, 0.11, 0.21, 0.31];
        let index = 0;
        return () => values[index++] ?? 0;
      })(),
    );

    const firstState = addGuess(initialState, '4567', {
      bulls: 1,
      cows: 2,
    });

    const secondState = addGuess(firstState, '5678', {
      bulls: 0,
      cows: 2,
    });

    expect(secondState.attempts).toBe(2);
    expect(secondState.history).toHaveLength(2);
    expect(firstState.history).toHaveLength(1);
  });

  it('should mark the game as won when all digits are bulls', () => {
    const initialState = startGame(
      10,
      4,
      (() => {
        const values = [0.01, 0.11, 0.21, 0.31];
        let index = 0;
        return () => values[index++] ?? 0;
      })(),
    );

    const updatedState = addGuess(initialState, '0123', {
      bulls: 4,
      cows: 0,
    });

    expect(updatedState.status).toBe('won');
    expect(updatedState.attempts).toBe(1);
  });

  it('should not update a game that is not playing', () => {
    const initialState = createInitialGameState();

    const updatedState = addGuess(initialState, '1234', {
      bulls: 0,
      cows: 0,
    });

    expect(updatedState).toBe(initialState);
    expect(updatedState.attempts).toBe(0);
    expect(updatedState.history).toEqual([]);
  });

  it('should not update a game after it has been won', () => {
    const playingState = startGame(
      10,
      4,
      (() => {
        const values = [0.01, 0.11, 0.21, 0.31];
        let index = 0;
        return () => values[index++] ?? 0;
      })(),
    );

    const wonState = addGuess(playingState, '0123', {
      bulls: 4,
      cows: 0,
    });

    const updatedState = addGuess(wonState, '4567', {
      bulls: 0,
      cows: 0,
    });

    expect(updatedState).toBe(wonState);
    expect(updatedState.attempts).toBe(1);
    expect(updatedState.history).toHaveLength(1);
  });
});

describe('resetGame', () => {
  it('should reset the game using the selected settings', () => {
    const state = resetGame(16, 5);

    expect(state.base).toBe(16);
    expect(state.length).toBe(5);
    expect(state.secret).toBe('');
    expect(state.possibleSecrets).toBe(0);
    expect(state.status).toBe('setup');
    expect(state.isDigitValid).toBeNull();
    expect(state.attempts).toBe(0);
    expect(state.history).toEqual([]);
  });
});
