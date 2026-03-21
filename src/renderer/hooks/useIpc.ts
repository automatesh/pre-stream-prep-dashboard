import { useState, useEffect, useRef } from 'react'
import type { DashboardState, OBSState, VTSState, NetworkState } from '../../types/index'

export interface IpcState {
  obs: OBSState
  vts: VTSState
  network: NetworkState
  audioLevels: { name: string; levels: number[] }[]
}

const defaultOBS: OBSState = {
  status: 'disconnected',
  scenes: [],
  activeScene: null,
  audioInputs: [],
  outputSettings: null,
  isStreaming: false,
  isRecording: false
}

const defaultVTS: VTSState = {
  status: 'disconnected',
  currentModel: null,
  faceTracking: { active: false, faceDetected: false, parameterCount: 0 }
}

const defaultNetwork: NetworkState = {
  status: 'disconnected',
  uploadSpeedMbps: null,
  lastChecked: null
}

export function useIpc(): IpcState {
  const [obs, setObs] = useState<OBSState>(defaultOBS)
  const [vts, setVts] = useState<VTSState>(defaultVTS)
  const [network, setNetwork] = useState<NetworkState>(defaultNetwork)
  const [audioLevels, setAudioLevels] = useState<{ name: string; levels: number[] }[]>([])
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    window.api.getDashboardState().then((state: DashboardState) => {
      setObs(state.obs)
      setVts(state.vts)
      setNetwork(state.network)
    })

    const unsubObs = window.api.onOBSStateUpdate((state: OBSState) => setObs(state))
    const unsubVts = window.api.onVTSStateUpdate((state: VTSState) => setVts(state))
    const unsubNet = window.api.onNetworkStateUpdate((state: NetworkState) => setNetwork(state))
    const unsubAudio = window.api.onAudioLevels((levels) => setAudioLevels(levels))

    return () => {
      unsubObs()
      unsubVts()
      unsubNet()
      unsubAudio()
    }
  }, [])

  return { obs, vts, network, audioLevels }
}
