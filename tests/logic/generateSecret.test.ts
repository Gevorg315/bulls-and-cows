import { describe, expect, it } from 'vitest';
import { generateSecret } from '../../src/logic/generateSecret';

// Creates a predictable random function for testing.
const createRandom = (values: number[]): (() => number) => {
  let index = 0;

  return () => values[index++] ?? 0;
};

describe('generateSecret', () => {
  it('generates a secret with the requested length', () => {
    const secret = generateSecret(4, 10, createRandom([0, 0.1, 0.2, 0.3]));

    expect(secret).toHaveLength(4);
  });

  it('preserves leading zeros', () => {
    const secret = generateSecret(4, 10, createRandom([0, 0.1, 0.2, 0.3]));

    expect(secret).toBe('0123');
  });

  it('generates unique digits even when the random source repeats a value', () => {
    const secret = generateSecret(4, 10, createRandom([0, 0, 0.1, 0.2, 0.3]));

    expect(secret).toBe('0123');
    expect(new Set(secret).size).toBe(secret.length);
  });

  it('supports hexadecimal digits', () => {
    const secret = generateSecret(3, 16, createRandom([0, 0.625, 0.9375]));

    expect(secret).toBe('0AF');
  });

  it('supports binary numbers', () => {
    const secret = generateSecret(2, 2, createRandom([0, 0.99]));

    expect(secret).toBe('01');
  });
});
