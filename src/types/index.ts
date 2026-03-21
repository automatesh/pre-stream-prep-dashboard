// Connection status for each service
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// OBS types
export interface OBSState {
  status: ConnectionStatus
  scenes: OBSScene[]
  activeScene: string | null
  audioInputs: OBSAudioInput[]
  outputSettings: OBSOutputSettings | null
  isStreaming: boolean
  isRecording: boolean
}

export interface OBSScene {
  name: string
  index: number
  sources: OBSSource[]
}

export interface OBSSource {
  name: string
  type: string
  enabled: boolean
  active: boolean
}

export interface OBSAudioInput {
  name: string
  kind: string
  muted: boolean
  volume: number // dB
  levels: number[] // live meter levels 0-1
}

export interface OBSOutputSettings {
  width: number
  height: number
  fps: number
  bitrate: number
}

// VTube Studio types
export interface VTSState {
  status: ConnectionStatus
  currentModel: VTSModel | null
  faceTracking: VTSFaceTracking
}

export interface VTSModel {
  id: string
  name: string
  loaded: boolean
}

export interface VTSFaceTracking {
  active: boolean
  faceDetected: boolean
  parameterCount: number
}

// Network types
export interface NetworkState {
  status: ConnectionStatus
  uploadSpeedMbps: number | null
  lastChecked: number | null
}

// Checklist types
export interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

// Runsheet types
export interface RunsheetSegment {
  id: string
  title: string
  durationMinutes: number
  order: number
}

// Aggregate health
export type HealthLevel = 'green' | 'yellow' | 'red'

// Full dashboard state
export interface DashboardState {
  obs: OBSState
  vts: VTSState
  network: NetworkState
  checklist: ChecklistItem[]
  runsheet: RunsheetSegment[]
  overallHealth: HealthLevel
}

// Settings persisted to JSON
export interface AppSettings {
  obsPort: number
  obsPassword: string
  vtsPort: number
  networkCheckIntervalMs: number
}

export const DEFAULT_SETTINGS: AppSettings = {
  obsPort: 4455,
  obsPassword: '',
  vtsPort: 8001,
  networkCheckIntervalMs: 30000
}
