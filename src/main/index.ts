import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  Notification,
  Tray,
  Menu,
  nativeImage,
  dialog
} from 'electron'
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

let forceClose = false
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createTray(): void {
  const trayIcon = nativeImage.createFromPath(icon).resize({ width: 16, height: 16 })
  tray = new Tray(trayIcon)
  tray.setToolTip('Pomodoro')

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出应用',
      click: () => {
        forceClose = true
        if (mainWindow) mainWindow.close()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 620,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    backgroundColor: '#1a1a2e',
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('close', (e) => {
    if (!forceClose) {
      e.preventDefault()
      mainWindow!.webContents.send('request-close')
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.on('minimize', () => {
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.hide()
      }
    }, 0)
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
      const notification = new Notification({ title, body })
      notification.on('click', () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      })
      notification.show()
    }
  })

  // IPC: check for updates from Gitee releases
  ipcMain.handle('check-update', () => {
    return new Promise((resolve) => {
      const currentVersion = app.getVersion()
      const options = {
        hostname: 'gitee.com',
        path: '/api/v5/repos/angelica-tea/pomodoro/releases?page=1&per_page=1&direction=desc',
        method: 'GET',
        headers: { 'User-Agent': 'pomodoro-app', Accept: 'application/json' },
        timeout: 10000
      }

      const req = https.request(options, (res) => {
        let body = ''
        res.on('data', (chunk: string) => (body += chunk))
        res.on('end', () => {
          try {
            const releases = JSON.parse(body) as Array<{
              tag_name: string
              name: string
              body: string
              html_url: string
            }>
            console.log('[update] release count:', releases.length)
            if (!Array.isArray(releases) || releases.length === 0) {
              console.log('[update] no releases found')
              resolve({
                hasUpdate: false,
                currentVersion,
                latestVersion: '',
                releaseUrl: '',
                releaseNotes: ''
              })
              return
            }

            const latest = releases[0]
            console.log('[update] latest tag_name:', latest.tag_name, '| name:', latest.name)
            const latestVersion = (latest.tag_name || '').replace(/^v/i, '')
            console.log('[update] current:', currentVersion, '| latest:', latestVersion)
            const hasUpdate = compareVersions(latestVersion, currentVersion) > 0
            console.log(
              '[update] hasUpdate:',
              hasUpdate,
              '(cmp result:',
              compareVersions(latestVersion, currentVersion),
              ')'
            )

            resolve({
              hasUpdate,
              currentVersion,
              latestVersion: latestVersion || latest.tag_name,
              releaseUrl: latest.html_url || `https://gitee.com/angelica-tea/pomodoro/releases`,
              releaseNotes: latest.body || ''
            })
          } catch (err) {
            console.error('[update] JSON parse error:', err)
            resolve({
              hasUpdate: false,
              currentVersion,
              latestVersion: '',
              releaseUrl: '',
              releaseNotes: ''
            })
          }
        })
      })

      req.on('error', (err) => {
        console.error('[update] network error:', err.message)
        resolve({
          hasUpdate: false,
          currentVersion,
          latestVersion: '',
          releaseUrl: '',
          releaseNotes: ''
        })
      })
      req.on('timeout', () => {
        console.error('[update] request timeout (10s)')
        req.destroy()
        resolve({
          hasUpdate: false,
          currentVersion,
          latestVersion: '',
          releaseUrl: '',
          releaseNotes: ''
        })
      })
      req.end()
    })
  })

  // IPC: confirm window close
  ipcMain.handle('confirm-close', () => {
    forceClose = true
    const win = BrowserWindow.getAllWindows()[0]
    if (win) win.close()
  })

  // IPC: open external URL
  ipcMain.handle('open-external', (_event, url: string) => {
    return shell.openExternal(url)
  })

  // IPC: minimize window → hide to tray
  ipcMain.handle('minimize-window', () => {
    if (mainWindow) mainWindow.hide()
  })

  // IPC: export data
  ipcMain.handle('export-data', () => {
    const settings = readJSON('settings.json', {})
    const tasks = readJSON('tasks.json', [])
    const history = readJSON('history.json', [])
    return { settings, tasks, history }
  })

  // IPC: import data
  ipcMain.handle(
    'import-data',
    (_event, data: { settings: unknown; tasks: unknown; history: unknown }) => {
      try {
        if (data.settings) writeJSON('settings.json', data.settings)
        if (data.tasks) writeJSON('tasks.json', data.tasks)
        if (data.history) writeJSON('history.json', data.history)
        return { success: true }
      } catch (err) {
        console.error('[import] error:', err)
        return { success: false, error: String(err) }
      }
    }
  )

  // IPC: save file dialog
  ipcMain.handle('save-file', async (_event, content: string, defaultName: string) => {
    if (!mainWindow) return { success: false }
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '导出数据',
      defaultPath: defaultName,
      filters: [{ name: 'JSON 文件', extensions: ['json'] }]
    })
    if (!result.canceled && result.filePath) {
      try {
        writeFileSync(result.filePath, content, 'utf-8')
        return { success: true, filePath: result.filePath }
      } catch (err) {
        console.error('[save-file] error:', err)
        return { success: false, error: String(err) }
      }
    }
    return { success: false }
  })

  // IPC: open file dialog
  ipcMain.handle('open-file', async () => {
    if (!mainWindow) return { success: false }
    const result = await dialog.showOpenDialog(mainWindow, {
      title: '导入数据',
      filters: [{ name: 'JSON 文件', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (!result.canceled && result.filePaths.length > 0) {
      try {
        const content = readFileSync(result.filePaths[0], 'utf-8')
        const data = JSON.parse(content)
        return { success: true, data }
      } catch (err) {
        console.error('[open-file] error:', err)
        return { success: false, error: String(err) }
      }
    }
    return { success: false }
  })

  createWindow()
  createTray()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  if (tray) {
    tray.destroy()
    tray = null
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
