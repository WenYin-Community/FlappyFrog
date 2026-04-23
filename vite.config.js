import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: '/FlappyFrog/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  publicDir: 'public',
  plugins: [
    {
      name: 'copy-phaser',
      closeBundle() {
        const src = 'public/lib/phaser.min.patched.js';
        const dest = 'dist/lib/phaser.min.patched.js';
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      }
    }
  ]
});
