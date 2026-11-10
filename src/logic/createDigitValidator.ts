export const createDigitValidator = (base: number): ((char: string) => boolean) => {
  if (![2, 8, 10, 16].includes(base)) {
    throw new RangeError('Unsupported number base');
  }

  return (char: string): boolean => {
    if (char.length !== 1) {
      return false;
    }

    return Number.parseInt(char, base).toString(base) === char.toLowerCase();
  };
};
