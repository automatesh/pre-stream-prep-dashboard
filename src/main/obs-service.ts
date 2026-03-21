import type { OBSState } from '../types/index'

// Stub — will be implemented by agent in Phase 2
export interface OBSService {
  connect(): Promise<void>
  disconnect(): void
  getState(): OBSState
  onStateChange(callback: (state: OBSState) => void): void
}

const defaultState: OBSState = {
  status: 'disconnected',
  scenes: [],
  activeScene: null,
  audioInputs: [],
  outputSettings: null,
  isStreaming: false,
  isRecording: false
}

export function createOBSService(): OBSService {
  let state = { ...defaultState }
  const listeners: ((state: OBSState) => void)[] = []

  return {
    async connect() {
      state = { ...state, status: 'connecting' }
      // TODO: implement with obs-websocket-js
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
