import { state, runtimeSettings } from './global.js';
import { preloadSpritesheet } from './utils.js';

let cloudGroup;
let spawnTime = Math.random();
let timeElapsed = 0;

function resetCloud(cloud) {
  const game = state.phaserGame;
  cloud.x = game.width;
  cloud.y = Math.random() * game.height / 2;
  cloud.frame = Math.floor(4 * Math.random());
  const cloudScale = 2 + 2 * Math.random();
  cloud.alpha = 2 / cloudScale;
  if (cloud.alpha > 0.7) cloud.alpha = 0.7;
  cloud.scale.setTo(cloudScale, cloudScale);
  cloud.body.velocity.x = -runtimeSettings.speed / cloudScale;
}

function spawn() {
  let cloud = cloudGroup.getFirstDead();
  if (cloud) {
    cloud.revive();
  } else {
    cloud = cloudGroup.create(state.phaserGame.width, state.phaserGame.height, 'clouds');
  }
  resetCloud(cloud);
}

export function update() {
  cloudGroup.forEachAlive(function (cloud) {
    if (cloud.x + cloud.width < state.phaserGame.world.bounds.left) {
      cloud.kill();
    }
  });

  timeElapsed += state.phaserGame.time.physicsElapsed;
  if (timeElapsed >= spawnTime) {
    spawnTime = 4 * Math.random();
    timeElapsed = 0;
    spawn();
  }
}

export function preload() {
  preloadSpritesheet('clouds', 128, 64);
}

export function create() {
  cloudGroup = state.phaserGame.add.group();
}
