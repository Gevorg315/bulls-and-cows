export const generateSecret = (
  length: number,
  base: number,
  random: () => number = Math.random,
): string => {
  return `${length}${base}${random()}`;
};
