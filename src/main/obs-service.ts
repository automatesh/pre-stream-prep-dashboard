import OBSWebSocket, { EventSubscription } from 'obs-websocket-js'
import type {
  OBSState,
  OBSScene,
  OBSAudioInput,
  OBSOutputSettings
} from '../types/index'
import { getSettings } from './store'

export interface OBSService {
  connect(opts?: { port?: number; password?: string }): Promise<void>
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
  const obs = new OBSWebSocket()
  let state: OBSState = { ...defaultState }
  const listeners: ((state: OBSState) => void)[] = []
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let intentionalDisconnect = false
  let connectOpts: { port: number; password: string } = { port: 4455, password: '' }

  function setState(patch: Partial<OBSState>): void {
    state = { ...state, ...patch }
    for (const cb of listeners) {
      cb(state)
    }
  }

  async function fetchFullState(): Promise<void> {
    try {
      // Scenes + sources
      const { currentProgramSceneName, scenes: rawScenes } = await obs.call('GetSceneList')
      const scenes: OBSScene[] = []

      for (const raw of rawScenes as Array<{ sceneName: string; sceneIndex: number }>) {
        const { sceneItems } = await obs.call('GetSceneItemList', { sceneName: raw.sceneName })
        const sources = (sceneItems as Array<{
          sourceName: string
          inputKind: string | null
          sceneItemEnabled: boolean
          sourceType: string
        }>).map((item) => ({
          name: item.sourceName,
          type: item.inputKind ?? item.sourceType ?? 'unknown',
          enabled: item.sceneItemEnabled,
          active: raw.sceneName === currentProgramSceneName
        }))
        scenes.push({
          name: raw.sceneName,
          index: raw.sceneIndex,
          sources
        })
      }

      // Audio inputs
      const { inputs } = await obs.call('GetInputList')
      const audioInputs: OBSAudioInput[] = []

      for (const input of inputs as Array<{ inputName: string; inputKind: string }>) {
        try {
          const { inputMuted } = await obs.call('GetInputMute', { inputName: input.inputName })
          audioInputs.push({
            name: input.inputName,
            kind: input.inputKind,
            muted: inputMuted,
            volume: 0,
            levels: []
          })
        } catch {
          // Some inputs don't support mute (e.g. browser sources) — skip
        }
      }

      // Video settings
      const videoSettings = await obs.call('GetVideoSettings')
      const outputSettings: OBSOutputSettings = {
        width: videoSettings.outputWidth,
        height: videoSettings.outputHeight,
        fps: videoSettings.fpsNumerator / (videoSettings.fpsDenominator || 1),
        bitrate: 0 // OBS WS v5 doesn't expose bitrate via GetVideoSettings; will stay 0 unless extended
      }

      // Stream & record status
      const streamStatus = await obs.call('GetStreamStatus')
      const recordStatus = await obs.call('GetRecordStatus')

      setState({
        status: 'connected',
        scenes,
        activeScene: currentProgramSceneName,
        audioInputs,
        outputSettings,
        isStreaming: streamStatus.outputActive,
        isRecording: recordStatus.outputActive
      })
    } catch (err) {
      console.error('[obs-service] Failed to fetch state:', err)
    }
  }

  function subscribeEvents(): void {
    obs.on('CurrentProgramSceneChanged', (event) => {
      setState({ activeScene: event.sceneName })
      // Update source active flags
      const updatedScenes = state.scenes.map((s) => ({
        ...s,
        sources: s.sources.map((src) => ({
          ...src,
          active: s.name === event.sceneName
        }))
      }))
      setState({ scenes: updatedScenes })
    })

    obs.on('StreamStateChanged', (event) => {
      setState({ isStreaming: event.outputActive })
    })

    obs.on('RecordStateChanged', (event) => {
      setState({ isRecording: event.outputActive })
    })

    obs.on('SceneItemEnableStateChanged', (event) => {
      const updatedScenes = state.scenes.map((scene) => {
        if (scene.name !== event.sceneName) return scene
        return {
          ...scene,
          sources: scene.sources.map((src) =>
            src.name === event.sceneItemId.toString()
              ? { ...src, enabled: event.sceneItemEnabled }
              : src
          )
        }
      })
      setState({ scenes: updatedScenes })
    })

    obs.on('InputMuteStateChanged', (event) => {
      const updatedInputs = state.audioInputs.map((input) =>
        input.name === event.inputName ? { ...input, muted: event.inputMuted } : input
      )
      setState({ audioInputs: updatedInputs })
    })

    obs.on('InputVolumeMeters', (event) => {
      const metersData = event.inputs as Array<{
        inputName: string
        inputLevelsMul: number[][]
      }>
      const updatedInputs = state.audioInputs.map((input) => {
        const meter = metersData.find((m) => m.inputName === input.name)
        if (!meter || !meter.inputLevelsMul || meter.inputLevelsMul.length === 0) return input
        // Each channel is [magnitude, peak, inputPeak] — take magnitude per channel
        const levels = meter.inputLevelsMul.map((ch) => ch[0] ?? 0)
        return { ...input, levels }
      })
      setState({ audioInputs: updatedInputs })
    })

    obs.on('ConnectionClosed', () => {
      setState({ status: 'disconnected' })
      if (!intentionalDisconnect) {
        scheduleReconnect()
      }
    })

    obs.on('ConnectionError', () => {
      setState({ status: 'error' })
      if (!intentionalDisconnect) {
        scheduleReconnect()
      }
    })
  }

  function scheduleReconnect(): void {
    if (reconnectTimer) return
    reconnectTimer = setTimeout(async () => {
      reconnectTimer = null
      if (intentionalDisconnect) return
      try {
        await doConnect()
      } catch {
        // doConnect handles its own error state; reconnect will be rescheduled via ConnectionClosed/Error
      }
    }, 5000)
  }

  function clearReconnect(): void {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  async function doConnect(): Promise<void> {
    setState({ status: 'connecting' })
    try {
      const url = `ws://127.0.0.1:${connectOpts.port}`
      await obs.connect(url, connectOpts.password || undefined, {
        eventSubscriptions:
          EventSubscription.All | EventSubscription.InputVolumeMeters
      })
      await fetchFullState()
    } catch (err) {
      console.error('[obs-service] Connection failed:', err)
      setState({ status: 'error' })
      if (!intentionalDisconnect) {
        scheduleReconnect()
      }
      throw err
    }
  }

  // Wire up events once — they persist across reconnects since we reuse the OBSWebSocket instance
  subscribeEvents()

  return {
    async connect(opts?: { port?: number; password?: string }): Promise<void> {
      intentionalDisconnect = false
      clearReconnect()

      const settings = getSettings()
      connectOpts = {
        port: opts?.port ?? settings.obsPort,
        password: opts?.password ?? settings.obsPassword
      }

      await doConnect()
    },

    disconnect(): void {
      intentionalDisconnect = true
      clearReconnect()
      obs.disconnect()
      setState({ ...defaultState })
    },

    getState(): OBSState {
      return state
    },

    onStateChange(callback: (state: OBSState) => void): void {
      listeners.push(callback)
    }
  }
}
