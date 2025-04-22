//Luis Escamilla
// Initialize game state
const gameState = {
    currentPlayer: 'red',  // Player colors
    board: Array(6).fill().map(() => Array(7).fill(null)), // 6x7 grid
    gameOver: false,
    result: null
};

let playerColor = null; // Assigned color for this client

// Establish socket.io connection and join game room
const socket = io();

// Get the game id from the URL path
const gameId = window.location.pathname.substring(1); // Get gameId from URL
socket.emit('joinGame', gameId);

// Listen for assigned color from the server
socket.on('assignedColor', (color) => {
    playerColor = color;
    // Optionally, display player role in console for debugging
    console.log("You are assigned: " + playerColor);
});

// Listen for updated game state from the server
socket.on('gameState', (state) => {
    // Update local game state with the received state
    gameState.currentPlayer = state.currentPlayer;
    gameState.board = state.board;
    gameState.gameOver = state.gameOver;
    gameState.result = state.result;
    updateBoardVisual();
    updateStatus();
});

// Create board structure
function createBoard() {
    const board = document.getElementById('board');
    // Clear existing board
    board.innerHTML = '';
    // Create 7 columns
    for (let col = 0; col < 7; col++) {
        const column = document.createElement('div');
        column.className = 'column';
        column.dataset.col = col;  // Store column index

        // Create 6 cells per column
        for (let row = 0; row < 6; row++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row; // Store row index
            cell.dataset.col = col;
            column.appendChild(cell);
        }
        board.appendChild(column);
    }
}

// Initialize game
function initGame() {
    // Reset variables
    gameState.currentPlayer = 'red';
    gameState.board = Array(6).fill().map(() => Array(7).fill(null));
    gameState.gameOver = false;
    gameState.result = null;
    // Create board
    createBoard();
    updateStatus();
    document.querySelectorAll('.column').forEach(column => {
        column.addEventListener('click', handleColumnClick);
    });
}

// Start game when page loads
window.onload = initGame;

// Basic game status display
function updateStatus() {
    const statusText = document.querySelector('.status-text');
    const indicator = document.querySelector('.player-indicator');
    
    // Update text based on game state
    if (gameState.gameOver) {
        statusText.textContent = gameState.result === 'win' 
            ? `${gameState.currentPlayer.toUpperCase()} Wins!` 
            : "Game Tied!";
    } 
    else {
        statusText.textContent = `${gameState.currentPlayer.toUpperCase()}'s Turn`;
    }    
    // Update indicator color
    indicator.classList.remove('red', 'yellow');
    indicator.classList.add(gameState.currentPlayer);
}

// Adds column click handlers
function handleColumnClick(event) {
    if (gameState.gameOver) return;
    // Only allow move if it's this player's turn
    if (playerColor !== gameState.currentPlayer) return;
    
    const col = parseInt(event.currentTarget.dataset.col);
    // Emit move event to the server (server determines the correct row)
    socket.emit('move', {
        gameId: gameId,
        col: col
    });
}

// Updates board visuals
function updateBoardVisual() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const playerAtCell = gameState.board[row][col];
        const wasEmpty = !cell.classList.contains('red') && !cell.classList.contains('yellow');
        cell.classList.remove('red', 'yellow');
        if (playerAtCell) {
            cell.classList.add(playerAtCell);
            if (wasEmpty) {
                cell.classList.add('new-piece');
            }
        }
    });
}
  
// Basic reset handler
document.getElementById('reset').addEventListener('click', () => {
    socket.emit('resetGame', gameId);
    initGame();
});
