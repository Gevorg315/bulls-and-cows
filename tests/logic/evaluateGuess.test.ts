import { describe, expect, it } from 'vitest';
import { evaluateGuess } from '../../src/logic/evaluateGuess';

describe('evaluateGuess', () => {
  it('counts bulls when digits are in the correct positions', () => {
    expect(evaluateGuess('1234', '1234')).toEqual({
      bulls: 4,
      cows: 0,
    });
  });

  it('counts bulls and cows correctly', () => {
    expect(evaluateGuess('1234', '1243')).toEqual({
      bulls: 2,
      cows: 2,
    });
  });

  it('counts cows when all digits are in incorrect positions', () => {
    expect(evaluateGuess('1234', '4321')).toEqual({
      bulls: 0,
      cows: 4,
    });
  });

  it('returns zero bulls and cows when no digits match', () => {
    expect(evaluateGuess('1234', '5678')).toEqual({
      bulls: 0,
      cows: 0,
    });
  });

  it('works with hexadecimal digits', () => {
    expect(evaluateGuess('1A2F', '1F2A')).toEqual({
      bulls: 2,
      cows: 2,
    });
  });
});
