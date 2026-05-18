import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  readJSON: (filename: string) => ipcRenderer.invoke('read-json', filename),
  writeJSON: (filename: string, data: unknown) => ipcRenderer.invoke('write-json', filename, data),
  sendNotification: (title: string, body: string) =>
    ipcRenderer.invoke('send-notification', title, body),
  checkUpdate: () => ipcRenderer.invoke('check-update'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  onRequestClose: (callback: () => void) => {
    ipcRenderer.on('request-close', callback)
  },
  confirmClose: () => ipcRenderer.invoke('confirm-close')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
