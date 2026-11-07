# Bulls and Cows — Design Document

## 1. Project Overview

Bulls and Cows is a number-guessing game implemented using TypeScript, HTML, and CSS.

The computer generates a secret code containing unique digits. The player tries to guess the code and receives feedback after each attempt:

- **Bull:** A digit is correct and in the correct position.
- **Cow:** A digit exists in the secret code but is in the wrong position.

The game supports four number systems:

- Binary (base 2)
- Octal (base 8)
- Decimal (base 10)
- Hexadecimal (base 16)

The player can select a secret length from 2 to 6 digits, subject to the selected base. Binary is restricted to a length of 2.

All game logic and user interface functionality are implemented in TypeScript.

---

## 2. Data Structures

### 2.1. Set — Unique Secret Digits

**File:** `src/logic/generateSecret.ts`

A JavaScript `Set` stores the digits selected for the secret code.

```ts
const selectedDigits = new Set<string>();
```

A Set automatically prevents duplicate values. This guarantees that every digit in the generated secret is unique.

The Set is converted into an array and then into a string:

```ts
return [...selectedDigits].join('');
```

**Time complexity:** Average O(1) for each Set insertion. Generating a secret takes an expected O(length) number of successful insertions, although random collisions can require additional attempts.

### 2.2. Array — Guess History

**File:** `src/game/gameState.ts`

The game stores previous guesses in an array:

```ts
export interface GuessHistoryEntry {
  guess: string;
  bulls: number;
  cows: number;
}
```

The `GameState` interface contains:

```ts
history: GuessHistoryEntry[];
```

Every new guess creates a new history array instead of modifying the original:

```ts
history: [...state.history, newEntry];
```

This approach makes state updates immutable and preserves previous game states.

**Time complexity:** Adding a guess takes O(n), where n is the number of previous guesses, because the existing array is copied.

### 2.3. Object — Game State

**File:** `src/game/gameState.ts`

The `GameState` interface describes the complete state of a game.

It contains:

- `base` — selected number system.
- `length` — secret code length.
- `secret` — generated secret code.
- `possibleSecrets` — number of possible secret codes.
- `status` — current game status.
- `isDigitValid` — digit validation function.
- `attempts` — number of guesses.
- `history` — previous guesses and their results.

The game status is represented by a union type:

```ts
export type GameStatus = 'setup' | 'playing' | 'won';
```

This makes the allowed game states explicit and prevents arbitrary status values.

### 2.4. Map — Memoization Cache

**File:** `src/logic/countPossibleSecrets.ts`

A `Map` stores previously calculated permutation results:

```ts
const memo = new Map<string, number>();
```

The cache key contains the number of available digits and the remaining secret length.

```ts
const cacheKey = `${availableDigits}:${remainingLength}`;
```

Before calculating a result, the function checks whether it already exists in the cache.

This avoids repeating the same recursive calculations.

### 2.5. Array of Objects — Leaderboard

**File:** `src/leaderboard/leaderboard.ts`

Each leaderboard entry is represented by the `LeaderboardEntry` interface:

```ts
export interface LeaderboardEntry {
  attempts: number;
  time: number;
  base: number;
  length: number;
  date: string;
}
```

The leaderboard is an array of these objects, sorted by:

1. Lowest number of attempts.
2. Lowest completion time.
3. Earliest completion date.

Only the top 10 entries are retained.

The results are stored in browser `localStorage`, allowing them to survive page refreshes.

---

## 3. Algorithms and Big O Complexity

### 3.1. generateSecret()

**File:** `src/logic/generateSecret.ts`

**Purpose:** Generates a random secret code containing unique digits.

**Algorithm:**

1. Validate the selected number base.
2. Validate the requested secret length.
3. Create an empty Set.
4. Generate random digit indexes using `Math.random()`.
5. Convert each index to the selected number base.
6. Add the digit to the Set.
7. Repeat until the Set contains the required number of unique digits.
8. Convert the Set into a string.

The function accepts an optional random number generator. This makes it possible to inject predictable values during unit testing.

**Time complexity:** Expected O(length) Set insertions, but random collisions can increase the number of attempts. For a fixed base, the expected number of draws is finite when length does not exceed base.

**Space complexity:** O(length).

### 3.2. evaluateGuess()

**File:** `src/logic/evaluateGuess.ts`

**Purpose:** Calculates the number of bulls and cows for a player's guess.

**Algorithm:**

1. Convert the secret and guess to lowercase arrays.
2. Use `reduce()` to count bulls by comparing digits at the same indexes.
3. Use another `reduce()` to count cows by checking whether a digit exists in the secret at a different position.
4. Return an object containing both counts.

The implementation uses array methods rather than manual loops.

**Time complexity:** O(length²), because each cow check uses `includes()`, which takes O(length) time, for each digit.

**Space complexity:** O(length), for the normalized arrays.

### 3.3. isValidGuess()

**File:** `src/logic/isValidGuess.ts`

**Purpose:** Checks whether a player's guess follows the game rules.

**Algorithm:**

1. Check whether the selected base is supported.
2. Validate the requested secret length.
3. Check that the guess has exactly the required number of characters.
4. Create a digit validator for the selected base.
5. Use `every()` to verify that all digits are valid.
6. Use a Set to check that all digits are unique.
7. Return `true` only if all conditions are satisfied.

**Time complexity:** O(length) average.

**Space complexity:** O(length), because the digits are stored in an array and a Set.

### 3.4. createDigitValidator()

**File:** `src/logic/createDigitValidator.ts`

**Purpose:** Creates a reusable function that validates one digit for a selected number base.

**Algorithm:**

1. Validate the selected base.
2. Return a function that accepts one character.
3. Reject values containing anything other than one character.
4. Convert the character to a number using `Number.parseInt()`.
5. Convert the number back to the selected base.
6. Compare the normalized result with the input character.

This supports lowercase and uppercase hexadecimal digits.

**Time complexity:** O(1) for the supported number bases.

**Space complexity:** O(1).

### 3.5. countPossibleSecrets()

**File:** `src/logic/countPossibleSecrets.ts`

**Purpose:** Calculates the number of possible secret codes with unique digits.

The function uses the permutation formula:

P(n, k) = n × (n - 1) × ... × (n - k + 1)

Where:

- n is the number of available digits in the selected base.
- k is the requested secret length.

**Algorithm:**

1. Validate the number base and secret length.
2. Call a recursive helper function.
3. Return 1 when the remaining length reaches zero.
4. Return 0 if the remaining length exceeds the available digits.
5. Check the memoization Map for an existing result.
6. Calculate the current result recursively.
7. Store the result in the Map.
8. Return the calculated number.

**Time complexity:** O(length) for one uncached calculation. Memoization prevents repeated calculations for the same parameters.

**Space complexity:** O(length) for the recursion stack and cached results for a single calculation sequence.

### 3.6. sortLeaderboard()

**File:** `src/leaderboard/leaderboard.ts`

**Purpose:** Sorts completed games according to their performance.

The function creates a copy of the input array and sorts it using:

1. Attempts in ascending order.
2. Time in ascending order.
3. Date in ascending order.

The original array remains unchanged.

**Time complexity:** O(n log n), where n is the number of leaderboard entries.

**Space complexity:** O(n), because a copy of the array is created.

---

## 4. Clean Code Principles

### 4.1. Single Responsibility Principle

Each module has a specific responsibility:

- `generateSecret.ts` generates secret codes.
- `evaluateGuess.ts` calculates bulls and cows.
- `isValidGuess.ts` validates guesses.
- `createDigitValidator.ts` validates individual digits.
- `countPossibleSecrets.ts` calculates possible combinations.
- `gameState.ts` manages game state.
- `leaderboard.ts` manages leaderboard data.

This separation makes the project easier to understand, test, and maintain.

### 4.2. Meaningful Names

Variables and functions use descriptive names.

Examples:

- `generateSecret`
- `countPossibleSecrets`
- `selectedDigits`
- `possibleSecrets`
- `isDigitValid`
- `completedGame`

These names communicate their purpose without requiring additional comments.

### 4.3. Immutability

The game state is updated without modifying the original object.

For example:

```ts
return {
  ...state,
  attempts: state.attempts + 1,
  history: [...state.history, newEntry],
};
```

The spread operator creates a new state object and a new history array.

This reduces unintended side effects.

### 4.4. Type Safety

TypeScript interfaces and union types describe the structure of application data.

Examples include:

- `GameState`
- `GuessHistoryEntry`
- `GuessResult`
- `LeaderboardEntry`
- `GameStatus`

Strict TypeScript compiler settings help identify potential errors during development.

### 4.5. Pure Functions and Testability

Core game logic is separated from the DOM and browser interface.

Functions such as `evaluateGuess()`, `isValidGuess()`, and `countPossibleSecrets()` produce predictable results for the same inputs.

`generateSecret()` accepts an injectable random function, allowing deterministic tests.

The leaderboard functions accept a `Storage` argument, making them testable without relying on the real browser storage.

### 4.6. Error Handling

Invalid bases and secret lengths are rejected before generating or counting secrets.

Leaderboard loading also handles invalid JSON and unavailable storage without crashing the application.

### 4.7. Separation of Concerns

The project separates:

- Game algorithms.
- Game state management.
- Leaderboard persistence.
- DOM creation and event handling.
- Styling.

This keeps the code organized and makes individual parts easier to modify.

---

## 5. Testing Strategy

The project uses Vitest for unit testing.

Tests are organized by module:

- `tests/logic/` — core game algorithms.
- `tests/game/` — game state management.
- `tests/leaderboard/` — leaderboard sorting and storage.

The tests cover:

- Valid and invalid secret generation.
- Bulls and cows calculations.
- Digit validation for supported number bases.
- Guess validation and uniqueness.
- Possible secret calculations.
- Immutable game-state updates.
- Win and reset behavior.
- Leaderboard sorting, persistence, invalid data, and top 10 limit.

The project uses TypeScript compilation, ESLint, and Prettier to maintain code quality.

---

## 6. Conclusion

The Bulls and Cows project demonstrates modular TypeScript development, reusable algorithms, immutable state management, recursive calculations, memoization, browser storage, and automated testing.

The separation of game logic from the user interface makes the application easier to maintain and extend.
