import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SessionRecord } from '../types'
import {
  getDaysAgoLocalDateKey,
  getStartOfWeekLocalDateKey,
  getTodayLocalDateKey
} from '../utils/date'

export const useHistoryStore = defineStore('history', () => {
  const sessions = ref<SessionRecord[]>([])
  const loaded = ref(false)

  async function loadHistory(): Promise<void> {
    try {
      const data = await window.api.readJSON('history.json')
      if (data) {
        sessions.value = data as SessionRecord[]
        console.log('[history] loaded via IPC:', sessions.value.length, 'sessions')
        loaded.value = true
        return
      }
    } catch (err) {
      console.error('[history] IPC load error:', err)
    }

    // Fallback: localStorage
    try {
      const raw = localStorage.getItem('history')
      if (raw) {
        sessions.value = JSON.parse(raw)
        console.log('[history] loaded via localStorage:', sessions.value.length, 'sessions')
      }
    } catch (err) {
      console.error('[history] localStorage load error:', err)
    } finally {
      loaded.value = true
    }
  }

  async function saveHistory(): Promise<void> {
    try {
      await window.api.writeJSON('history.json', JSON.parse(JSON.stringify(sessions.value)))
      console.log('[history] IPC saved:', sessions.value.length, 'sessions')
    } catch (err) {
      console.error('[history] IPC save error:', err)
    }
  }

  async function addSession(session: SessionRecord): Promise<void> {
    sessions.value.unshift(session)
    await saveHistory()
  }

  async function clearHistory(): Promise<void> {
    sessions.value = []
    await saveHistory()
  }

  const todayCount = computed(() => {
    const today = getTodayLocalDateKey()
    return sessions.value.filter((s) => s.date === today).length
  })

  const weekCount = computed(() => {
    const startStr = getStartOfWeekLocalDateKey()
    return sessions.value.filter((s) => s.date >= startStr).length
  })

  const totalCount = computed(() => sessions.value.length)

  const currentStreak = computed(() => {
    if (sessions.value.length === 0) return 0
    const dates = new Set(sessions.value.map((s) => s.date))
    const today = getTodayLocalDateKey()
    if (!dates.has(today)) return 0
    let streak = 1
    for (let offset = 1; offset <= 3650; offset++) {
      const dStr = getDaysAgoLocalDateKey(offset)
      if (dates.has(dStr)) {
        streak++
      } else {
        break
      }
    }
    return streak
  })

  const todaySessions = computed(() => {
    const today = getTodayLocalDateKey()
    return sessions.value.filter((s) => s.date === today)
  })

  return {
    sessions,
    loaded,
    loadHistory,
    saveHistory,
    addSession,
    clearHistory,
    todayCount,
    weekCount,
    totalCount,
    currentStreak,
    todaySessions
  }
})
