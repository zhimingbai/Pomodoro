# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

**所有回复、解释、注释说明必须使用中文。**

## Project

Pomodoro timer desktop app — Electron + Vue 3 + TypeScript + Pinia. 420×620 fixed window, dark theme, Chinese UI.

## Commands

```bash
# Development (with HMR)
npx electron-vite dev

# Type checking (pnpm has allowBuilds issues, use npx)
npx vue-tsc --noEmit -p tsconfig.web.json --composite false
npx tsc --noEmit -p tsconfig.node.json --composite false

# Production build
npx electron-vite build
```

`pnpm dev` fails due to pnpm v11 blocking Electron's postinstall script. Always use `npx electron-vite dev` directly. If the Electron binary is missing, run:
```bash
node --use-system-ca node_modules/.pnpm/electron@*/node_modules/electron/install.js
```

## Architecture

**Three-target build** (electron-vite): `src/main/` → `out/main/`, `src/preload/` → `out/preload/`, `src/renderer/` → `out/renderer/`. The renderer uses Vite with `@vitejs/plugin-vue` and an `@renderer` alias pointing to `src/renderer/src`.

**IPC**: Renderer calls `window.api.*` (exposed via `src/preload/index.ts` contextBridge). Main process handles in `src/main/index.ts`. Three channels: `read-json`, `write-json`, `send-notification`. Never add new IPC channels without updating all three files (main, preload, preload types).

**Persistence**: `src/main/persistence.ts` — synchronous Node.js `fs` operations in `app.getPath('userData')`. Three JSON files: `settings.json`, `tasks.json`, `history.json`. Each Pinia store loads on mount and saves on every mutation. No debouncing needed — local file IO is fast.

**Timer engine**: `src/renderer/src/stores/timer.ts` — absolute `endTimestamp` approach with `setInterval(tick, 200)`. No drift because `remaining = (endTimestamp - Date.now()) / 1000`. Phases: focus → shortBreak → focus → … → longBreak (every N cycles) → repeat. State machine: idle → running ⇄ paused → (complete) → idle → next phase.

**Pinia stores** (4): `settings`, `timer`, `tasks`, `history`. Each is independent. `timer.ts` imports `useHistoryStore` at runtime in `completeSession()` to avoid circular dependency issues. Settings store exposes `getPhaseDurationSeconds(phase)` used by the timer.

**Component tree**: `App.vue` owns tab navigation (reactive `activeTab` ref, not vue-router). Each tab renders a single root component: `TimerDisplay` + `TimerControls` + `SessionIndicator` for Timer tab; `TaskList` (with `TaskForm` + `TaskItem`) for Tasks; `StatsOverview` for Stats; `SettingsPanel` for Settings.

## Key patterns

- Color-coded phases: focus=`#ff6b6b` (red), shortBreak=`#51cf66` (green), longBreak=`#339af0` (blue)
- `crypto.randomUUID()` for IDs, `Intl`/`Date` for time formatting — no external libs
- Settings changes are blocked while timer is running (`isRunning || isPaused`)
- Window title bar is a drag region (`-webkit-app-region: drag` on `.header`)
- Notification permission is not pre-requested; Electron's Notification API is called directly
