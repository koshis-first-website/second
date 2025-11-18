// --- Level Data (X-positions of spikes for 20 levels) ---
const LEVELS = [
// Level 1: Very Easy Intro
[300, 700, 1100, 1500, 1900],

// Level 2: Easy (Slightly narrower gaps)
[250, 600, 950, 1300, 1650, 2000],

// Level 3: Medium (Two consecutive spikes)
[300, 600, 640, 1000, 1300, 1340, 1700],

// Level 4: Medium (More frequent, consistent jumps)
[200, 450, 700, 950, 1200, 1450, 1700, 1950, 2200],

// Level 5: Hard (Small block jumps)
[200, 240, 500, 700, 740, 1000, 1200, 1240, 1500, 1700, 1740],

// Level 6-10: Increasing density
[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900],
[50, 200, 350, 500, 650, 800, 950, 1100, 1250, 1400, 1550, 1700, 1850],
[150, 250, 350, 450, 550, 650, 750, 850, 950, 1050, 1150, 1250, 1350, 1450, 1550, 1650],
[50, 100, 150, 200, 300, 350, 400, 450, 550, 600, 650, 700, 800, 850, 900, 950, 1050, 1100, 1150, 1200],
[100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200],

// Level 11-20: Placeholder for very dense, high difficulty levels
...Array(10).fill().map((_, i) => Array.from({length: 30 + i * 3}, (_, j) => 100 + j * 60)),
];

// --- Global DOM Elements ---
const gameContainer = document.getElementById('game-container');
const levelContainer = document.getElementById('level');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const instructions = document.getElementById('instructions');

// --- Game State & Constants ---
const PLAYER_SIZE = 40;
const GROUND_Y = 0;
const JUMP_VELOCITY = -15;
const GRAVITY = 1;

let playerY = GROUND_Y;
let velocityY = 0;
let levelX = 0;
let isJumping = false;
let isGameOver = true;
let currentLevel = 0;
let score = 0;

// Difficulty Scaling Variables
const LEVEL_SPEED_BASE = 4;
let levelSpeed = LEVEL_SPEED_BASE;

// High Score Tracking
let highScore = localStorage.getItem('geometryHighScore') || 0;

// --- Collision Helper ---
function getBoundingRect(element) {
// Correctly get the position relative to the viewport (crucial for collision)
return element.getBoundingClientRect();
}

// --- Level Management ---
function loadLevel(levelIndex) {
if (levelIndex >= LEVELS.length) {
endGame(true); // Player beat all 20 levels
return;
}

// 1. Clear previous level content
levelContainer.innerHTML = '';
levelContainer.appendChild(player);

// 2. Set current level and speed
currentLevel = levelIndex;

// **DIFFICULTY SCALING:** Increase speed based on level number
levelSpeed = LEVEL_SPEED_BASE + (currentLevel * 0.5);

// 3. Draw new obstacles
const currentObstacles = LEVELS[levelIndex];

currentObstacles.forEach(xPos => {
const spike = document.createElement('div');
spike.classList.add('spike');
spike.style.left = xPos + 'px';
levelContainer.appendChild(spike);
});

// 4. Reset position
levelX = 0;
player.style.bottom = GROUND_Y + 'px';
player.style.left = '100px';

// Update instructions
instructions.querySelector('h1').textContent = `Level ${currentLevel + 1}`;
}


// --- Collision Logic ---
function checkCollision() {
const playerRect = getBoundingRect(player);
let levelComplete = true;

document.querySelectorAll('.spike').forEach(spike => {
const spikeRect = getBoundingRect(spike);

// 1. Check if the spike has scrolled past the screen (Level Completion Check)
if (spikeRect.right > 0) {
levelComplete = false;
}

// 2. Check for actual physical collision (Player hitting the spike)
// Checks if rects overlap horizontally AND player bottom is past the spike top
if (
playerRect.left < spikeRect.right &&
playerRect.right > spikeRect.left &&
playerRect.bottom > spikeRect.top
) {
endGame(false); // Collision detected!
}
});

// Check if the level container has scrolled past the last obstacle (arbitrary distance check)
if (levelComplete && levelX < -3000) {
loadLevel(currentLevel + 1);
}
}


// --- Game Loop (Physics and Scrolling) ---
function gameLoop() {
if (isGameOver) return;

// 1. Apply Physics
velocityY += GRAVITY;
playerY += velocityY;
if (playerY <= GROUND_Y) {
playerY = GROUND_Y;
velocityY = 0;
isJumping = false;
}
player.style.bottom = playerY + 'px';

// 2. Scroll the Level
levelX -= levelSpeed;
levelContainer.style.transform = `translateX(${levelX}px)`;

// 3. Update Score
score = Math.floor(currentLevel * 1000 + (-levelX / 10)); // Score = base + distance
scoreDisplay.textContent = `Score: ${score} | High Score: ${highScore}`;

// 4. Check for Spikes and Level End
checkCollision();
}

// --- Player Jump Mechanic ---
function jump() {
if (!isJumping) {
isJumping = true;
velocityY = JUMP_VELOCITY;
}
}

document.addEventListener('keydown', (e) => {
if (e.code === 'Space' && !isGameOver) {
jump();
}
});
gameContainer.addEventListener('click', () => {
if (!isGameOver) {
jump();
}
});

// --- Game Initialization ---
window.startGame = function() {
isGameOver = false;
currentLevel = 0; // Always start at Level 1
loadLevel(currentLevel);
instructions.style.display = 'none';

if (gameInterval) clearInterval(gameInterval);
gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
};

function endGame(win = false) {
isGameOver = true;
clearInterval(gameInterval);

// --- High Score Logic ---
let message = "GAME OVER!";
if (win) {
message = "YOU CONQUERED THE NEBULA!";
}

if (score > highScore) {
highScore = score;
localStorage.setItem('geometryHighScore', highScore);
message = (win ? "CONGRATULATIONS! NEW HIGH SCORE!" : "NEW HIGH SCORE!") + ` Score: ${score}`;
}

// Show the game over screen
instructions.style.display = 'flex';
instructions.querySelector('h1').textContent = message;
instructions.querySelector('p').textContent = `Final Score: ${score} | Level Reached: ${currentLevel + 1}`;
instructions.querySelector('button').textContent = "Play Again";

}

// Initial display of high score
scoreDisplay.textContent = `Score: 0 | High Score: ${highScore}`;
instructions.querySelector('h1').textContent = "Geometry Jumper";
instructions.querySelector('p').textContent = "Use SPACE or CLICK to Jump!";