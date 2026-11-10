import { describe, it, expect } from 'vitest';
import {
  loadLeaderboard,
  saveLeaderboardEntry,
  sortLeaderboard,
} from '../../src/leaderboard/leaderboard.js';
import type { LeaderboardEntry } from '../../src/leaderboard/leaderboard.js';

const STORAGE_KEY = 'bulls-and-cows-leaderboard';

const createEntry = (overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry => ({
  attempts: 3,
  time: 50,
  base: 10,
  length: 4,
  date: '2026-11-07T12:00:00.000Z',
  ...overrides,
});

const createMockStorage = (): Storage => {
  let data: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(data).length;
    },

    clear() {
      data = {};
    },

    getItem(key) {
      return data[key] ?? null;
    },

    key(index) {
      return Object.keys(data)[index] ?? null;
    },

    removeItem(key) {
      delete data[key];
    },

    setItem(key, value) {
      data[key] = String(value);
    },
  };
};

describe('sortLeaderboard', () => {
  it('should sort entries by attempts, then time', () => {
    const entries = [
      createEntry({ attempts: 5, time: 30 }),
      createEntry({ attempts: 2, time: 60 }),
      createEntry({ attempts: 2, time: 40 }),
    ];

    const sortedEntries = sortLeaderboard(entries);

    expect(sortedEntries.map((entry) => [entry.attempts, entry.time])).toEqual([
      [2, 40],
      [2, 60],
      [5, 30],
    ]);
  });

  it('should sort entries by date when attempts and time are equal', () => {
    const entries = [
      createEntry({ date: '2026-11-09T12:00:00.000Z' }),
      createEntry({ date: '2026-11-07T12:00:00.000Z' }),
      createEntry({ date: '2026-11-08T12:00:00.000Z' }),
    ];

    const sortedEntries = sortLeaderboard(entries);

    expect(sortedEntries.map((entry) => entry.date)).toEqual([
      '2026-11-07T12:00:00.000Z',
      '2026-11-08T12:00:00.000Z',
      '2026-11-09T12:00:00.000Z',
    ]);
  });

  it('should not mutate the original entries array', () => {
    const entries = [createEntry({ attempts: 5 }), createEntry({ attempts: 2 })];

    const originalEntries = [...entries];

    sortLeaderboard(entries);

    expect(entries).toEqual(originalEntries);
  });
});

describe('loadLeaderboard', () => {
  it('should return an empty array when storage is empty', () => {
    const storage = createMockStorage();

    expect(loadLeaderboard(storage)).toEqual([]);
  });

  it('should load, validate, and sort saved entries', () => {
    const storage = createMockStorage();

    const entries = [
      createEntry({ attempts: 5 }),
      createEntry({ attempts: 2 }),
      { attempts: 'invalid' },
    ];

    storage.setItem(STORAGE_KEY, JSON.stringify(entries));

    expect(loadLeaderboard(storage)).toEqual([
      createEntry({ attempts: 2 }),
      createEntry({ attempts: 5 }),
    ]);
  });

  it('should return an empty array when saved JSON is invalid', () => {
    const storage = createMockStorage();

    storage.setItem(STORAGE_KEY, 'invalid JSON');

    expect(loadLeaderboard(storage)).toEqual([]);
  });
});

describe('saveLeaderboardEntry', () => {
  it('should save a new entry and return sorted entries', () => {
    const storage = createMockStorage();

    storage.setItem(STORAGE_KEY, JSON.stringify([createEntry({ attempts: 5 })]));

    const newEntry = createEntry({ attempts: 2 });

    const result = saveLeaderboardEntry(newEntry, storage);

    expect(result).toEqual([newEntry, createEntry({ attempts: 5 })]);

    expect(loadLeaderboard(storage)).toEqual(result);
  });

  it('should keep only the top 10 entries', () => {
    const storage = createMockStorage();

    const existingEntries = Array.from({ length: 10 }, (_, index) =>
      createEntry({ attempts: index + 10 }),
    );

    storage.setItem(STORAGE_KEY, JSON.stringify(existingEntries));

    const newEntry = createEntry({ attempts: 1 });

    const result = saveLeaderboardEntry(newEntry, storage);

    expect(result).toHaveLength(10);
    expect(result[0]).toEqual(newEntry);
    expect(result[9].attempts).toBe(18);
  });
});
