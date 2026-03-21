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

  // Push state updates to renderer
  obsService.onStateChange((state) => {
    win.webContents.send('obs:state-update', state)
  })
  vtsService.onStateChange((state) => {
    win.webContents.send('vts:state-update', state)
  })
  netCheck.onStateChange((state) => {
    win.webContents.send('network:state-update', state)
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
