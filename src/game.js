import { state, runtimeSettings } from './global.js';
import { preloadImage, unlockAudioContext } from './utils.js';
import sounds from './sounds.js';
import * as pipes from './pipes.js';
import * as clouds from './clouds.js';

const STORAGE_KEY = 'flappy-frog-best-score';

function loadBestScore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) state.bestScore = parsed;
    }
  } catch {
    // 忽略存储报错（如隐私模式）
  }
}

function saveBestScore() {
  try {
    localStorage.setItem(STORAGE_KEY, String(state.bestScore));
  } catch {
    // 忽略存储报错
  }
}

let ground, bird;
let gameStarted = false;
let crashed = false;
let crashedGround = false;
let scoreText, score = 0;
let timeElapsedText, timeElapsed = 0, startTime;

function createBackground() {
  const graphics = state.phaserGame.add.graphics(0, 0);
  graphics.beginFill(0xDDEEFF, 1);
  graphics.drawRect(0, 0, state.phaserGame.width, state.phaserGame.height);
  graphics.endFill();
}

function createGround() {
  state.phaserGame.world.bounds.height = state.phaserGame.height + 16;
  const height = 32;
  ground = state.phaserGame.add.tileSprite(
    0,
    state.phaserGame.height - height,
    state.phaserGame.width,
    height,
    'ground'
  );
  ground.tileScale.setTo(2, 2);
}

function createBird() {
  bird = state.phaserGame.add.sprite(
    state.phaserGame.width / 2,
    state.phaserGame.height / 2,
    'frog'
  );
  bird.anchor.setTo(0.5, 0.5);
  bird.body.collideWorldBounds = true;
}

function createTexts() {
  scoreText = state.phaserGame.add.text(
    state.phaserGame.width / 2,
    state.phaserGame.height / 4,
    '',
    {
      font: `14px ${state.font}`,
      fill: '#fff',
      stroke: '#430',
      strokeThickness: 4,
      align: 'center'
    }
  );
  scoreText.anchor.setTo(0.5, 0.5);

  timeElapsedText = state.phaserGame.add.text(
    state.phaserGame.width / 2,
    scoreText.y + scoreText.height,
    '',
    {
      font: `14px ${state.font}`,
      fill: '#f00',
      align: 'center'
    }
  );
  timeElapsedText.anchor.setTo(0.5, 0.5);
}

function updateGround() {
  if (crashed) return;
  const t = state.phaserGame.time.physicsElapsed;
  const v = runtimeSettings.speed;
  ground.tilePosition.x -= t * v / 2;
}

function updateBird() {
  if (!gameStarted) {
    const y = state.phaserGame.height / 2;
    bird.y = y + 8 * Math.cos(state.phaserGame.time.now / 200);
    return;
  }
  if (crashed) return;

  const dvy = runtimeSettings.flap + bird.body.velocity.y;
  bird.angle = (90 * dvy / runtimeSettings.flap) - 180;
  if (bird.angle < 0) {
    bird.angle = 0;
  }
}

function resetBird() {
  bird.body.gravity.y = 0;
  bird.x = state.phaserGame.width / 4 + bird.width / 2;
  bird.angle = 0;
  bird.scale.setTo(1, 1);
}

let lastFlapTime = 0;
const FLAP_COOLDOWN = 120; // ms

function flap() {
  if (!gameStarted) return;
  if (crashed) return;

  const now = state.phaserGame.time.now;
  if (now - lastFlapTime < FLAP_COOLDOWN) return;
  lastFlapTime = now;

  bird.body.velocity.y = -runtimeSettings.flap;
  const flapSound = sounds('flap');
  if (flapSound && !flapSound.isPlaying()) flapSound.play();
}

function crash() {
  bird.angle = -20;
  bird.scale.setTo(1, -1);
  sounds('score')?.stop();
  sounds('ha')?.play();
  sounds('crash')?.play();
}

function crashGround() {
  bird.angle = -20;
  bird.scale.setTo(1, -1);
  sounds('score')?.stop();
  if (!crashed) sounds('crash')?.play();
}

function checkCollision() {
  if (!crashed) {
    if (
      (runtimeSettings.ceiling && bird.body.bottom - bird.body.height <= state.phaserGame.world.bounds.top) ||
      pipes.checkCollision(
        bird.body.right - bird.body.width,
        bird.body.bottom - bird.body.height,
        bird.body.right,
        bird.body.bottom
      )
    ) {
      stop();
      crash();
      crashed = true;
    } else if (pipes.checkScore(bird.body.right)) {
      addScore();
    }
  }

  if (!crashedGround) {
    if (bird.body.bottom >= state.phaserGame.world.bounds.bottom) {
      stop();
      crashGround();
      crashed = true;
      crashedGround = true;
      endGame();
    }
  }
}

function addScore() {
  score += 1;
  updateScoreText();
  sounds('score')?.play();
}

function updateScoreText() {
  scoreText.setText(`+ ${score} s`);
}

function updateTimeElapsed() {
  if (crashed) return;
  const a = Math.floor(state.phaserGame.time.elapsedSecondsSince(startTime)) + 1;
  if (timeElapsed === a) return;
  timeElapsed = a;
  timeElapsedText.setText(`- ${timeElapsed} s`);
}

let onGameOver;

function endGame() {
  state.timeElapsed = timeElapsed;
  state.score = score;
  if (!state.bestScore || state.bestScore < score) {
    state.bestScore = score;
    saveBestScore();
  }

  setTimeout(() => {
    sounds('hurt')?.play();
    if (typeof onGameOver === 'function') onGameOver();
  }, 500);
}

function stop() {
  if (crashed) return;
  pipes.stop();
}

export function start(cb) {
  startTime = state.phaserGame.time.now;

  sounds('hurt')?.stop();
  onGameOver = cb;

  bird.body.gravity.y = runtimeSettings.gravity;
  updateScoreText();
  scoreText.visible = true;
  pipes.start();
  gameStarted = true;

  flap();
}

export function reset() {
  timeElapsedText.setText('');

  score = 0;
  gameStarted = false;
  crashed = false;
  crashedGround = false;

  scoreText.visible = false;

  pipes.reset();
  resetBird();
}

export function preload() {
  pipes.preload();
  clouds.preload();
  preloadImage('frog');
  preloadImage('ground');
}

export function create() {
  loadBestScore();

  createBackground();
  pipes.create();
  createBird();
  createGround();
  createTexts();
  clouds.create();

  state.phaserGame.input.onDown.add(flap);

  // 键盘支持：空格/上箭头跳跃
  const keyboard = state.phaserGame.input.keyboard;
  if (keyboard) {
    const flapKey = keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    const upKey = keyboard.addKey(Phaser.Keyboard.UP);
    flapKey.onDown.add(flap);
    upKey.onDown.add(flap);
  }

  reset();
}

export function update() {
  clouds.update();
  updateBird();
  updateGround();
  if (gameStarted) {
    updateTimeElapsed();
    checkCollision();
    pipes.update();
  }
}

export function render() {
  if (runtimeSettings.debug) {
    state.phaserGame.debug.renderSpriteBody(bird);
  }
  pipes.render();
}
