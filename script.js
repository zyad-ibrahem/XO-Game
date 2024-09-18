const cells = document.querySelectorAll(".cell");
const messageDiv = document.getElementById("message");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const resetButton = document.getElementById("resetButton");
const playerXInput = document.getElementById("playerX");
const playerOInput = document.getElementById("playerO");
const colorXInput = document.getElementById("colorX");
const colorOInput = document.getElementById("colorO");
const timerDiv = document.getElementById("timer");
const aiLevelSelect = document.getElementById("aiLevel");
const gameModeSelect = document.getElementById("gameMode"); // Game mode selector

let currentPlayer = "X";
let xScore = 0;
let oScore = 0;
let timer;
let seconds = 0;
let aiLevel = "easy"; // Default AI level
let gameMode = "pvp"; // Default to Player vs Player

// Winning combinations
const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Check for winner
function checkWinner() {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (
      cells[a].textContent &&
      cells[a].textContent === cells[b].textContent &&
      cells[a].textContent === cells[c].textContent
    ) {
      messageDiv.textContent = `${currentPlayer} is the winner!`;
      updateScores(currentPlayer);
      stopTimer();
      return;
    }
  }
  if ([...cells].every((cell) => cell.textContent)) {
    messageDiv.textContent = "It's a draw!";
    stopTimer();
  }
}

// Update scores
function updateScores(winner) {
  if (winner === "X") {
    xScore++;
    scoreX.textContent = xScore;
  } else if (winner === "O") {
    oScore++;
    scoreO.textContent = oScore;
  }
}

// Reset the board
function resetBoard() {
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("clicked");
  });
  messageDiv.textContent = "";
  currentPlayer = "X"; // Reset to default player
  seconds = 0;
  updateColors();
  stopTimer();
  startTimer();
}

// Start the timer
function startTimer() {
  timer = setInterval(() => {
    seconds += 0.5;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerDiv.textContent = `Time: ${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  }, 1000);
}

// Stop the timer
function stopTimer() {
  clearInterval(timer);
}

// Update player symbols
function updatePlayers() {
  currentPlayer = playerXInput.value;
  cells.forEach((cell) => {
    if (cell.textContent === "X") {
      cell.textContent = playerXInput.value;
    } else if (cell.textContent === "O") {
      cell.textContent = playerOInput.value;
    }
  });
}

// Update colors
function updateColors() {
  cells.forEach((cell) => {
    if (cell.textContent === playerXInput.value) {
      cell.style.color = colorXInput.value;
    } else if (cell.textContent === playerOInput.value) {
      cell.style.color = colorOInput.value;
    }
  });
}

// Handle cell click
function handleCellClick(event) {
  const cell = event.target;
  if (!cell.textContent && !messageDiv.textContent) {
    cell.textContent = currentPlayer;
    cell.classList.add("clicked");
    checkWinner();
    if (gameMode === "pvp") {
      currentPlayer = currentPlayer === "X" ? "O" : "X"; // Switch player
    } else if (gameMode === "pve" && currentPlayer === "X") {
      currentPlayer = "O";
      setTimeout(aiMove, 500); // AI makes a move after a delay
    }
  }
}

// AI move logic
function aiMove() {
  let bestMove;

  switch (aiLevel) {
    case "medium":
      bestMove = getMediumMove();
      break;
    case "hard":
      bestMove = getBestMove();
      break;
    default:
      bestMove = getRandomMove();
      break;
  }

  if (bestMove) {
    bestMove.textContent = "O";
    bestMove.classList.add("clicked");
    checkWinner();
    currentPlayer = "X";
  }
}

// Random move for easy AI
function getRandomMove() {
  const emptyCells = [...cells].filter((cell) => !cell.textContent);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Medium AI move logic
function getMediumMove() {
  const winningMove = findWinningMove("O");
  if (winningMove) return winningMove;

  const blockingMove = findWinningMove("X");
  if (blockingMove) return blockingMove;

  return getRandomMove();
}

// Find a winning move for the given player
function findWinningMove(player) {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (
      cells[a].textContent === player &&
      cells[b].textContent === player &&
      !cells[c].textContent
    ) {
      return cells[c];
    }
    if (
      cells[a].textContent === player &&
      cells[c].textContent === player &&
      !cells[b].textContent
    ) {
      return cells[b];
    }
    if (
      cells[b].textContent === player &&
      cells[c].textContent === player &&
      !cells[a].textContent
    ) {
      return cells[a];
    }
  }
  return null;
}

// Hard AI move logic using Minimax algorithm
function getBestMove() {
  let bestScore = -Infinity;
  let move;

  for (const cell of [...cells].filter((cell) => !cell.textContent)) {
    cell.textContent = "O";
    const score = minimax(cells, 0, false);
    cell.textContent = "";

    if (score > bestScore) {
      bestScore = score;
      move = cell;
    }
  }
  return move;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
  const result = checkGameState();
  if (result !== null) return result === "O" ? 10 : result === "X" ? -10 : 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const cell of [...cells].filter((cell) => !cell.textContent)) {
      cell.textContent = "O";
      const score = minimax(cells, depth + 1, false);
      cell.textContent = "";
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const cell of [...cells].filter((cell) => !cell.textContent)) {
      cell.textContent = "X";
      const score = minimax(cells, depth + 1, true);
      cell.textContent = "";
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}

// Check the game state
function checkGameState() {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (
      cells[a].textContent &&
      cells[a].textContent === cells[b].textContent &&
      cells[a].textContent === cells[c].textContent
    ) {
      return cells[a].textContent;
    }
  }
  return [...cells].every((cell) => cell.textContent) ? "draw" : null;
}

// Event listeners
cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetButton.addEventListener("click", resetBoard);
playerXInput.addEventListener("change", updatePlayers);
playerOInput.addEventListener("change", updatePlayers);
colorXInput.addEventListener("input", updateColors);
colorOInput.addEventListener("input", updateColors);
aiLevelSelect.addEventListener("change", (e) => {
  aiLevel = e.target.value; // Update AI level
  resetBoard(); // Reset game when AI level changes
});
gameModeSelect.addEventListener("change", (e) => {
  gameMode = e.target.value; // Update game mode
  resetBoard(); // Reset game when mode changes
});

// Initialize game on load
window.addEventListener("load", () => {
  resetBoard();
  startTimer();
});
