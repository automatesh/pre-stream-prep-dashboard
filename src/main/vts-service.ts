import { ApiClient } from 'vtubestudio'
import WebSocket from 'ws'
import type { VTSState } from '../types/index'
import { getVtsToken, saveVtsToken } from './store'

export interface VTSService {
  connect(opts?: { port?: number }): Promise<void>
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
  let state: VTSState = { ...defaultState }
  const listeners: ((state: VTSState) => void)[] = []
  let apiClient: ApiClient | null = null
  let pollInterval: ReturnType<typeof setInterval> | null = null
  let stopped = false

  function setState(patch: Partial<VTSState>): void {
    const prev = state
    state = { ...state, ...patch }
    if (JSON.stringify(prev) !== JSON.stringify(state)) {
      for (const cb of listeners) cb(state)
    }
  }

  async function fetchState(): Promise<void> {
    if (!apiClient || !apiClient.isConnected) return

    try {
      const [modelInfo, faceInfo, paramInfo] = await Promise.all([
        apiClient.currentModel().catch(() => null),
        apiClient.faceFound().catch(() => null),
        apiClient.inputParameterList().catch(() => null)
      ])

      const currentModel = modelInfo?.modelLoaded
        ? { id: modelInfo.modelID, name: modelInfo.modelName, loaded: true }
        : null

      const parameterCount =
        (paramInfo?.defaultParameters?.length ?? 0) + (paramInfo?.customParameters?.length ?? 0)

      setState({
        currentModel,
        faceTracking: {
          active: !!modelInfo?.modelLoaded,
          faceDetected: faceInfo?.found ?? false,
          parameterCount
        }
      })
    } catch {
      // individual calls already caught; this is a safety net
    }
  }

  function startPolling(): void {
    stopPolling()
    pollInterval = setInterval(() => {
      fetchState()
    }, 2000)
  }

  function stopPolling(): void {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  return {
    async connect(opts?: { port?: number }) {
      if (apiClient) return
      stopped = false

      const port = opts?.port ?? 8001

      setState({ status: 'connecting' })

      apiClient = new ApiClient({
        authTokenGetter: () => getVtsToken(),
        authTokenSetter: async (token: string) => {
          saveVtsToken(token)
        },
        pluginName: 'Stream Prep Dashboard',
        pluginDeveloper: 'StreamPrep',
        port,
        webSocketFactory: (url: string) => new WebSocket(url) as never
      })

      apiClient.on('connect', () => {
        setState({ status: 'connected' })
        fetchState()
        startPolling()
      })

      apiClient.on('disconnect', () => {
        stopPolling()
        if (stopped) {
          setState({ ...defaultState })
        } else {
          setState({ status: 'connecting', currentModel: null, faceTracking: defaultState.faceTracking })
        }
      })

      apiClient.on('error', () => {
        if (!stopped) {
          setState({ status: 'error' })
        }
      })
    },

    disconnect() {
      stopped = true
      stopPolling()
      if (apiClient) {
        apiClient.disconnect()
        apiClient = null
      }
      setState({ ...defaultState })
    },

    getState() {
      return state
    },

    onStateChange(callback) {
      listeners.push(callback)
    }
  }
}
