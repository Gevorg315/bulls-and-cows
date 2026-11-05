import { describe, expect, it } from 'vitest';
import { createDigitValidator } from '../../src/logic/createDigitValidator';

describe('createDigitValidator', () => {
  it('validates binary digits', () => {
    const isValid = createDigitValidator(2);

    expect(isValid('0')).toBe(true);
    expect(isValid('1')).toBe(true);
    expect(isValid('2')).toBe(false);
  });

  it('validates octal digits', () => {
    const isValid = createDigitValidator(8);

    expect(isValid('0')).toBe(true);
    expect(isValid('7')).toBe(true);
    expect(isValid('8')).toBe(false);
  });

  it('validates decimal digits', () => {
    const isValid = createDigitValidator(10);

    expect(isValid('0')).toBe(true);
    expect(isValid('9')).toBe(true);
    expect(isValid('A')).toBe(false);
  });

  it('validates hexadecimal digits', () => {
    const isValid = createDigitValidator(16);

    expect(isValid('0')).toBe(true);
    expect(isValid('9')).toBe(true);
    expect(isValid('a')).toBe(true);
    expect(isValid('F')).toBe(true);
    expect(isValid('G')).toBe(false);
  });

  it('treats uppercase and lowercase hexadecimal digits equally', () => {
    const isValid = createDigitValidator(16);

    expect(isValid('a')).toBe(isValid('A'));
    expect(isValid('f')).toBe(isValid('F'));
  });

  it('rejects empty strings and strings with multiple characters', () => {
    const isValid = createDigitValidator(16);

    expect(isValid('')).toBe(false);
    expect(isValid('12')).toBe(false);
  });
});
