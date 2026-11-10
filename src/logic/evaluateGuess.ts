export interface GuessResult {
  bulls: number;
  cows: number;
}

export const evaluateGuess = (secret: string, guess: string): GuessResult => {
  const normalizedSecret = secret.toLowerCase().split('');
  const normalizedGuess = guess.toLowerCase().split('');

  const bulls = normalizedGuess.reduce(
    (count, digit, index) => count + Number(digit === normalizedSecret[index]),
    0,
  );

  const cows = normalizedGuess.reduce(
    (count, digit, index) =>
      count + Number(digit !== normalizedSecret[index] && normalizedSecret.includes(digit)),
    0,
  );

  return { bulls, cows };
};
