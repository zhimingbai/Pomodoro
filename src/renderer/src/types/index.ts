export type TimerPhase = 'focus' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface SessionRecord {
  id: string
  date: string
  phase: TimerPhase
  startTime: string
  endTime: string
  durationSeconds: number
  taskId: string | null
  taskText: string | null
}

export interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export interface AppSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  autoStartFocus: boolean
  autoStartBreak: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartFocus: false,
  autoStartBreak: false
}
