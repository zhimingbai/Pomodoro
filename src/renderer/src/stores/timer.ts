import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { TimerPhase, TimerStatus } from '../types'
import { useSettingsStore } from './settings'
import { useHistoryStore } from './history'
import { formatTime } from '../utils/format'
import { formatLocalDateKey } from '../utils/date'

export const useTimerStore = defineStore('timer', () => {
  const phase = ref<TimerPhase>('focus')
  const status = ref<TimerStatus>('idle')
  const endTimestamp = ref<number | null>(null)
  const pausedRemaining = ref<number | null>(null)
  const sessionsCompletedInCycle = ref(0)
  const activeTaskId = ref<string | null>(null)
  const activeTaskText = ref<string | null>(null)

  let timerHandle: ReturnType<typeof setInterval> | null = null
  let sessionStartTimestamp: number | null = null

  const settingsStore = useSettingsStore()

  // Wait for settings to load before computing phase duration
  const phaseDurationSeconds = computed(() => {
    if (!settingsStore.loaded) return 25 * 60
    return settingsStore.getPhaseDurationSeconds(phase.value)
  })

  const remainingSeconds = ref(phaseDurationSeconds.value)

  // Sync remainingSeconds when settings finish loading or phase changes
  watch([() => settingsStore.loaded, phase], ([isLoaded]) => {
    if (isLoaded && status.value === 'idle') {
      remainingSeconds.value = phaseDurationSeconds.value
    }
  })

  // Sync remainingSeconds when duration changes while idle
  watch([phaseDurationSeconds, status], ([duration, currentStatus]) => {
    if (currentStatus === 'idle') {
      remainingSeconds.value = duration
    }
  })

  const isRunning = computed(() => status.value === 'running')
  const isPaused = computed(() => status.value === 'paused')
  const isIdle = computed(() => status.value === 'idle')
  const displayTime = computed(() => formatTime(remainingSeconds.value))
  const progress = computed(() => {
    const total = phaseDurationSeconds.value
    if (total <= 0) return 0
    return Math.max(0, Math.min(1, 1 - remainingSeconds.value / total))
  })

  const phaseLabel = computed(() => {
    switch (phase.value) {
      case 'focus':
        return '专注时间'
      case 'shortBreak':
        return '短休'
      case 'longBreak':
        return '长休'
      default:
        return '专注时间'
    }
  })

  function tick(): void {
    if (status.value !== 'running' || endTimestamp.value === null) return

    const now = Date.now()
    const remaining = Math.max(0, Math.round((endTimestamp.value - now) / 1000))
    remainingSeconds.value = remaining

    if (remaining <= 0) {
      completeSession()
    }
  }

  function startTimer(): void {
    if (status.value === 'running') return

    if (status.value === 'idle') {
      remainingSeconds.value = phaseDurationSeconds.value
      endTimestamp.value = Date.now() + remainingSeconds.value * 1000
      sessionStartTimestamp = Date.now()
    } else if (status.value === 'paused' && pausedRemaining.value !== null) {
      remainingSeconds.value = pausedRemaining.value
      endTimestamp.value = Date.now() + pausedRemaining.value * 1000
      pausedRemaining.value = null
    }

    status.value = 'running'
    if (timerHandle) clearInterval(timerHandle)
    timerHandle = setInterval(tick, 200)
  }

  function pauseTimer(): void {
    if (status.value !== 'running') return
    pausedRemaining.value = remainingSeconds.value
    if (timerHandle) {
      clearInterval(timerHandle)
      timerHandle = null
    }
    status.value = 'paused'
    endTimestamp.value = null
  }

  function resetTimer(): void {
    if (timerHandle) {
      clearInterval(timerHandle)
      timerHandle = null
    }
    status.value = 'idle'
    endTimestamp.value = null
    pausedRemaining.value = null
    remainingSeconds.value = phaseDurationSeconds.value
  }

  function resetCycle(): void {
    if (timerHandle) {
      clearInterval(timerHandle)
      timerHandle = null
    }
    phase.value = 'focus'
    status.value = 'idle'
    endTimestamp.value = null
    pausedRemaining.value = null
    sessionsCompletedInCycle.value = 0
    activeTaskId.value = null
    activeTaskText.value = null
    remainingSeconds.value = phaseDurationSeconds.value
  }

  function skipPhase(): void {
    if (timerHandle) {
      clearInterval(timerHandle)
      timerHandle = null
    }
    // Clear active task when skipping a focus phase
    if (phase.value === 'focus') {
      activeTaskId.value = null
      activeTaskText.value = null
    }
    status.value = 'idle'
    endTimestamp.value = null
    pausedRemaining.value = null
    advancePhase()
    remainingSeconds.value = phaseDurationSeconds.value
  }

  function advancePhase(): void {
    if (phase.value === 'focus') {
      sessionsCompletedInCycle.value++
      if (sessionsCompletedInCycle.value >= settingsStore.settings.longBreakInterval) {
        phase.value = 'longBreak'
        sessionsCompletedInCycle.value = 0
      } else {
        phase.value = 'shortBreak'
      }
    } else {
      phase.value = 'focus'
    }
  }

  function completeSession(): void {
    if (timerHandle) {
      clearInterval(timerHandle)
      timerHandle = null
    }
    status.value = 'idle'
    remainingSeconds.value = 0
    endTimestamp.value = null

    // Record to history
    const now = new Date()
    const historyStore = useHistoryStore()
    historyStore.addSession({
      id: crypto.randomUUID(),
      date: formatLocalDateKey(now),
      phase: phase.value,
      startTime: new Date(sessionStartTimestamp ?? now.getTime()).toISOString(),
      endTime: now.toISOString(),
      durationSeconds: phaseDurationSeconds.value,
      taskId: activeTaskId.value,
      taskText: activeTaskText.value
    })

    // Send notification
    const { title, body } =
      phase.value === 'focus'
        ? { title: '专注完成！', body: '休息一下吧，做得不错！' }
        : { title: '休息结束！', body: '继续专注，加油！' }

    window.api.sendNotification(title, body)

    // Clear active task after focus session
    if (phase.value === 'focus') {
      activeTaskId.value = null
      activeTaskText.value = null
    }

    advancePhase()
    remainingSeconds.value = phaseDurationSeconds.value

    // Auto-start next phase if configured
    const s = settingsStore.settings
    const shouldAutoStart =
      (phase.value === 'focus' && s.autoStartFocus) || (phase.value !== 'focus' && s.autoStartBreak)
    if (shouldAutoStart) {
      startTimer()
    }
  }

  function setActiveTask(taskId: string | null, taskText: string | null): void {
    activeTaskId.value = taskId
    activeTaskText.value = taskText
  }

  function cleanup(): void {
    if (timerHandle) {
      clearInterval(timerHandle)
      timerHandle = null
    }
  }

  return {
    phase,
    status,
    remainingSeconds,
    sessionsCompletedInCycle,
    activeTaskId,
    activeTaskText,
    isRunning,
    isPaused,
    isIdle,
    displayTime,
    progress,
    phaseLabel,
    phaseDurationSeconds,
    startTimer,
    pauseTimer,
    resetTimer,
    resetCycle,
    skipPhase,
    completeSession,
    advancePhase,
    setActiveTask,
    cleanup
  }
})
