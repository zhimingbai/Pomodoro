import { app, shell, BrowserWindow, ipcMain, Notification } from 'electron'
import { join } from 'path'
import { writeFileSync, readFileSync, unlinkSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { readJSON, writeJSON } from './persistence'

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
