import { state, runtimeSettings } from './global.js';
import { preloadImage, overlapAABB } from './utils.js';

let pipeLayer;

function PipePair() {
  this.scored = false;
  this.alive = true;
  this.topPipe = pipeLayer.create(0, 0, 'pipe');
  this.bottomPipe = pipeLayer.create(0, 0, 'pipe');
  this.topPipe.scale.setTo(2, 2);
  this.bottomPipe.scale.setTo(2, 2);
}

PipePair.prototype.reset = function () {
  const gap = runtimeSettings.gap / 2;
  const game = state.phaserGame;
  const x = game.width;
  let y = game.height / 2 + (Math.random() > 0.5 ? -1 : 1) * Math.random() * game.height / 6;
  y -= 50;

  this.topPipe.x = x;
  this.topPipe.y = y - gap - this.topPipe.height;

  this.bottomPipe.x = x;
  this.bottomPipe.y = y + gap;

  this.scored = false;
};

PipePair.prototype.kill = function () {
  this.topPipe.visible = false;
  this.bottomPipe.visible = false;
  this.alive = false;
};

PipePair.prototype.revive = function () {
  this.topPipe.visible = true;
  this.bottomPipe.visible = true;
  this.alive = true;
};

PipePair.prototype.checkScore = function (x) {
  if (!this.alive || this.scored) return false;
  if (x > this.topPipe.x + this.topPipe.width) {
    this.scored = true;
    return true;
  }
  return false;
};

PipePair.prototype.checkCollision = function (left, top, right, bottom) {
  if (!this.alive) return false;
  if (overlapAABB(
    left, top, right, bottom,
    this.topPipe.x, this.topPipe.y,
    this.topPipe.x + this.topPipe.width, this.topPipe.y + this.topPipe.height
  )) {
    return true;
  }
  if (overlapAABB(
    left, top, right, bottom,
    this.bottomPipe.x, this.bottomPipe.y,
    this.bottomPipe.x + this.bottomPipe.width, this.bottomPipe.y + this.bottomPipe.height
  )) {
    return true;
  }
  return false;
};

PipePair.prototype.checkOutOfBound = function () {
  return this.topPipe.x + this.topPipe.width <= state.phaserGame.world.bounds.left;
};

PipePair.prototype.moveX = function (n) {
  if (!this.alive) return;
  this.topPipe.x -= n;
  this.bottomPipe.x -= n;
  if (this.checkOutOfBound()) this.kill();
};

PipePair.prototype.render = function () {
  state.phaserGame.debug.renderSpriteBody(this.topPipe);
  state.phaserGame.debug.renderSpriteBody(this.bottomPipe);
};

const pipeList = [];
let paused = true;
let distance = 0;

export function checkScore(x) {
  for (let i = 0; i < pipeList.length; i++) {
    if (pipeList[i].checkScore(x)) return true;
  }
  return false;
}

export function checkCollision(left, top, right, bottom) {
  for (let i = 0; i < pipeList.length; i++) {
    if (pipeList[i].checkCollision(left, top, right, bottom)) return true;
  }
  return false;
}

function reusePipe() {
  for (let i = 0; i < pipeList.length; i++) {
    if (!pipeList[i].alive) return pipeList[i];
  }
  return null;
}

function spawn() {
  let pipe = reusePipe();
  if (!pipe) {
    pipe = new PipePair();
    pipeList.push(pipe);
  } else {
    pipe.revive();
  }
  pipe.reset();
}

export function update() {
  if (paused) return;

  const t = state.phaserGame.time.physicsElapsed;
  const s = runtimeSettings.speed * t;

  for (let i = 0; i < pipeList.length; i++) {
    pipeList[i].moveX(s);
  }

  distance += s;
  if (distance >= runtimeSettings.spacing) {
    distance = 0;
    spawn();
  }
}

export function start() {
  paused = false;
}

export function stop() {
  paused = true;
}

export function reset() {
  for (let i = 0; i < pipeList.length; i++) {
    if (pipeList[i].alive) pipeList[i].kill();
  }
  distance = 0;
}

export function preload() {
  preloadImage('pipe');
}

export function create() {
  pipeLayer = state.phaserGame.add.group();
}

function renderAll(flags) {
  if (!flags) return;
  for (let i = 0; i < pipeList.length; i++) {
    if (flags & 1 && pipeList[i].alive) pipeList[i].render();
    if (flags & 2 && !pipeList[i].alive) pipeList[i].render();
  }
}

export function render() {
  if (runtimeSettings.debug) renderAll(3);
}
