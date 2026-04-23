# AGENTS.md

## Project Type
Browser-based Flappy Bird clone using Phaser 2.x (CE). Modern ES Modules architecture with Vite build tool.

## Key Commands
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run test:e2e # E2E tests
```

## Architecture
- Entry: `index.html` → loads `src/main.js` as ES module
- Phaser 2.x (patched) loaded before module script
- Load order: `global.js` → `utils.js` → `sounds.js` → `pipes.js` → `clouds.js` → `game.js` → `scene.js` → `main.js`
- Uses Phaser CE (patched version): `public/lib/phaser.min.patched.js`

## Assets
- `public/images/` - sprites (frog, pipes, clouds, ground)
- `public/sounds/` - audio files (bgm, flap, score, hurt, crash, ha)
- `public/icons/` - iOS app icons

## Configuration
URL parameters for runtime config:
- `gravity`, `flap`, `speed`, `gap`, `ceiling`, `debug`, `scoreSounds`, `hurtSounds`, `mobile`, `feedback`

## Security
- URL parameters validated against whitelist
- Feedback URL validated (http/https only, no javascript: protocol)
- localStorage for persistent high score

## Verification
- E2E tests with Playwright
- Manual browser verification only for gameplay