import { app, shell, BrowserWindow, ipcMain, Notification } from 'electron'
import { join } from 'path'
import { writeFileSync, readFileSync, unlinkSync } from 'fs'
import https from 'https'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { readJSON, writeJSON } from './persistence'

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1
    if ((pa[i] || 0) < (pb[i] || 0)) return -1
  }
  return 0
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 420,
    height: 620,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Ensure app name is set before userData path is resolved (may default to "Electron" in dev)
app.setName('pomodoro')

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.pomodoro.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Sanity check: verify persistence works on startup
  try {
    const testPath = join(app.getPath('userData'), '.write-test')
    writeFileSync(testPath, 'ok', 'utf-8')
    readFileSync(testPath, 'utf-8')
    unlinkSync(testPath)
    console.log('[persist] startup write/read test: OK')
  } catch (err) {
    console.error('[persist] startup write/read test FAILED:', err)
  }

  // IPC: persistence
  ipcMain.handle('read-json', (_event, filename: string) => {
    return readJSON(filename, null)
  })

  ipcMain.handle('write-json', (_event, filename: string, data: unknown) => {
    writeJSON(filename, data)
  })

  // IPC: notification
  ipcMain.handle('send-notification', (_event, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  })

  // IPC: check for updates from Gitee releases
  ipcMain.handle('check-update', () => {
    return new Promise((resolve) => {
      const currentVersion = app.getVersion()
      const options = {
        hostname: 'gitee.com',
        path: '/api/v5/repos/angelica-tea/pomodoro/releases?page=1&per_page=1',
        method: 'GET',
        headers: { 'User-Agent': 'pomodoro-app', 'Accept': 'application/json' },
        timeout: 10000
      }

      const req = https.request(options, (res) => {
        let body = ''
        res.on('data', (chunk: string) => (body += chunk))
        res.on('end', () => {
          try {
            const releases = JSON.parse(body) as Array<{ tag_name: string; name: string; body: string; html_url: string }>
            if (!Array.isArray(releases) || releases.length === 0) {
              resolve({ hasUpdate: false, currentVersion, latestVersion: '', releaseUrl: '', releaseNotes: '' })
              return
            }

            const latest = releases[0]
            const latestVersion = (latest.tag_name || '').replace(/^v/i, '')
            const hasUpdate = compareVersions(latestVersion, currentVersion) > 0

            resolve({
              hasUpdate,
              currentVersion,
              latestVersion: latestVersion || latest.tag_name,
              releaseUrl: latest.html_url || `https://gitee.com/angelica-tea/pomodoro/releases`,
              releaseNotes: latest.body || ''
            })
          } catch {
            resolve({ hasUpdate: false, currentVersion, latestVersion: '', releaseUrl: '', releaseNotes: '' })
          }
        })
      })

      req.on('error', () => {
        resolve({ hasUpdate: false, currentVersion, latestVersion: '', releaseUrl: '', releaseNotes: '' })
      })
      req.on('timeout', () => {
        req.destroy()
        resolve({ hasUpdate: false, currentVersion, latestVersion: '', releaseUrl: '', releaseNotes: '' })
      })
      req.end()
    })
  })

  // IPC: open external URL
  ipcMain.handle('open-external', (_event, url: string) => {
    return shell.openExternal(url)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
