# Architecture Decisions

## 1. Electron over Tauri

**What**: Desktop runtime is Electron, not Tauri.
**Why**: User preference — more mature cross-platform support, easier debugging, larger ecosystem. Tauri's Rust backend adds friction for iterative JS-first development.
**Rejected**: Tauri (lighter binary, lower RAM, but less familiar tooling and harder to debug WebSocket issues).

## 2. electron-vite over Electron Forge

**What**: Using electron-vite for dev server and build tooling.
**Why**: Vite-native HMR is significantly faster than Webpack. Simpler config. electron-vite handles main/preload/renderer build targets out of the box.
**Rejected**: Electron Forge (official but heavier config), electron-builder (community-maintained, rewrites build logic), Electron React Boilerplate (Webpack-based, slower DX).

## 3. WebSocket connections in main process only

**What**: obs-websocket-js and vtubestudio clients run exclusively in the Electron main process.
**Why**: The `ws` npm module (used by both libraries) fails in Electron's renderer due to browser environment detection conflicts. Running in main and bridging via IPC is the documented workaround.
**Rejected**: Renderer-side WebSocket (breaks with `ws` module), custom browser WebSocket wrapper (fragile, loses library type safety).

## 4. React Context + useReducer over state library

**What**: State management uses React Context with useReducer, no external library.
**Why**: MVP has a single screen with ~7 components. Main process is the true source of state — renderer just mirrors it via IPC. A state library would add complexity without benefit at this scale.
**Rejected**: Redux (overkill), Zustand (unnecessary dependency), Jotai (atomic model doesn't match the IPC-push pattern).

## 5. JSON files over SQLite

**What**: Persistence uses plain JSON files in Electron's userData directory.
**Why**: MVP data is small and simple — checklist items, runsheet segments, connection settings. JSON is human-readable, zero-dependency, and trivial to debug. SQLite deferred to V2 when stream history needs structured queries.
**Rejected**: SQLite (adds native dependency complexity for simple key-value data), localStorage (not available in main process where store lives).

## 6. No UI component library

**What**: Custom components with Tailwind, no shadcn/ui or similar.
**Why**: VTuber audience is aesthetically driven — the app needs a distinct visual identity, not a generic component library look. Custom styling also means fewer dependencies and smaller bundle.
**Rejected**: shadcn/ui (good quality but generic appearance), Material UI (heavy, wrong aesthetic), Chakra (similar concerns).
