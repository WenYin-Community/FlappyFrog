export const FONT = '"Segoe UI", "Microsoft YaHei", 宋体, sans-serif';

// 使用 Object.freeze 防止意外修改
export const SETTINGS = Object.freeze({
  gravity: 40,
  flap: 620,
  speed: 390,
  spacing: 468,
  gap: 300,
  ceiling: false,
  canvas: true,
  antialias: false,
  debug: false,
  scoreSounds: 43,
  hurtSounds: 21
});

// 运行时状态（可变）
export const state = {
  phaserGame: null,
  score: 0,
  timeElapsed: 0,
  bestScore: 0,
  font: FONT
};

// 运行时配置（允许 URL 参数覆盖，但会做校验）
export const runtimeSettings = { ...SETTINGS };

