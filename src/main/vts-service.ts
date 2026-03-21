import type { VTSState } from '../types/index'

// Stub — will be implemented by agent in Phase 2
export interface VTSService {
  connect(): Promise<void>
  disconnect(): void
  getState(): VTSState
  onStateChange(callback: (state: VTSState) => void): void
}

const defaultState: VTSState = {
  status: 'disconnected',
  currentModel: null,
  faceTracking: {
    active: false,
    faceDetected: false,
    parameterCount: 0
  }
}

export function createVTSService(): VTSService {
  let state = { ...defaultState }
  const listeners: ((state: VTSState) => void)[] = []

  return {
    async connect() {
      state = { ...state, status: 'connecting' }
      // TODO: implement with vtubestudio + ws
    },
    disconnect() {
      state = { ...defaultState }
    },
    getState() {
      return state
    },
    onStateChange(callback) {
      listeners.push(callback)
    }
  }
}
