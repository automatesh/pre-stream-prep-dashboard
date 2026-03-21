import type { NetworkState } from '../types/index'

// Stub — will be implemented by agent in Phase 2
export interface NetCheck {
  check(): Promise<void>
  startPeriodicCheck(intervalMs: number): void
  stopPeriodicCheck(): void
  getState(): NetworkState
  onStateChange(callback: (state: NetworkState) => void): void
}

const defaultState: NetworkState = {
  status: 'disconnected',
  uploadSpeedMbps: null,
  lastChecked: null
}

export function createNetCheck(): NetCheck {
  let state = { ...defaultState }
  let intervalId: ReturnType<typeof setInterval> | null = null
  const listeners: ((state: NetworkState) => void)[] = []

  return {
    async check() {
      // TODO: implement upload speed test
      state = { ...state, status: 'connected', lastChecked: Date.now() }
    },
    startPeriodicCheck(intervalMs) {
      this.stopPeriodicCheck()
      intervalId = setInterval(() => this.check(), intervalMs)
    },
    stopPeriodicCheck() {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    },
    getState() {
      return state
    },
    onStateChange(callback) {
      listeners.push(callback)
    }
  }
}
