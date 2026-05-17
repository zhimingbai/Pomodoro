<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useTimerStore } from '../stores/timer'
import { useTaskStore } from '../stores/tasks'
import { useHistoryStore } from '../stores/history'
import type { AppSettings } from '../types'
import ConfirmDialog from './ConfirmDialog.vue'

const settings = useSettingsStore()
const timer = useTimerStore()
const taskStore = useTaskStore()
const historyStore = useHistoryStore()

const showResetConfirm = ref(false)
const showClearConfirm = ref(false)

const locked = timer.isRunning || timer.isPaused

const fields: { key: keyof AppSettings; label: string; desc: string; min: number; max: number; step: number }[] = [
  { key: 'focusDuration', label: '专注时长', desc: '每次专注阶段的分钟数', min: 1, max: 120, step: 5 },
  { key: 'shortBreakDuration', label: '短休时长', desc: '短休息阶段的分钟数', min: 1, max: 30, step: 1 },
  { key: 'longBreakDuration', label: '长休时长', desc: '长休息阶段的分钟数', min: 1, max: 60, step: 5 },
  { key: 'longBreakInterval', label: '长休间隔', desc: '完成几轮专注后进入长休', min: 1, max: 10, step: 1 }
]

function handleChange(key: keyof AppSettings, raw: string): void {
  let val = parseInt(raw, 10)
  const field = fields.find((f) => f.key === key)!
  if (isNaN(val) || val < field.min) val = field.min
  if (val > field.max) val = field.max
  settings.updateSetting(key, val)
}

function resetDefaults(): void {
  settings.resetDefaults()
  showResetConfirm.value = false
}

function clearAllData(): void {
  taskStore.clearTasks()
  historyStore.clearHistory()
  timer.setActiveTask(null, null)
  showClearConfirm.value = false
}
</script>

<template>
  <div class="settings-panel">
    <!-- Lock warning -->
    <div v-if="locked" class="warning">
      请先停止计时再修改设置
    </div>

    <!-- Timer settings group -->
    <div class="settings-group">
      <h3 class="group-title">计时设置</h3>
      <div class="fields">
        <div v-for="field in fields" :key="field.key" class="field">
          <div class="field-info">
            <label :for="field.key">{{ field.label }}</label>
            <span class="field-desc">{{ field.desc }}</span>
          </div>
          <div class="field-control">
            <input
              :id="field.key"
              type="number"
              :min="field.min"
              :max="field.max"
              :step="field.step"
              :value="settings.settings[field.key]"
              :disabled="locked"
              @input="handleChange(field.key, ($event.target as HTMLInputElement).value)"
            />
            <span class="field-unit">分钟</span>
          </div>
        </div>
      </div>

      <!-- Current cycle preview -->
      <div class="cycle-preview">
        <span class="cycle-badge focus">专注 {{ settings.settings.focusDuration }}min</span>
        <span class="cycle-arrow">&rarr;</span>
        <span class="cycle-badge shortBreak">短休 {{ settings.settings.shortBreakDuration }}min</span>
        <span class="cycle-repeat">&times; {{ settings.settings.longBreakInterval }}</span>
        <span class="cycle-arrow">&rarr;</span>
        <span class="cycle-badge longBreak">长休 {{ settings.settings.longBreakDuration }}min</span>
      </div>
    </div>

    <!-- Data management group -->
    <div class="settings-group">
      <h3 class="group-title">数据管理</h3>
      <div class="data-actions">
        <div class="data-row">
          <div class="data-info">
            <span class="data-label">恢复默认设置</span>
            <span class="data-desc">将所有计时参数恢复为默认值</span>
          </div>
          <button class="btn-action" :disabled="locked" @click="showResetConfirm = true">
            恢复
          </button>
        </div>
        <div class="data-row">
          <div class="data-info">
            <span class="data-label">清除所有数据</span>
            <span class="data-desc">删除全部任务、历史记录，不可恢复</span>
          </div>
          <button class="btn-action danger" @click="showClearConfirm = true">
            清除
          </button>
        </div>
      </div>
    </div>

    <!-- About -->
    <div class="settings-group">
      <h3 class="group-title">关于</h3>
      <div class="about-text">
        <p>Pomodoro Timer v1.0</p>
        <p class="about-sub">Electron + Vue 3 + TypeScript</p>
      </div>
    </div>

    <!-- Confirm dialogs -->
    <ConfirmDialog
      v-if="showResetConfirm"
      title="恢复默认设置？"
      message="所有计时参数将恢复为默认值。此操作不会影响任务和历史记录。"
      confirm-text="恢复"
      @confirm="resetDefaults"
      @cancel="showResetConfirm = false"
    />
    <ConfirmDialog
      v-if="showClearConfirm"
      title="清除所有数据？"
      message="将删除所有任务和历史记录，此操作不可恢复。建议先备份重要数据。"
      confirm-text="确认清除"
      :danger="true"
      @confirm="clearAllData"
      @cancel="showClearConfirm = false"
    />
  </div>
</template>

<style scoped>
.settings-panel {
  padding: 0 0 24px;
}

.warning {
  padding: 10px 14px;
  margin-bottom: 20px;
  border-radius: 8px;
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  font-size: 13px;
  text-align: center;
}

.settings-group {
  margin-bottom: 24px;
}
.group-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.4;
  margin: 0 0 12px;
}

/* ---- fields ---- */
.fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}
.field-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.field-info label {
  font-size: 13px;
  font-weight: 500;
}
.field-desc {
  font-size: 11px;
  opacity: 0.35;
}
.field-control {
  display: flex;
  align-items: center;
  gap: 4px;
}
.field-control input {
  width: 56px;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 14px;
  text-align: center;
  outline: none;
  font-variant-numeric: tabular-nums;
}
.field-control input:focus {
  background: rgba(255, 255, 255, 0.12);
}
.field-control input:disabled {
  opacity: 0.35;
}
.field-unit {
  font-size: 11px;
  opacity: 0.3;
}

/* ---- cycle preview ---- */
.cycle-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
  font-size: 11px;
  flex-wrap: wrap;
}
.cycle-badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
}
.cycle-badge.focus { background: rgba(255, 107, 107, 0.15); color: #ff6b6b; }
.cycle-badge.shortBreak { background: rgba(81, 207, 102, 0.15); color: #51cf66; }
.cycle-badge.longBreak { background: rgba(51, 154, 240, 0.15); color: #339af0; }
.cycle-arrow { opacity: 0.3; }
.cycle-repeat { opacity: 0.4; }

/* ---- data actions ---- */
.data-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}
.data-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.data-label {
  font-size: 13px;
  font-weight: 500;
}
.data-desc {
  font-size: 11px;
  opacity: 0.35;
}
.btn-action {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.btn-action:hover {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}
.btn-action:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.btn-action.danger {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}
.btn-action.danger:hover {
  background: rgba(255, 107, 107, 0.3);
}

/* ---- about ---- */
.about-text {
  text-align: center;
  font-size: 12px;
  opacity: 0.3;
}
.about-text p {
  margin: 0 0 4px;
}
.about-sub {
  font-size: 11px !important;
}
</style>
