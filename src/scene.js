import { state, runtimeSettings } from './global.js';
import { unlockAudioContext, preloadImage } from './utils.js';
import * as game from './game.js';
import sounds from './sounds.js';

function isValidFeedbackUrl(url) {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed, window.location.href);
    // 只允许 http / https，禁止 javascript: / data: 等伪协议
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    // 相对路径也允许，但要确保不包含冒号（防止伪协议）
    return !trimmed.includes(':');
  }
}

function TextButton(opts) {
  this.label = state.phaserGame.add.text(
    opts.x || 0,
    opts.y || 0,
    opts.text || '',
    {
      font: `${opts.size || '22px'} ${state.font}`,
      fill: '#fff',
      stroke: '#430',
      strokeThickness: 4,
      align: 'center'
    }
  );
  this.label.anchor.setTo(
    opts.anchorX || 0,
    opts.anchorY || 0
  );

  this.sprite = state.phaserGame.add.sprite(this.label.x, this.label.y);
  this.sprite.width = this.label.width;
  this.sprite.height = this.label.height;
  this.sprite.anchor.setTo(this.label.anchor.x, this.label.anchor.y);
  this.sprite.inputEnabled = true;

  this.events = this.sprite.events;
}

TextButton.prototype.show = function () {
  this.label.visible = true;
  this.sprite.visible = true;
};

TextButton.prototype.hide = function () {
  this.label.visible = false;
  this.sprite.visible = false;
};

let tipsText, loadingText, scoreText;
let playButton, restartButton, feedbackButton, playBgmButton;

function setLoadingText(percent) {
  loadingText.setText(`Loading...\n\n历史的行程: ${percent} %`);
}

function createLoadingScreen() {
  tipsText = state.phaserGame.add.text(
    state.phaserGame.width / 2,
    state.phaserGame.height / 4,
    '请打开声音',
    {
      font: `16px ${state.font}`,
      fill: '#fff',
      align: 'center'
    }
  );
  tipsText.anchor.setTo(0.5, 0.5);

  loadingText = state.phaserGame.add.text(
    state.phaserGame.width / 2,
    state.phaserGame.height / 2,
    '',
    {
      font: `24px ${state.font}`,
      fill: '#f00',
      align: 'center'
    }
  );
  loadingText.anchor.setTo(0.5, 0.5);
  setLoadingText(0);
  state.phaserGame.load.onFileComplete.add(setLoadingText);
}

function createButtons() {
  playButton = new TextButton({
    x: state.phaserGame.width / 2,
    y: state.phaserGame.height - state.phaserGame.height / 3,
    anchorX: 0.5,
    anchorY: 0.5,
    text: '开始'
  });
  playButton.hide();

  playButton.events.onInputUp.add(() => {
    unlockAudioContext();
    shift('play');
  });

  restartButton = new TextButton({
    x: state.phaserGame.width / 2,
    y: state.phaserGame.height - state.phaserGame.height / 5,
    anchorX: 0.5,
    anchorY: 0.5,
    text: '重新续'
  });
  restartButton.hide();

  restartButton.events.onInputUp.add(() => {
    shift('title');
  });

  feedbackButton = new TextButton({
    x: 0,
    y: 0,
    size: '14px',
    text: '"5"可奉告'
  });

  feedbackButton.events.onInputUp.add(() => {
    unlockAudioContext();
    if (runtimeSettings.scoreSounds >= 15) {
      sounds('score')?.playCustom(15);
    }
    const fb = runtimeSettings.feedback;
    if (!fb || !isValidFeedbackUrl(fb)) return;
    window.open(fb);
  });

  playBgmButton = new TextButton({
    x: state.phaserGame.width,
    y: 0,
    anchorX: 1,
    size: '14px',
    text: '请州长夫人演唱'
  });

  playBgmButton.events.onInputUp.add(() => {
    unlockAudioContext();
    sounds('bgm')?.toggle();
  });
}

function createScoreText() {
  scoreText = state.phaserGame.add.text(
    state.phaserGame.width / 2,
    state.phaserGame.height / 2,
    '',
    {
      font: `18px ${state.font}`,
      fill: '#fff',
      stroke: '#430',
      strokeThickness: 4,
      align: 'center'
    }
  );
  scoreText.anchor.setTo(0.5, 0.5);
  scoreText.visible = false;
}

function showScore() {
  const template = '我为长者续命 %s 秒\n志己的生命减少 %s 秒\n而且这个效率efficiency: %s%\n\n最吼的一次续了 %s 秒';
  const s = state.score || 0;
  const t = state.timeElapsed || 1;
  const efficiency = Math.floor(s / t * 100);
  const text = template
    .replace('%s', s)
    .replace('%s', t)
    .replace('%s', efficiency)
    .replace('%s', state.bestScore || 0);

  scoreText.setText(text);
  scoreText.visible = true;
}

function hideScore() {
  scoreText.visible = false;
}

let sceneName = 'loading';
const scenes = {
  loading: {
    enter() { /* no-op */ },
    exit() {
      tipsText.visible = false;
      loadingText.visible = false;
    }
  },
  title: {
    enter() {
      playButton.show();
    },
    exit() {
      playButton.hide();
    }
  },
  play: {
    enter() {
      game.start(() => {
        shift('end');
      });
    },
    exit() { /* no-op */ }
  },
  end: {
    enter() {
      restartButton.show();
      showScore();
    },
    exit() {
      restartButton.hide();
      hideScore();
      game.reset();
    }
  }
};

export function shift(name) {
  if (sceneName === name) return;
  if (sceneName) scenes[sceneName].exit();
  sceneName = name;
  scenes[sceneName].enter();
}

export function preload() {
  createLoadingScreen();
  game.preload();
}

export function create() {
  game.create();
  createButtons();
  createScoreText();
}

export function update() {
  game.update();
}

export function render() {
  game.render();
}
