//Luis Escamilla
// Server file for Connect 4 multiplayer game using Express + Socket.io

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid'); // For generating unique game ids

// Serve static files from public folder
app.use(express.static('public'));

// Bonus: Enable multiple games by using unique game ids in the URL
app.get('/:gameId', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Default route redirects to a new game id
app.get('/', (req, res) => {
    res.redirect('/' + uuidv4());
});

// Store game state for each game room
let games = {}; // key: gameId, value: game state object

// Helper function: Get lowest empty row (server side)
function getLowestEmptyRowServer(board, col) {
    for (let r = 0; r < 6; r++) {
        if (board[r][col] === null) return r;
    }
    return -1;
}

// Helper function: Check for win
function checkWin(board, row, col, player) {
    function countConsecutive(deltaRow, deltaCol) {
        let count = 0, r = row + deltaRow, c = col + deltaCol;
        while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
            count++;
            r += deltaRow;
            c += deltaCol;
        }
        return count;
    }
    return (
        1 + countConsecutive(0, 1) + countConsecutive(0, -1) >= 4 || // Horizontal
        1 + countConsecutive(1, 0) + countConsecutive(-1, 0) >= 4 || // Vertical
        1 + countConsecutive(1, 1) + countConsecutive(-1, -1) >= 4 || // Diagonal \
        1 + countConsecutive(1, -1) + countConsecutive(-1, 1) >= 4    // Diagonal /
    );
}

// Helper function: Check for draw
function checkDraw(board) {
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            if (board[r][c] === null) return false;
        }
    }
    return true;
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Client connected: ' + socket.id);

    // When a client joins a game room
    socket.on('joinGame', (gameId) => {
        socket.join(gameId);
        console.log('Client ' + socket.id + ' joined game ' + gameId);
        // Initialize game state for this room if not already created
        if (!games[gameId]) {
            games[gameId] = {
                currentPlayer: 'red',
                board: Array(6).fill().map(() => Array(7).fill(null)),
                gameOver: false,
                result: null,
                players: {} // store player assignments
            };
        }
        let game = games[gameId];
        // Assign player color if there are fewer than 2 players
        if (Object.keys(game.players).length < 2) {
            let assignedColor = Object.keys(game.players).length === 0 ? 'red' : 'yellow';
            game.players[socket.id] = assignedColor;
            socket.playerColor = assignedColor;
            socket.emit('assignedColor', assignedColor);
        } else {
            socket.emit('assignedColor', 'spectator');
        }
        // Send current game state to the new client
        socket.emit('gameState', game);
    });

    // Handle move event sent from client
    socket.on('move', (data) => {
        // Data: { gameId, col }
        let game = games[data.gameId];
        // Only process if the game exists, is not over, and it's the player's turn
        if (!game || game.gameOver || socket.playerColor !== game.currentPlayer) return;
        
        let row = getLowestEmptyRowServer(game.board, data.col);
        if (row === -1) return; // Column full
        
        // Update game board with the move from the assigned player
        game.board[row][data.col] = socket.playerColor;
        
        // Check for win
        if (checkWin(game.board, row, data.col, socket.playerColor)) {
            game.gameOver = true;
            game.result = 'win';
        }
        // Check for draw
        else if (checkDraw(game.board)) {
            game.gameOver = true;
            game.result = 'draw';
        }
        // Otherwise, switch turns
        else {
            game.currentPlayer = game.currentPlayer === 'red' ? 'yellow' : 'red';
        }
        // Broadcast updated game state to all clients in the room
        io.to(data.gameId).emit('gameState', game);
    });
    
    // Handle game reset event
    socket.on('resetGame', (gameId) => {
        games[gameId] = {
            currentPlayer: 'red',
            board: Array(6).fill().map(() => Array(7).fill(null)),
            gameOver: false,
            result: null,
            players: {}
        };
        io.to(gameId).emit('gameState', games[gameId]);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected: ' + socket.id);
    });
});

http.listen(3000, () => {
    console.log('Server is running on port 3000');
});
