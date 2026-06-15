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
      minimizeWindow: () => Promise<void>
      onRequestClose: (callback: () => void) => void
      offRequestClose: (callback: () => void) => void
      confirmClose: () => Promise<void>
      exportData: () => Promise<{ settings: unknown; tasks: unknown; history: unknown }>
      importData: (data: {
        settings: unknown
        tasks: unknown
        history: unknown
      }) => Promise<{ success: boolean; error?: string }>
      saveFile: (
        content: string,
        defaultName: string
      ) => Promise<{ success: boolean; filePath?: string; error?: string }>
      openFile: () => Promise<{ success: boolean; data?: unknown; error?: string }>
    }
  }
}
