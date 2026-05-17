import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

let _dataDir: string | null = null

function dataDir(): string {
  if (_dataDir) return _dataDir
  _dataDir = join(app.getPath('userData'))
  mkdirSync(_dataDir, { recursive: true })
  return _dataDir
}

export function readJSON<T>(filename: string, fallback: T): T {
  try {
    const content = readFileSync(join(dataDir(), filename), 'utf-8')
    return JSON.parse(content) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(filename: string, data: T): void {
  writeFileSync(join(dataDir(), filename), JSON.stringify(data, null, 2), 'utf-8')
}
