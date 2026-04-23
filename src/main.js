import { state, runtimeSettings } from './global.js';
import sounds from './sounds.js';
import * as scene from './scene.js';
import * as utils from './utils.js';

// 等待 Phaser 加载完成
if (typeof Phaser === 'undefined') {
  console.error('Phaser not loaded!');
  document.body.innerHTML = '<h1 style="color:white">Phaser library failed to load</h1>';
} else {
  initGame();
}

function initGame() {
  utils.loadSettingsFromUrl();

  const width = 480;
  const height = 700;

  const availWidth = document.body.offsetWidth;
  const availHeight = document.body.offsetHeight;
  let deviceWidth = 480;
  let deviceHeight = 700;

  if (availWidth > availHeight) {
    const w = availWidth;
    deviceWidth = availHeight;
    deviceHeight = w;
  }

  const isMobile = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (deviceWidth >= 320 && deviceHeight >= 480 && deviceHeight <= 1280) {
    if (!isMobile || runtimeSettings.mobile) {
      deviceWidth = availWidth;
      deviceHeight = availHeight;
    }
  }

  state.phaserGame = new Phaser.Game(
    deviceWidth,
    deviceHeight,
    runtimeSettings.canvas ? Phaser.CANVAS : Phaser.AUTO,
    'game',
    {
      preload: preload,
      create: create,
      update: update,
      render: render
    },
    false,
    runtimeSettings.antialias
  );

  window.addEventListener('resize', resizeHandler);
}

function preload() {
  state.phaserGame.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
  state.phaserGame.stage.scale.setScreenSize(true);

  sounds.preload();
  scene.preload();
}

function create() {
  sounds.create();
  scene.create();
  scene.shift('title');
}

function update() {
  scene.update();
}

function render() {
  scene.render();
}

function resizeHandler() {
  if (!state.phaserGame) return;
  const game = state.phaserGame;
  const availWidth = document.body.offsetWidth;
  const availHeight = document.body.offsetHeight;
  let width = 480;
  let height = 700;

  if (availWidth > availHeight) {
    const w = availWidth;
    width = availHeight;
    height = w;
  }

  const isMobile = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isMobile || runtimeSettings.mobile) {
    if (availWidth >= 320 && availHeight >= 480 && availHeight <= 1280) {
      width = availWidth;
      height = availHeight;
    }
  }

  game.scale.width = width;
  game.scale.height = height;
}
