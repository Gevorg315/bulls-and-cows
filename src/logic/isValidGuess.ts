import { createDigitValidator } from './createDigitValidator';

export const isValidGuess = (guess: string, length: number, base: number): boolean => {
  if (![2, 8, 10, 16].includes(base)) {
    return false;
  }

  if (!Number.isInteger(length) || length < 1 || length > base) {
    return false;
  }

  if (guess.length !== length) {
    return false;
  }

  const isValidDigit = createDigitValidator(base);
  const digits = guess.toLowerCase().split('');

  const hasValidDigits = digits.every(isValidDigit);
  const hasUniqueDigits = new Set(digits).size === digits.length;

  return hasValidDigits && hasUniqueDigits;
};
