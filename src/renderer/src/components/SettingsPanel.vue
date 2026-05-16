<script setup lang="ts">
import { useSettingsStore } from '../stores/settings'
import { useTimerStore } from '../stores/timer'
import type { AppSettings } from '../types'

const settings = useSettingsStore()
const timer = useTimerStore()

const fields: { key: keyof AppSettings; label: string; min: number; max: number }[] = [
  { key: 'focusDuration', label: '专注时长（分钟）', min: 1, max: 120 },
  { key: 'shortBreakDuration', label: '短休时长（分钟）', min: 1, max: 30 },
  { key: 'longBreakDuration', label: '长休时长（分钟）', min: 1, max: 60 },
  { key: 'longBreakInterval', label: '几轮后进入长休', min: 1, max: 10 }
]

function handleChange(key: keyof AppSettings, raw: string): void {
  let val = parseInt(raw, 10)
  const field = fields.find((f) => f.key === key)!
  if (isNaN(val) || val < field.min) val = field.min
  if (val > field.max) val = field.max
  settings.updateSetting(key, val)
}
</script>

<template>
  <div class="settings-panel">
    <div v-if="timer.isRunning || timer.isPaused" class="warning">
      请先停止计时再修改设置。
    </div>

    <div class="settings-fields">
      <div v-for="field in fields" :key="field.key" class="field">
        <label :for="field.key">{{ field.label }}</label>
        <input
          :id="field.key"
          type="number"
          :min="field.min"
          :max="field.max"
          :value="settings.settings[field.key]"
          :disabled="timer.isRunning || timer.isPaused"
          @input="handleChange(field.key, ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <button class="btn-reset" @click="settings.resetDefaults()">
      恢复默认设置
    </button>
  </div>
</template>

<style scoped>
.settings-panel {
  padding: 0;
}
.warning {
  padding: 10px 14px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  font-size: 13px;
  text-align: center;
}
.settings-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}
.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.field label {
  font-size: 14px;
  opacity: 0.8;
}
.field input {
  width: 80px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 14px;
  text-align: center;
  outline: none;
}
.field input:focus {
  background: rgba(255, 255, 255, 0.12);
}
.field input:disabled {
  opacity: 0.4;
}
.btn-reset {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-reset:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
