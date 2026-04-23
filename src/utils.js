import { state, runtimeSettings } from './global.js';

export function preloadImage(key) {
  state.phaserGame.load.image(key, `images/${key}.png`);
}

export function preloadSpritesheet(key, w, h) {
  state.phaserGame.load.spritesheet(key, `images/${key}.png`, w, h);
}

export function preloadAudio(key) {
  state.phaserGame.load.audio(key, `sounds/${key}.mp3`);
}

export function overlapAABB(left1, top1, right1, bottom1, left2, top2, right2, bottom2) {
  return left1 < right2 &&
    right1 > left2 &&
    top1 < bottom2 &&
    bottom1 > top2;
}

export function unlockAudioContext() {
  const context = state.phaserGame?.sound?.context;
  if (context && context.state === 'suspended') {
    context.resume();
  }
}

function coerceValue(v) {
  if (typeof v !== 'string') return v;
  if (v === 'undefined') return undefined;
  if (v === 'null') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  // 安全的引号字符串
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  const num = Number(v);
  return Number.isNaN(num) ? v : num;
}

function safeParseQueryString(qs) {
  const result = {};
  if (!qs) return result;
  const pairs = qs.split('&');
  for (const pair of pairs) {
    // 只拆第一个 '='，防止 value 中包含 '='
    const idx = pair.indexOf('=');
    if (idx === -1) {
      result[decodeURIComponent(pair)] = '';
    } else {
      const key = decodeURIComponent(pair.slice(0, idx));
      const value = decodeURIComponent(pair.slice(idx + 1));
      result[key] = value;
    }
  }
  return result;
}

// 防止任意字段被注入，只允许已知的配置项
const ALLOWED_SETTING_KEYS = new Set([
  'gravity', 'flap', 'speed', 'spacing', 'gap',
  'ceiling', 'canvas', 'antialias', 'debug',
  'scoreSounds', 'hurtSounds', 'mobile', 'feedback'
]);

export function loadSettingsFromUrl() {
  const qs = window.location.search.substring(1);
  if (!qs) return;

  const parsed = safeParseQueryString(qs);
  for (const k in parsed) {
    if (!ALLOWED_SETTING_KEYS.has(k)) continue;
    const v = coerceValue(parsed[k]);
    if (typeof v === 'string' && v.length === 0) continue;

    // feedback 只允许字符串，且做基础校验
    if (k === 'feedback') {
      const trimmed = String(v).trim();
      if (!trimmed) continue;
      runtimeSettings[k] = trimmed;
      continue;
    }

    runtimeSettings[k] = v;
  }
}
