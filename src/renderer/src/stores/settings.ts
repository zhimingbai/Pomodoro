import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })
  const loaded = ref(false)

  async function loadSettings(): Promise<void> {
    try {
      const data = await window.api.readJSON('settings.json')
      if (data) {
        settings.value = { ...DEFAULT_SETTINGS, ...(data as AppSettings) }
        console.log('[settings] loaded via IPC:', JSON.stringify(settings.value))
        loaded.value = true
        return
      }
    } catch (err) {
      console.error('[settings] IPC load error:', err)
    }

    // Fallback: localStorage
    try {
      const raw = localStorage.getItem('settings')
      if (raw) {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
        console.log('[settings] loaded via localStorage:', JSON.stringify(settings.value))
      }
    } catch (err) {
      console.error('[settings] localStorage load error:', err)
    } finally {
      loaded.value = true
    }
  }

  async function saveSettings(): Promise<void> {
    try {
      await window.api.writeJSON('settings.json', JSON.parse(JSON.stringify(settings.value)))
      console.log('[settings] IPC saved')
    } catch (err) {
      console.error('[settings] IPC save error:', err)
    }
  }

  async function updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> {
    settings.value[key] = value
    await saveSettings()
  }

  async function resetDefaults(): Promise<void> {
    settings.value = { ...DEFAULT_SETTINGS }
    await saveSettings()
  }

  const focusDurationMs = computed(() => settings.value.focusDuration * 60)
  const shortBreakDurationMs = computed(() => settings.value.shortBreakDuration * 60)
  const longBreakDurationMs = computed(() => settings.value.longBreakDuration * 60)

  function getPhaseDurationSeconds(phase: string): number {
    switch (phase) {
      case 'focus':
        return focusDurationMs.value
      case 'shortBreak':
        return shortBreakDurationMs.value
      case 'longBreak':
        return longBreakDurationMs.value
      default:
        return focusDurationMs.value
    }
  }

  return {
    settings,
    loaded,
    loadSettings,
    saveSettings,
    updateSetting,
    resetDefaults,
    focusDurationMs,
    shortBreakDurationMs,
    longBreakDurationMs,
    getPhaseDurationSeconds
  }
})
