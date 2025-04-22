# Connect4

🎮 A classic Connect 4 implementation with JavaScript


## Features
- 🔴🟡 Two-player turn-based gameplay
- � Win detection in all directions (horizontal, vertical, diagonal)
- ♻️ Reset game functionality
- 📊 Real-time game status display
- 🎨 Responsive design

## How to Play
1. Players take turns clicking columns
2. First to connect 4 pieces wins!
3. Game ends in draw if board fills completely

## Technologies
- Vanilla JavaScript
- CSS Flexbox
- HTML5

## Installation
```bash
git clone https://github.com/LuisOEscamilla/Connect4.git
cd connect4
# Open index.html in browser
```

## Live Demo
[Play Online](https://LuisOEscamilla.github.io/Connect4)

## Connect 4 Multiplayer Game Server Setup
-----------------------------------------
1. Ensure Node.js and npm are installed.
   Download Node.js from: https://nodejs.org/

2. In the project directory, open a terminal (or use VSCode's integrated terminal).

3. Initialize the project (if package.json doesn't exist):
   npm init -y

4. Install required packages:
   npm install express socket.io uuid

5. To start the server, run:
   node server.js

6. Open your browser and navigate to:
   http://localhost:3000

   You will be redirected to a URL with a unique game id, for example:
   http://localhost:3000/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

7. To test multiplayer:
   - Open multiple browser windows/tabs with the same unique URL.
   - The first two clients are assigned "red" and "yellow". Others will be spectators.
   - Only the player whose color matches the current turn can make a move.

8. Use the "New Game" button to reset the game.

