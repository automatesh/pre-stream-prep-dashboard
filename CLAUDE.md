# VTuber Stream Prep Dashboard

Local Electron desktop app that connects to OBS Studio and VTube Studio via WebSocket, validates a VTuber's setup in one glance before going live.

## Stack

- **Runtime**: Electron (via electron-vite)
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4
- **WebSocket clients**: obs-websocket-js v5 (OBS), vtubestudio v3 + ws (VTube Studio)
- **Persistence**: JSON files in Electron `app.getPath('userData')`
- **Tests**: Vitest (unit), Playwright (e2e, later)

## Commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run test         # Run Vitest unit tests
npm run lint         # ESLint
```

## Architecture

Two-process Electron app:

**Main process** (`src/main/`) — Node.js environment:
- All WebSocket connections (OBS + VTube Studio) live here because the `ws` module fails in Electron's renderer process
- JSON store for user data (checklist, runsheet, settings)
- System tray icon for live health monitoring
- Exposes state to renderer via IPC handlers

**Preload** (`src/preload/`) — contextBridge:
- Exposes a typed `window.api` object to renderer
- Only allowed IPC channel for renderer ↔ main communication

**Renderer** (`src/renderer/`) — React app:
- Single-screen dashboard, dark mode only
- Receives state updates from main via IPC events
- NEVER imports Node.js modules or creates WebSocket connections directly

**Shared types** (`src/types/`) — imported by both main and renderer.

### Adding a new IPC channel

1. Define the channel name and payload types in `src/types/ipc.ts`
2. Add the handler in `src/main/ipc-handlers.ts`
3. Expose it in `src/preload/index.ts` via contextBridge
4. Consume in renderer via `window.api.channelName()`

### Adding a new dashboard component

1. Create component in `src/renderer/components/`
2. Subscribe to relevant IPC events via `useIpc` hook
3. Add to `App.tsx` layout

## Constraints

- **Local-only**: no cloud, no accounts, no data leaves the machine
- **Dark mode only**: no light theme in MVP
- **Lightweight**: users run OBS + VTube Studio + a game simultaneously — minimize RAM
- **WebSocket in main only**: never connect from renderer process
- **No dependencies without asking**: discuss before adding any new package

## Git

- Commit after each meaningful change with descriptive messages
- Don't amend existing commits — create new ones
- Don't force-push

## Decisions

See [DECISIONS.md](./DECISIONS.md) for non-obvious architectural choices.
