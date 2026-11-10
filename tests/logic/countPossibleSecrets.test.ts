import { describe, expect, it } from 'vitest';
import { countPossibleSecrets } from '../../src/logic/countPossibleSecrets';

describe('countPossibleSecrets', () => {
  describe('valid inputs', () => {
    it('should count binary secrets of length 2', () => {
      expect(countPossibleSecrets(2, 2)).toBe(2);
    });

    it('should count decimal secrets of length 2', () => {
      expect(countPossibleSecrets(2, 10)).toBe(90);
    });

    it('should count decimal secrets of length 3', () => {
      expect(countPossibleSecrets(3, 10)).toBe(720);
    });

    it('should count octal secrets of length 3', () => {
      expect(countPossibleSecrets(3, 8)).toBe(336);
    });

    it('should count hexadecimal secrets of length 2', () => {
      expect(countPossibleSecrets(2, 16)).toBe(240);
    });

    it('should count secrets of length 1', () => {
      expect(countPossibleSecrets(1, 10)).toBe(10);
    });
  });

  describe('invalid inputs', () => {
    it('should throw RangeError for unsupported bases', () => {
      expect(() => countPossibleSecrets(2, 5)).toThrow(RangeError);
    });

    it('should throw RangeError when length exceeds base', () => {
      expect(() => countPossibleSecrets(3, 2)).toThrow(RangeError);
    });

    it('should throw RangeError for zero length', () => {
      expect(() => countPossibleSecrets(0, 10)).toThrow(RangeError);
    });

    it('should throw RangeError for negative length', () => {
      expect(() => countPossibleSecrets(-1, 10)).toThrow(RangeError);
    });

    it('should throw RangeError for non-integer length', () => {
      expect(() => countPossibleSecrets(2.5, 10)).toThrow(RangeError);
    });
  });
});
