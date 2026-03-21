import { ipcMain } from 'electron'
import { getSettings, saveSettings, getChecklist, saveChecklist, getRunsheet, saveRunsheet } from './store'
import type { OBSService } from './obs-service'
import type { VTSService } from './vts-service'
import type { NetCheck } from './net-check'
import type { DashboardState } from '../types/index'

export function registerIpcHandlers(
  obsService: OBSService,
  vtsService: VTSService,
  netCheck: NetCheck
): void {
  // Store handlers
  ipcMain.handle('store:get-settings', () => getSettings())
  ipcMain.handle('store:save-settings', (_e, settings) => saveSettings(settings))
  ipcMain.handle('store:get-checklist', () => getChecklist())
  ipcMain.handle('store:save-checklist', (_e, items) => saveChecklist(items))
  ipcMain.handle('store:get-runsheet', () => getRunsheet())
  ipcMain.handle('store:save-runsheet', (_e, segments) => saveRunsheet(segments))

  // OBS handlers
  ipcMain.handle('obs:connect', () => obsService.connect())
  ipcMain.handle('obs:disconnect', () => obsService.disconnect())

  // VTS handlers
  ipcMain.handle('vts:connect', () => vtsService.connect())
  ipcMain.handle('vts:disconnect', () => vtsService.disconnect())

  // Network handlers
  ipcMain.handle('network:check', () => netCheck.check())

  // Aggregate state
  ipcMain.handle('dashboard:get-state', (): DashboardState => ({
    obs: obsService.getState(),
    vts: vtsService.getState(),
    network: netCheck.getState(),
    checklist: getChecklist(),
    runsheet: getRunsheet(),
    overallHealth: computeHealth(obsService, vtsService, netCheck)
  }))
}

function computeHealth(obs: OBSService, vts: VTSService, net: NetCheck) {
  const obsOk = obs.getState().status === 'connected'
  const vtsOk = vts.getState().status === 'connected'
  const netOk = net.getState().status === 'connected'
  const vtsTracking = vts.getState().faceTracking.faceDetected
  const audioOk = obs.getState().audioInputs.some(a => !a.muted)

  if (obsOk && vtsOk && netOk && vtsTracking && audioOk) return 'green' as const
  if (!obsOk || !vtsOk) return 'red' as const
  return 'yellow' as const
}
