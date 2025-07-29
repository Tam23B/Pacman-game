const grid = document.querySelector('.grid');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const highScoreDisplay = document.getElementById('high-score');
const message = document.getElementById('message');

const width = 28;
const layout = [
  // Simplified 28x28 layout
  // 0 - dot, 1 - wall, 2 - ghost-lair, 3 - power-pellet, 4 - empty
  // Use a mix of 0,1,3,4 to make a playable board
  // Layout here is reduced for brevity. I can give full 28x28 if you want later.
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,1,1,1,1,1,1,1,1,0,1,0,1,1,0,1,0,1,1,1,1,1,1,1,1,0,1,
  1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,
  1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,
  1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];

const squares = [];
let pacmanIndex = 1;
let ghosts = [];
let score = 0;
let timer = 0;
let scaredTimer;
let gameInterval;
let powerPelletActive = false;

function createBoard() {
  for (let i = 0; i < layout.length; i++) {
    const square = document.createElement('div');
    square.classList.add('square');
    if (layout[i] === 1) square.classList.add('wall');
    if (layout[i] === 0) square.classList.add('dot');
    if (layout[i] === 3) square.classList.add('power-pellet');
    grid.appendChild(square);
    squares.push(square);
  }
}

function drawPacman() {
  squares[pacmanIndex].classList.add('pacman');
}

function removePacman() {
  squares[pacmanIndex].classList.remove('pacman');
}

function movePacman(e) {
  removePacman();
  switch (e.key) {
    case 'ArrowLeft':
      if (pacmanIndex % width !== 0 && !squares[pacmanIndex - 1].classList.contains('wall'))
        pacmanIndex -= 1;
      break;
    case 'ArrowRight':
      if ((pacmanIndex + 1) % width !== 0 && !squares[pacmanIndex + 1].classList.contains('wall'))
        pacmanIndex += 1;
      break;
    case 'ArrowUp':
      if (pacmanIndex - width >= 0 && !squares[pacmanIndex - width].classList.contains('wall'))
        pacmanIndex -= width;
      break;
    case 'ArrowDown':
      if (pacmanIndex + width < squares.length && !squares[pacmanIndex + width].classList.contains('wall'))
        pacmanIndex += width;
      break;
  }
  eatDot();
  eatPowerPellet();
  checkGhostCollision();
  drawPacman();
}

function eatDot() {
  if (squares[pacmanIndex].classList.contains('dot')) {
    score += 10;
    squares[pacmanIndex].classList.remove('dot');
    playSound('chomp');
  }
  scoreDisplay.textContent = score;
  checkWin();
}

function eatPowerPellet() {
  if (squares[pacmanIndex].classList.contains('power-pellet')) {
    squares[pacmanIndex].classList.remove('power-pellet');
    playSound('power');
    ghosts.forEach(g => g.scared = true);
    powerPelletActive = true;
    clearTimeout(scaredTimer);
    scaredTimer = setTimeout(() => {
      ghosts.forEach(g => g.scared = false);
      powerPelletActive = false;
    }, 8000);
  }
}

function checkWin() {
  if (!squares.some(sq => sq.classList.contains('dot'))) {
    endGame("You win!");
  }
}

function checkGhostCollision() {
  ghosts.forEach(ghost => {
    if (ghost.index === pacmanIndex) {
      if (ghost.scared) {
        playSound('ghost');
        score += 100;
        ghost.index = ghost.startIndex;
        squares[ghost.index].classList.add('ghost');
      } else {
        endGame("Game Over!");
      }
    }
  });
}

function endGame(text) {
  clearInterval(gameInterval);
  document.removeEventListener('keydown', movePacman);
  message.textContent = text;
  playSound('death');
  updateHighScore();
}

function updateHighScore() {
  const high = localStorage.getItem('highScore') || 0;
  if (score > high) {
    localStorage.setItem('highScore', score);
  }
  highScoreDisplay.textContent = localStorage.getItem('highScore');
}

function startTimer() {
  gameInterval = setInterval(() => {
    timer++;
    timerDisplay.textContent = timer;
  }, 1000);
}

function playSound(name) {
  const audio = new Audio(`sounds/${name}.mp3`);
  audio.play();
}

// GHOSTS
class Ghost {
  constructor(name, index) {
    this.name = name;
    this.startIndex = index;
    this.index = index;
    this.scared = false;
  }

  move() {
    const directions = [-1, +1, -width, +width];
    let direction = directions[Math.floor(Math.random() * directions.length)];

    const moveInterval = setInterval(() => {
      if (!squares[this.index + direction].classList.contains('wall')) {
        squares[this.index].classList.remove('ghost', 'scared');
        this.index += direction;

        squares[this.index].classList.add('ghost');
        if (this.scared) squares[this.index].classList.add('scared');

        checkGhostCollision();
      } else {
        direction = directions[Math.floor(Math.random() * directions.length)];
      }
    }, 300);
  }
}

// Start
createBoard();
drawPacman();
document.addEventListener('keydown', movePacman);
ghosts = [
  new Ghost('blinky', 90),
  new Ghost('pinky', 100),
];
ghosts.forEach(g => {
  squares[g.index].classList.add('ghost');
  g.move();
});
startTimer();
updateHighScore();
