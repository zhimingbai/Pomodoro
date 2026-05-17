import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      readJSON: (filename: string) => Promise<unknown>
      writeJSON: (filename: string, data: unknown) => Promise<void>
      sendNotification: (title: string, body: string) => Promise<void>
      checkUpdate: () => Promise<import('../renderer/src/types').UpdateInfo>
      openExternal: (url: string) => Promise<void>
    }
  }
}
