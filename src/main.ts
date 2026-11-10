import { evaluateGuess } from './logic/evaluateGuess.js';
import { isValidGuess } from './logic/isValidGuess.js';
import { addGuess, createInitialGameState, resetGame, startGame } from './game/gameState.js';
import { loadLeaderboard, saveLeaderboardEntry } from './leaderboard/leaderboard.js';
import type { LeaderboardEntry } from './leaderboard/leaderboard.js';

// --------------------------------------------------
// 1. Create the application elements
// --------------------------------------------------

const app = document.createElement('main');
app.id = 'app';

const header = document.createElement('header');

const title = document.createElement('h1');
title.textContent = 'Bulls and Cows';

const subtitle = document.createElement('p');
subtitle.textContent = 'Guess the secret code and discover how many digits are correct.';

header.append(title, subtitle);

// --------------------------------------------------
// 2. Create the settings section
// --------------------------------------------------

const settingsSection = document.createElement('section');
settingsSection.className = 'settings';

const settingsTitle = document.createElement('h2');
settingsTitle.textContent = 'Game settings';

const settingsForm = document.createElement('form');
settingsForm.id = 'settings-form';

const baseLabel = document.createElement('label');
baseLabel.htmlFor = 'base-select';
baseLabel.textContent = 'Number base';

const baseSelect = document.createElement('select');
baseSelect.id = 'base-select';
baseSelect.name = 'base';

[2, 8, 10, 16].forEach((base) => {
  const option = document.createElement('option');
  option.value = String(base);
  option.textContent = String(base);
  baseSelect.append(option);
});

const lengthLabel = document.createElement('label');
lengthLabel.htmlFor = 'length-select';
lengthLabel.textContent = 'Secret length';

const lengthSelect = document.createElement('select');
lengthSelect.id = 'length-select';
lengthSelect.name = 'length';

for (let length = 2; length <= 6; length += 1) {
  const option = document.createElement('option');
  option.value = String(length);
  option.textContent = String(length);
  lengthSelect.append(option);
}

const startButton = document.createElement('button');
startButton.type = 'submit';
startButton.textContent = 'Start game';

settingsForm.append(baseLabel, baseSelect, lengthLabel, lengthSelect, startButton);

settingsSection.append(settingsTitle, settingsForm);

// --------------------------------------------------
// 3. Create the game section
// --------------------------------------------------

const gameSection = document.createElement('section');
gameSection.className = 'game';
gameSection.hidden = true;

const gameTitle = document.createElement('h2');
gameTitle.textContent = 'Make your guess';

const gameDescription = document.createElement('p');
gameDescription.id = 'game-description';

const guessForm = document.createElement('form');
guessForm.id = 'guess-form';

const guessLabel = document.createElement('label');
guessLabel.htmlFor = 'guess-input';
guessLabel.textContent = 'Your guess';

const guessInput = document.createElement('input');
guessInput.id = 'guess-input';
guessInput.name = 'guess';
guessInput.type = 'text';
guessInput.autocomplete = 'off';
guessInput.placeholder = 'Enter your code';
guessInput.maxLength = 6;

const guessButton = document.createElement('button');
guessButton.type = 'submit';
guessButton.textContent = 'Check guess';

guessForm.append(guessLabel, guessInput, guessButton);

const feedback = document.createElement('p');
feedback.id = 'feedback';
feedback.setAttribute('aria-live', 'polite');

const stats = document.createElement('div');
stats.className = 'stats';

const attemptsText = document.createElement('p');
attemptsText.id = 'attempts';
attemptsText.textContent = 'Attempts: 0';

const timerText = document.createElement('p');
timerText.id = 'timer';
timerText.textContent = 'Time: 00:00';

const possibleText = document.createElement('p');
possibleText.id = 'possible-secrets';

stats.append(attemptsText, timerText, possibleText);

const historyTitle = document.createElement('h3');
historyTitle.textContent = 'Guess history';

const historyList = document.createElement('ol');
historyList.id = 'history-list';

const newGameButton = document.createElement('button');
newGameButton.type = 'button';
newGameButton.id = 'new-game-button';
newGameButton.textContent = 'New game / change settings';

gameSection.append(
  gameTitle,
  gameDescription,
  guessForm,
  feedback,
  stats,
  historyTitle,
  historyList,
  newGameButton,
);

// --------------------------------------------------
// 4. Create the leaderboard section
// --------------------------------------------------

const leaderboardSection = document.createElement('section');
leaderboardSection.className = 'leaderboard';

const leaderboardTitle = document.createElement('h2');
leaderboardTitle.textContent = 'Leaderboard';

const leaderboardList = document.createElement('ol');
leaderboardList.id = 'leaderboard-list';

// --------------------------------------------------
// 5. Timer and leaderboard functions
// --------------------------------------------------

let gameStartTime = 0;
let timerInterval: number | undefined;

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const renderLeaderboard = (entries: LeaderboardEntry[]): void => {
  leaderboardList.replaceChildren();

  if (entries.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No completed games yet.';
    leaderboardList.append(emptyItem);

    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement('li');
    const completionDate = new Date(entry.date).toLocaleDateString();

    item.textContent =
      `#${index + 1} — ${entry.attempts} attempts, ` +
      `${formatTime(entry.time)}, ` +
      `Base ${entry.base}, length ${entry.length}, ` +
      `${completionDate}`;

    leaderboardList.append(item);
  });
};

leaderboardSection.append(leaderboardTitle, leaderboardList);

// --------------------------------------------------
// 6. Add all sections to the page
// --------------------------------------------------

app.append(header, settingsSection, gameSection, leaderboardSection);
document.body.append(app);

// --------------------------------------------------
// 7. Store the current game state
// --------------------------------------------------

let gameState = createInitialGameState();

renderLeaderboard(loadLeaderboard());

// --------------------------------------------------
// 8. Update available secret lengths
// --------------------------------------------------

const updateLengthOptions = (): void => {
  const selectedBase = Number(baseSelect.value);

  Array.from(lengthSelect.options).forEach((option) => {
    const optionLength = Number(option.value);

    option.disabled = optionLength > selectedBase;
  });

  if (Number(lengthSelect.value) > selectedBase) {
    lengthSelect.value = '2';
  }
};

baseSelect.addEventListener('change', updateLengthOptions);

updateLengthOptions();

// --------------------------------------------------
// 9. Start a new round
// --------------------------------------------------

settingsForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (gameState.status === 'playing') {
    return;
  }

  const selectedBase = Number(baseSelect.value);
  const selectedLength = Number(lengthSelect.value);

  gameState = startGame(selectedBase, selectedLength);

  gameStartTime = Date.now();

  if (timerInterval !== undefined) {
    window.clearInterval(timerInterval);
  }

  timerInterval = window.setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);

    timerText.textContent = `Time: ${formatTime(elapsedSeconds)}`;
  }, 1000);

  // Lock settings during the round.
  baseSelect.disabled = true;
  lengthSelect.disabled = true;
  startButton.disabled = true;

  // Display the game.
  gameSection.hidden = false;

  gameDescription.textContent = `Find ${gameState.length} unique digits using base ${gameState.base}.`;

  possibleText.textContent = `Possible secrets: ${gameState.possibleSecrets.toLocaleString()}`;

  // Reset the game interface.
  attemptsText.textContent = 'Attempts: 0';
  timerText.textContent = 'Time: 00:00';
  feedback.textContent = 'Game started! Enter your first guess.';
  historyList.replaceChildren();

  guessInput.value = '';
  guessInput.maxLength = gameState.length;
  guessInput.disabled = false;
  guessButton.disabled = false;

  guessInput.focus();
});

// --------------------------------------------------
// 10. Filter invalid characters in the guess input
// --------------------------------------------------

guessInput.addEventListener('input', () => {
  if (gameState.status !== 'playing' || !gameState.isDigitValid) {
    return;
  }

  const isValidDigit = gameState.isDigitValid;

  guessInput.value = guessInput.value
    .toUpperCase()
    .split('')
    .filter(isValidDigit)
    .slice(0, gameState.length)
    .join('');
});

// --------------------------------------------------
// 11. Check the player's guess
// --------------------------------------------------

guessForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (gameState.status !== 'playing') {
    return;
  }

  const guess = guessInput.value.toUpperCase();

  if (!isValidGuess(guess, gameState.length, gameState.base)) {
    feedback.textContent = `Enter exactly ${gameState.length} unique valid digits.`;

    return;
  }

  // Prevent duplicate guesses.
  const alreadyGuessed = gameState.history.some(
    (entry) => entry.guess.toLowerCase() === guess.toLowerCase(),
  );

  if (alreadyGuessed) {
    feedback.textContent = 'You have already tried this guess. Try another one.';

    return;
  }

  // Calculate bulls and cows.
  const result = evaluateGuess(gameState.secret, guess);

  // Update game state immutably.
  gameState = addGuess(gameState, guess, result);

  attemptsText.textContent = `Attempts: ${gameState.attempts}`;

  // Display the new history entry.
  const historyItem = document.createElement('li');

  historyItem.textContent = `${guess} — ${result.bulls} bulls, ${result.cows} cows`;

  historyList.append(historyItem);

  // Check whether the player has won.
  if (gameState.status === 'won') {
    const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);

    // Stop the timer.
    if (timerInterval !== undefined) {
      window.clearInterval(timerInterval);
      timerInterval = undefined;
    }

    timerText.textContent = `Time: ${formatTime(elapsedSeconds)}`;

    feedback.textContent =
      `Congratulations! You guessed the secret in ` +
      `${gameState.attempts} attempts and ${formatTime(elapsedSeconds)}.`;

    // Save the completed game.
    const completedGame: LeaderboardEntry = {
      attempts: gameState.attempts,
      time: elapsedSeconds,
      base: gameState.base,
      length: gameState.length,
      date: new Date().toISOString(),
    };

    const updatedLeaderboard = saveLeaderboardEntry(completedGame);

    renderLeaderboard(updatedLeaderboard);

    guessInput.disabled = true;
    guessButton.disabled = true;

    return;
  }

  feedback.textContent = `${result.bulls} bulls and ${result.cows} cows. Try again!`;

  guessInput.value = '';
  guessInput.focus();
});

// --------------------------------------------------
// 12. Return to settings for another game
// --------------------------------------------------

newGameButton.addEventListener('click', () => {
  if (timerInterval !== undefined) {
    window.clearInterval(timerInterval);
    timerInterval = undefined;
  }

  gameStartTime = 0;

  gameState = resetGame(Number(baseSelect.value), Number(lengthSelect.value));

  // Unlock settings.
  baseSelect.disabled = false;
  lengthSelect.disabled = false;
  startButton.disabled = false;

  // Reset the game interface.
  gameSection.hidden = true;

  guessInput.value = '';
  guessInput.disabled = false;
  guessButton.disabled = false;

  attemptsText.textContent = 'Attempts: 0';
  timerText.textContent = 'Time: 00:00';
  possibleText.textContent = '';
  feedback.textContent = '';
  historyList.replaceChildren();

  updateLengthOptions();
});
