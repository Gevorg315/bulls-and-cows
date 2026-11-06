const memo = new Map<string, number>();

const countPermutations = (availableDigits: number, remainingLength: number): number => {
  if (remainingLength === 0) {
    return 1;
  }

  if (remainingLength > availableDigits) {
    return 0;
  }

  const cacheKey = `${availableDigits}:${remainingLength}`;
  const cachedResult = memo.get(cacheKey);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const result = availableDigits * countPermutations(availableDigits - 1, remainingLength - 1);

  memo.set(cacheKey, result);

  return result;
};

export const countPossibleSecrets = (length: number, base: number): number => {
  if (![2, 8, 10, 16].includes(base)) {
    throw new RangeError('Unsupported number base');
  }

  if (!Number.isInteger(length) || length < 1 || length > base) {
    throw new RangeError('Invalid secret length');
  }

  return countPermutations(base, length);
};
