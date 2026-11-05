export const generateSecret = (
  length: number,
  base: number,
  random: () => number = Math.random,
): string => {
  if (![2, 8, 10, 16].includes(base)) {
    throw new RangeError('Unsupported number base');
  }

  if (length < 1 || length > base) {
    throw new RangeError('Invalid secret length');
  }

  const selectedDigits = new Set<string>();

  while (selectedDigits.size < length) {
    const randomIndex = Math.floor(random() * base);
    const digit = randomIndex.toString(base).toUpperCase();

    selectedDigits.add(digit);
  }

  return [...selectedDigits].join('');
};
