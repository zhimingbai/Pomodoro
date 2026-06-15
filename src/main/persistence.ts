import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

let _dataDir: string | null = null

function dataDir(): string {
  if (_dataDir) return _dataDir
  _dataDir = join(app.getPath('userData'))
  console.log('[persist] dataDir:', _dataDir)
  mkdirSync(_dataDir, { recursive: true })
  return _dataDir
}

export function readJSON<T>(filename: string, fallback: T): T {
  const filePath = join(dataDir(), filename)
  try {
    const content = readFileSync(filePath, 'utf-8')
    console.log('[persist] read OK:', filePath, `(${content.length} bytes)`)
    return JSON.parse(content) as T
  } catch {
    console.log('[persist] read MISS:', filePath)
    return fallback
  }
}

export function writeJSON<T>(filename: string, data: T): void {
  const filePath = join(dataDir(), filename)
  const json = JSON.stringify(data, null, 2)
  console.log('[persist] write:', filePath, `(${json.length} bytes)`)
  writeFileSync(filePath, json, 'utf-8')
  console.log('[persist] write OK')
}
