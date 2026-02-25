const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let player = { x: 50, y: 300, width: 40, height: 40, dy: 0, gravity: 0.8, jump: -15, flipped: false };
let obstacles = [];
let orbs = [];
let portals = [];
let finishLine = null;
let frame = 0;
let score = 0;
let gameOver = false;
let currentLevel = 0;

const levels = [
  { 
    obstacles: [{ x: 400, y: 300, width: 40, height: 40 }, { x: 700, y: 300, width: 40, height: 40 }],
    orbs: [{ x: 500, y: 300 }],
    portals: [{ x: 600, y: 300 }],
    finish: { x: 800, y: 300, width: 40, height: 40 }
  },
  { 
    obstacles: [{ x: 300, y: 300, width: 40, height: 40 }, { x: 600, y: 300, width: 40, height: 40 }],
    orbs: [{ x: 400, y: 300 }, { x: 500, y: 300 }],
    portals: [{ x: 450, y: 300 }, { x: 700, y: 300 }],
    finish: { x: 900, y: 300, width: 40, height: 40 }
  }
];

// Jump
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (!player.flipped && player.y === 300) player.dy = player.jump;
    if (player.flipped && player.y === 100) player.dy = -player.jump;
  }
});

function startLevel(index) {
  currentLevel = index;
  frame = 0;
  score = 0;
  gameOver = false;
  player.y = 300;
  player.dy = 0;
  player.flipped = false;
  obstacles = JSON.parse(JSON.stringify(levels[index].obstacles));
  orbs = JSON.parse(JSON.stringify(levels[index].orbs));
  portals = JSON.parse(JSON.stringify(levels[index].portals));
  finishLine = JSON.parse(JSON.stringify(levels[index].finish));
}

// Collision helper
function collides(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function update() {
  if (gameOver) return;

  frame++;
  player.dy += player.flipped ? -player.gravity : player.gravity;
  player.y += player.dy;

  // Boundaries
  if (!player.flipped && player.y > 300) { player.y = 300; player.dy = 0; }
  if (player.flipped && player.y < 100) { player.y = 100; player.dy = 0; }

  // Move obstacles, orbs, portals, finish line
  const items = [...obstacles, ...orbs, ...portals, finishLine];
  items.forEach(item => { if(item) item.x -= 6; });

  // Check collisions
  obstacles.forEach(obs => { if (collides(player, obs)) { gameOver = true; alert(`Game Over! Score: ${score}`); startLevel(currentLevel); } });
  orbs.forEach((orb, i) => { 
    if (collides(player, orb)) { player.dy = player.jump * 1.5; orbs.splice(i,1); }
  });
  portals.forEach((portal, i) => { 
    if (collides(player, portal)) { player.flipped = !player.flipped; portals.splice(i,1); }
  });
  if (finishLine && collides(player, finishLine)) { alert(`Level Complete! Score: ${score}`); startLevel(currentLevel); }

  score = Math.floor(frame / 10);
  document.getElementById('score').textContent = `Score: ${score}`;
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  
  // Player
  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Obstacles
  ctx.fillStyle = 'red';
  obstacles.forEach(obs => ctx.fillRect(obs.x, obs.y, obs.width, obs.height));

  // Orbs
  ctx.fillStyle = 'yellow';
  orbs.forEach(orb => ctx.fillRect(orb.x, orb.y, 20, 20));

  // Portals
  ctx.fillStyle = 'cyan';
  portals.forEach(portal => ctx.fillRect(portal.x, portal.y, 30, 30));

  // Finish
  if(finishLine) {
    ctx.fillStyle = 'magenta';
    ctx.fillRect(finishLine.x, finishLine.y, finishLine.width, finishLine.height);
  }
}

function loop() { update(); draw(); requestAnimationFrame(loop); }

startLevel(0);
loop();
