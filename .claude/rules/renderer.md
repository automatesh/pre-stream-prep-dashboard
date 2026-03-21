---
description: Rules for Electron renderer (React) code in src/renderer/
globs: src/renderer/**
---

- React + Tailwind only — no Node.js APIs (fs, path, child_process, require)
- Access main process ONLY via `window.api` (preload contextBridge)
- Never create WebSocket connections directly — all data comes via IPC
- Dark mode assumed — no light theme, no theme toggle
- Tailwind classes only — no inline styles, no CSS modules
- Components receive state via DashboardContext or props — no direct IPC calls in components (use hooks)
