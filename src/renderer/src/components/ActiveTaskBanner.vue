<script setup lang="ts">
import { useTimerStore } from '../stores/timer'

const timer = useTimerStore()
</script>

<template>
  <div v-if="timer.activeTaskText && timer.phase === 'focus'" class="active-task">
    <span class="active-label">正在专注：</span>
    <span class="active-name">{{ timer.activeTaskText }}</span>
  </div>
</template>

<style scoped>
.active-task {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 14px;
  border-radius: 8px;
  background: rgba(255, 107, 107, 0.1);
  font-size: 13px;
}
.active-label {
  opacity: 0.6;
}
.active-name {
  font-weight: 600;
  color: #ff6b6b;
}
</style>
