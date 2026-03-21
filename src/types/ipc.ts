import type {
  OBSState,
  VTSState,
  NetworkState,
  ChecklistItem,
  RunsheetSegment,
  AppSettings,
  DashboardState
} from './index'

// Channels: renderer → main (invoke)
export interface IpcInvokeChannels {
  'store:get-settings': () => AppSettings
  'store:save-settings': (settings: AppSettings) => void
  'store:get-checklist': () => ChecklistItem[]
  'store:save-checklist': (items: ChecklistItem[]) => void
  'store:get-runsheet': () => RunsheetSegment[]
  'store:save-runsheet': (segments: RunsheetSegment[]) => void
  'obs:connect': () => void
  'obs:disconnect': () => void
  'vts:connect': () => void
  'vts:disconnect': () => void
  'network:check': () => void
  'dashboard:get-state': () => DashboardState
}

// Channels: main → renderer (send/on)
export interface IpcEventChannels {
  'obs:state-update': OBSState
  'vts:state-update': VTSState
  'network:state-update': NetworkState
  'obs:audio-levels': { name: string; levels: number[] }[]
}

// Channel name literals for type safety
export type IpcInvokeChannel = keyof IpcInvokeChannels
export type IpcEventChannel = keyof IpcEventChannels
