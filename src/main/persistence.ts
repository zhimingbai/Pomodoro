import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

function dataDir(): string {
  const dir = join(app.getPath('userData'))
  mkdirSync(dir, { recursive: true })
  return dir
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
