import { state, runtimeSettings } from './global.js';
import { preloadAudio } from './utils.js';

function SoundArray(name, opts) {
  this.sounds = [];
  this.name = name;
  this.count = opts.count || 0;
  this.currentIndex = 0;
  this.recentIndex = 0;
  this.loop = !!opts.loop;
  this.playing = false;
  this.manuallyStopped = false;
}

SoundArray.prototype.preload = function () {
  if (!this.count) {
    preloadAudio(this.name);
    return;
  }
  const lazyLoad = this.name === 'score' || this.name === 'hurt';
  if (lazyLoad) {
    preloadAudio(`${this.name}/1`);
    return;
  }

  for (let i = 0; i < this.count; i++) {
    preloadAudio(`${this.name}/${i + 1}`);
  }
};

SoundArray.prototype.createSound = function (key) {
  const sound = state.phaserGame.add.audio(key);
  sound.onStop.add(this.onStop, this);
  return sound;
};

SoundArray.prototype.create = function () {
  if (!this.count) {
    this.sounds[0] = this.createSound(this.name);
    this.count = 1;
    return;
  }
  const lazyLoad = this.name === 'score' || this.name === 'hurt';
  if (lazyLoad) {
    this.sounds[0] = this.createSound(`${this.name}/1`);
    return;
  }

  for (let i = 0; i < this.count; i++) {
    this.sounds[i] = this.createSound(`${this.name}/${i + 1}`);
  }
};

SoundArray.prototype.lazyLoad = function () {
  if (this.sounds.length > 0 && this.sounds[0]) {
    return;
  }
  for (let i = 0; i < this.count; i++) {
    this.sounds[i] = this.createSound(`${this.name}/${i + 1}`);
  }
};

SoundArray.prototype.random = function () {
  if (this.count <= 1) {
    this.currentIndex = 0;
    return;
  }
  // 使用循环替代递归，避免栈溢出
  let index;
  let attempts = 0;
  const maxAttempts = 20;
  do {
    index = Math.floor(Math.random() * this.count);
    attempts++;
    if (this.count < 5) {
      this.currentIndex = index;
      return;
    }
  } while (
    attempts < maxAttempts &&
    !(index !== this.currentIndex && index !== this.recentIndex) &&
    !(index === this.currentIndex && index === this.recentIndex)
  );
  this.recentIndex = this.currentIndex;
  this.currentIndex = index;
};

SoundArray.prototype.getSound = function () {
  return this.sounds[this.currentIndex];
};

SoundArray.prototype.isPlaying = function () {
  return this.playing;
};

SoundArray.prototype.onStop = function () {
  if (this.loop && !this.manuallyStopped) {
    this.play();
    return;
  }
  this.playing = false;
};

SoundArray.prototype.playSound = function () {
  this.playing = true;
  const snd = this.getSound();
  if (snd) snd.play();
};

SoundArray.prototype.play = function () {
  this.manuallyStopped = false;
  this.random();
  if (this.name === 'score' || this.name === 'hurt') {
    this.lazyLoad();
  }
  // 懒加载后需要重新映射 currentIndex 对应的 sound
  this.playSound();
  if (runtimeSettings.debug) {
    // eslint-disable-next-line no-console
    console.log('sound', this.name, this.currentIndex + 1);
  }
};

SoundArray.prototype.playCustom = function (id) {
  this.manuallyStopped = true;
  this.currentIndex = id - 1;
  if (this.name === 'score' || this.name === 'hurt') {
    this.lazyLoad();
  }
  this.playSound();
};

SoundArray.prototype.stop = function () {
  this.manuallyStopped = true;
  const snd = this.getSound();
  if (snd) snd.stop();
};

SoundArray.prototype.toggle = function () {
  this.playing ? this.stop() : this.play();
};

const soundMap = {};

export default function sounds(name) {
  return soundMap[name];
}

sounds.preload = function () {
  const defs = {
    bgm: { loop: true },
    crash: {},
    flap: {},
    ha: {},
    hurt: { count: runtimeSettings.hurtSounds },
    score: { count: runtimeSettings.scoreSounds }
  };

  for (const name in defs) {
    soundMap[name] = new SoundArray(name, defs[name]);
    soundMap[name].preload();
  }
};

sounds.create = function () {
  for (const name in soundMap) {
    soundMap[name].create();
  }
};
