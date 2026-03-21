---
description: Rules for Electron main process code in src/main/
globs: src/main/**
---

- Node.js environment only — no DOM APIs (document, window, navigator)
- All WebSocket clients (OBS, VTube Studio) live here — never in renderer
- Use `ws` module for WebSocket, not browser WebSocket API
- Export IPC handlers via `ipc-handlers.ts` — never import from renderer
- Store reads/writes go through `store.ts` — no direct fs calls elsewhere
- Async operations must handle connection drops gracefully (auto-reconnect pattern)
