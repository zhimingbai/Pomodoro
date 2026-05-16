import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SessionRecord } from '../types'

export const useHistoryStore = defineStore('history', () => {
  const sessions = ref<SessionRecord[]>([])
  const loaded = ref(false)

  async function loadHistory(): Promise<void> {
    const data = await window.api.readJSON('history.json')
    if (data) {
      sessions.value = data as SessionRecord[]
    }
    loaded.value = true
  }

  async function saveHistory(): Promise<void> {
    await window.api.writeJSON('history.json', sessions.value)
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
    const today = new Date().toISOString().split('T')[0]
    return sessions.value.filter((s) => s.date === today).length
  })

  const weekCount = computed(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startStr = startOfWeek.toISOString().split('T')[0]
    return sessions.value.filter((s) => s.date >= startStr).length
  })

  const totalCount = computed(() => sessions.value.length)

  const currentStreak = computed(() => {
    if (sessions.value.length === 0) return 0
    const dates = new Set(sessions.value.map((s) => s.date))
    const today = new Date().toISOString().split('T')[0]
    if (!dates.has(today)) return 0
    let streak = 1
    const d = new Date()
    while (true) {
      d.setDate(d.getDate() - 1)
      const dStr = d.toISOString().split('T')[0]
      if (dates.has(dStr)) {
        streak++
      } else {
        break
      }
    }
    return streak
  })

  const todaySessions = computed(() => {
    const today = new Date().toISOString().split('T')[0]
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
