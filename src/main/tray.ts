import { Tray, Menu, nativeImage, BrowserWindow } from 'electron'
import type { HealthLevel } from '../types/index'

export interface TrayManager {
  updateHealth(level: HealthLevel): void
  destroy(): void
}

const ICON_SIZE = 16

function createColorIcon(color: string): Electron.NativeImage {
  // Create a simple colored circle as a data URL, then convert to nativeImage
  const canvas = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}">
      <circle cx="${ICON_SIZE / 2}" cy="${ICON_SIZE / 2}" r="${ICON_SIZE / 2 - 1}" fill="${color}" />
    </svg>
  `.trim()

  const base64 = Buffer.from(canvas).toString('base64')
  return nativeImage.createFromDataURL(`data:image/svg+xml;base64,${base64}`)
}

const HEALTH_COLORS: Record<HealthLevel, string> = {
  green: '#10b981',  // emerald-500
  yellow: '#f59e0b', // amber-500
  red: '#f43f5e'     // rose-500
}

const HEALTH_TOOLTIPS: Record<HealthLevel, string> = {
  green: 'Stream Prep — All Clear',
  yellow: 'Stream Prep — Warnings',
  red: 'Stream Prep — Not Ready'
}

export function createTrayManager(): TrayManager {
  let tray: Tray | null = null
  let currentHealth: HealthLevel = 'red'

  function ensureTray(): Tray {
    if (!tray) {
      const icon = createColorIcon(HEALTH_COLORS[currentHealth])
      tray = new Tray(icon)
      tray.setToolTip(HEALTH_TOOLTIPS[currentHealth])

      tray.on('click', () => {
        const win = BrowserWindow.getAllWindows()[0]
        if (win) {
          if (win.isMinimized()) win.restore()
          win.focus()
        }
      })

      updateContextMenu()
    }
    return tray
  }

  function updateContextMenu(): void {
    if (!tray) return
    tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: HEALTH_TOOLTIPS[currentHealth],
          enabled: false
        },
        { type: 'separator' },
        {
          label: 'Show Dashboard',
          click: () => {
            const win = BrowserWindow.getAllWindows()[0]
            if (win) {
              if (win.isMinimized()) win.restore()
              win.show()
              win.focus()
            }
          }
        },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
      ])
    )
  }

  return {
    updateHealth(level: HealthLevel): void {
      currentHealth = level
      const t = ensureTray()
      t.setImage(createColorIcon(HEALTH_COLORS[level]))
      t.setToolTip(HEALTH_TOOLTIPS[level])
      updateContextMenu()
    },

    destroy(): void {
      if (tray) {
        tray.destroy()
        tray = null
      }
    }
  }
}
