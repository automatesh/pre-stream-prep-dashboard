import { app } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { AppSettings, ChecklistItem, RunsheetSegment } from '../types/index'
import { DEFAULT_SETTINGS } from '../types/index'

const dataDir = app.getPath('userData')

function ensureDir(): void {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
}

function readJson<T>(filename: string, fallback: T): T {
  const filepath = join(dataDir, filename)
  if (!existsSync(filepath)) return fallback
  try {
    return JSON.parse(readFileSync(filepath, 'utf-8'))
  } catch {
    return fallback
  }
}

function writeJson<T>(filename: string, data: T): void {
  ensureDir()
  writeFileSync(join(dataDir, filename), JSON.stringify(data, null, 2), 'utf-8')
}

export function getSettings(): AppSettings {
  return readJson('settings.json', DEFAULT_SETTINGS)
}

export function saveSettings(settings: AppSettings): void {
  writeJson('settings.json', settings)
}

export function getChecklist(): ChecklistItem[] {
  return readJson<ChecklistItem[]>('checklist.json', [])
}

export function saveChecklist(items: ChecklistItem[]): void {
  writeJson('checklist.json', items)
}

export function getRunsheet(): RunsheetSegment[] {
  return readJson<RunsheetSegment[]>('runsheet.json', [])
}

export function saveRunsheet(segments: RunsheetSegment[]): void {
  writeJson('runsheet.json', segments)
}

export function getVtsToken(): string | null {
  return readJson<{ token: string } | null>('vts-token.json', null)?.token ?? null
}

export function saveVtsToken(token: string): void {
  writeJson('vts-token.json', { token })
}
