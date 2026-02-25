const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Game {
  constructor() {
    this.gravity = 0.8;
    this.gameSpeed = 6;
    this.groundHeight = 100;
    this.isRunning = true;

    this.player = new Player(150, canvas.height - this.groundHeight - 40);
    this.obstacles = [];

    this.spawnTimer = 0;
    this.spawnInterval = 90;

    this.lastTime = 0;

    this.initControls();
    requestAnimationFrame(this.loop.bind(this));
  }

  initControls() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") this.player.jump();
    });

    window.addEventListener("mousedown", () => {
      this.player.jump();
    });
  }

  spawnObstacle() {
    const size = 40;
    const y = canvas.height - this.groundHeight - size;
    this.obstacles.push(new Obstacle(canvas.width, y, size));
  }

  update(deltaTime) {
    if (!this.isRunning) return;

    this.player.update(this.gravity);

    this.spawnTimer++;
    if (this.spawnTimer > this.spawnInterval) {
      this.spawnObstacle();
      this.spawnTimer = 0;
    }

    this.obstacles.forEach((obs, index) => {
      obs.update(this.gameSpeed);

      if (obs.x + obs.size < 0) {
        this.obstacles.splice(index, 1);
      }

      if (this.player.collidesWith(obs)) {
        this.reset();
      }
    });
  }

  reset() {
    this.player.reset();
    this.obstacles = [];
    this.spawnTimer = 0;
  }

  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background glow
    ctx.fillStyle = "#12122a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = "#1f1f3d";
    ctx.fillRect(0, canvas.height - this.groundHeight, canvas.width, this.groundHeight);

    this.player.draw();
    this.obstacles.forEach(obs => obs.draw());
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.draw();

    requestAnimationFrame(this.loop.bind(this));
  }
}

class Player {
  constructor(x, y) {
    this.startX = x;
    this.startY = y;

    this.x = x;
    this.y = y;
    this.size = 40;

    this.velocityY = 0;
    this.jumpForce = -15;
    this.isOnGround = true;
  }

  jump() {
    if (this.isOnGround) {
      this.velocityY = this.jumpForce;
      this.isOnGround = false;
    }
  }

  update(gravity) {
    this.velocityY += gravity;
    this.y += this.velocityY;

    const groundY = canvas.height - 100 - this.size;
    if (this.y >= groundY) {
      this.y = groundY;
      this.velocityY = 0;
      this.isOnGround = true;
    }
  }

  collidesWith(obstacle) {
    return (
      this.x < obstacle.x + obstacle.size &&
      this.x + this.size > obstacle.x &&
      this.y < obstacle.y + obstacle.size &&
      this.y + this.size > obstacle.y
    );
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.velocityY = 0;
  }

  draw() {
    ctx.fillStyle = "#00f0ff";
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 20;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.shadowBlur = 0;
  }
}

class Obstacle {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }

  update(speed) {
    this.x -= speed;
  }

  draw() {
    ctx.fillStyle = "#ff0055";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.size);
    ctx.lineTo(this.x + this.size / 2, this.y);
    ctx.lineTo(this.x + this.size, this.y + this.size);
    ctx.closePath();
    ctx.fill();
  }
}

new Game();
