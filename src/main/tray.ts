import type { HealthLevel } from '../types/index'

// Stub — will be implemented in Phase 4
export interface TrayManager {
  updateHealth(level: HealthLevel): void
  destroy(): void
}

export function createTrayManager(): TrayManager {
  return {
    updateHealth(_level) {
      // TODO: implement system tray icon with nativeImage
    },
    destroy() {
      // TODO: cleanup
    }
  }
}
