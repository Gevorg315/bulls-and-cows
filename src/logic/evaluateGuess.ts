export interface GuessResult {
  bulls: number;
  cows: number;
}

export const evaluateGuess = (secret: string, guess: string): GuessResult => {
  let bulls = 0;
  let cows = 0;

  for (let index = 0; index < secret.length; index += 1) {
    if (secret[index] === guess[index]) {
      bulls += 1;
    } else if (secret.includes(guess[index])) {
      cows += 1;
    }
  }

  return { bulls, cows };
};
