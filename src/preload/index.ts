import { contextBridge, ipcRenderer } from 'electron'
import type { OBSState, VTSState, NetworkState, ChecklistItem, RunsheetSegment, AppSettings, DashboardState } from '../types/index'

const api = {
  // Store
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('store:get-settings'),
  saveSettings: (settings: AppSettings): Promise<void> => ipcRenderer.invoke('store:save-settings', settings),
  getChecklist: (): Promise<ChecklistItem[]> => ipcRenderer.invoke('store:get-checklist'),
  saveChecklist: (items: ChecklistItem[]): Promise<void> => ipcRenderer.invoke('store:save-checklist', items),
  getRunsheet: (): Promise<RunsheetSegment[]> => ipcRenderer.invoke('store:get-runsheet'),
  saveRunsheet: (segments: RunsheetSegment[]): Promise<void> => ipcRenderer.invoke('store:save-runsheet', segments),

  // OBS
  obsConnect: (): Promise<void> => ipcRenderer.invoke('obs:connect'),
  obsDisconnect: (): Promise<void> => ipcRenderer.invoke('obs:disconnect'),

  // VTS
  vtsConnect: (): Promise<void> => ipcRenderer.invoke('vts:connect'),
  vtsDisconnect: (): Promise<void> => ipcRenderer.invoke('vts:disconnect'),

  // Network
  networkCheck: (): Promise<void> => ipcRenderer.invoke('network:check'),

  // Dashboard
  getDashboardState: (): Promise<DashboardState> => ipcRenderer.invoke('dashboard:get-state'),

  // Event subscriptions (main → renderer)
  onOBSStateUpdate: (callback: (state: OBSState) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: OBSState) => callback(state)
    ipcRenderer.on('obs:state-update', listener)
    return () => ipcRenderer.removeListener('obs:state-update', listener)
  },
  onVTSStateUpdate: (callback: (state: VTSState) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: VTSState) => callback(state)
    ipcRenderer.on('vts:state-update', listener)
    return () => ipcRenderer.removeListener('vts:state-update', listener)
  },
  onNetworkStateUpdate: (callback: (state: NetworkState) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: NetworkState) => callback(state)
    ipcRenderer.on('network:state-update', listener)
    return () => ipcRenderer.removeListener('network:state-update', listener)
  },
  onAudioLevels: (callback: (levels: { name: string; levels: number[] }[]) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, levels: { name: string; levels: number[] }[]) => callback(levels)
    ipcRenderer.on('obs:audio-levels', listener)
    return () => ipcRenderer.removeListener('obs:audio-levels', listener)
  }
} as const

export type ElectronAPI = typeof api

contextBridge.exposeInMainWorld('api', api)
