import { describe, expect, it } from 'vitest';
import { isValidGuess } from '../../src/logic/isValidGuess';

describe('isValidGuess', () => {
  describe('valid guesses', () => {
    it('should accept a valid binary guess', () => {
      expect(isValidGuess('10', 2, 2)).toBe(true);
    });

    it('should accept a valid octal guess', () => {
      expect(isValidGuess('127', 3, 8)).toBe(true);
    });

    it('should accept a valid decimal guess', () => {
      expect(isValidGuess('507', 3, 10)).toBe(true);
    });

    it('should accept a valid hexadecimal guess', () => {
      expect(isValidGuess('A3F', 3, 16)).toBe(true);
    });

    it('should accept lowercase hexadecimal characters', () => {
      expect(isValidGuess('af3', 3, 16)).toBe(true);
    });
  });

  describe('invalid guesses', () => {
    it('should reject a guess that is too short', () => {
      expect(isValidGuess('12', 3, 10)).toBe(false);
    });

    it('should reject a guess that is too long', () => {
      expect(isValidGuess('1234', 3, 10)).toBe(false);
    });

    it('should reject duplicate digits', () => {
      expect(isValidGuess('112', 3, 10)).toBe(false);
    });

    it('should reject duplicate hexadecimal digits regardless of case', () => {
      expect(isValidGuess('aA', 2, 16)).toBe(false);
    });

    it('should reject characters outside the selected base', () => {
      expect(isValidGuess('129', 3, 8)).toBe(false);
    });

    it('should reject an empty guess', () => {
      expect(isValidGuess('', 2, 10)).toBe(false);
    });

    it('should reject unsupported number bases', () => {
      expect(isValidGuess('12', 2, 5)).toBe(false);
    });

    it('should reject a length greater than the number base', () => {
      expect(isValidGuess('012', 3, 2)).toBe(false);
    });
  });
});
