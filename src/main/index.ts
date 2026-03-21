import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { createOBSService } from './obs-service'
import { createVTSService } from './vts-service'
import { createNetCheck } from './net-check'
import { createTrayManager } from './tray'
import { registerIpcHandlers } from './ipc-handlers'
import { getSettings } from './store'

const obsService = createOBSService()
const vtsService = createVTSService()
const netCheck = createNetCheck()
const trayManager = createTrayManager()

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    show: false,
    backgroundColor: '#0f0f0f',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Push state updates to renderer + update tray health
  const updateTrayHealth = () => {
    const obsOk = obsService.getState().status === 'connected'
    const vtsOk = vtsService.getState().status === 'connected'
    const netOk = netCheck.getState().status === 'connected'
    const tracking = vtsService.getState().faceTracking.faceDetected
    const audioOk = obsService.getState().audioInputs.some(a => !a.muted)

    if (obsOk && vtsOk && netOk && tracking && audioOk) trayManager.updateHealth('green')
    else if (!obsOk || !vtsOk) trayManager.updateHealth('red')
    else trayManager.updateHealth('yellow')
  }

  obsService.onStateChange((state) => {
    win.webContents.send('obs:state-update', state)
    updateTrayHealth()
  })
  vtsService.onStateChange((state) => {
    win.webContents.send('vts:state-update', state)
    updateTrayHealth()
  })
  netCheck.onStateChange((state) => {
    win.webContents.send('network:state-update', state)
    updateTrayHealth()
  })

  return win
}

app.whenReady().then(() => {
  registerIpcHandlers(obsService, vtsService, netCheck)
  createWindow()

  // Auto-connect on launch
  const settings = getSettings()
  obsService.connect()
  vtsService.connect()
  netCheck.check()
  netCheck.startPeriodicCheck(settings.networkCheckIntervalMs)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  netCheck.stopPeriodicCheck()
  obsService.disconnect()
  vtsService.disconnect()
  trayManager.destroy()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
