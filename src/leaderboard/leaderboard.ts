export interface LeaderboardEntry {
  attempts: number;
  time: number;
  base: number;
  length: number;
  date: string;
}

const LEADERBOARD_KEY = 'bulls-and-cows-leaderboard';
const MAX_LEADERBOARD_ENTRIES = 10;

// Check that data loaded from localStorage has the expected structure.
const isLeaderboardEntry = (value: unknown): value is LeaderboardEntry => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.attempts === 'number' &&
    Number.isInteger(entry.attempts) &&
    entry.attempts > 0 &&
    typeof entry.time === 'number' &&
    Number.isFinite(entry.time) &&
    entry.time >= 0 &&
    typeof entry.base === 'number' &&
    [2, 8, 10, 16].includes(entry.base) &&
    typeof entry.length === 'number' &&
    Number.isInteger(entry.length) &&
    entry.length >= 2 &&
    entry.length <= 6 &&
    entry.length <= entry.base &&
    (entry.base !== 2 || entry.length === 2) &&
    typeof entry.date === 'string'
  );
};

// Sort without modifying the original array.
export const sortLeaderboard = (entries: LeaderboardEntry[]): LeaderboardEntry[] =>
  [...entries].sort(
    (a, b) => a.attempts - b.attempts || a.time - b.time || a.date.localeCompare(b.date),
  );

// Load saved results from the browser.
export const loadLeaderboard = (storage: Storage = localStorage): LeaderboardEntry[] => {
  try {
    const savedData = storage.getItem(LEADERBOARD_KEY);

    if (!savedData) {
      return [];
    }

    const parsedData: unknown = JSON.parse(savedData);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return sortLeaderboard(parsedData.filter(isLeaderboardEntry)).slice(0, MAX_LEADERBOARD_ENTRIES);
  } catch {
    return [];
  }
};

// Save a completed game and keep only the top 10 results.
export const saveLeaderboardEntry = (
  newEntry: LeaderboardEntry,
  storage: Storage = localStorage,
): LeaderboardEntry[] => {
  const sortedEntries = sortLeaderboard([...loadLeaderboard(storage), newEntry]).slice(
    0,
    MAX_LEADERBOARD_ENTRIES,
  );

  try {
    storage.setItem(LEADERBOARD_KEY, JSON.stringify(sortedEntries));
  } catch {
    // The current result can still be displayed if storage is unavailable.
  }

  return sortedEntries;
};
