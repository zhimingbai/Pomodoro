<script setup lang="ts">
import { useTimerStore } from '../stores/timer'

const timer = useTimerStore()
</script>

<template>
  <div class="timer-display" :class="[timer.phase, { running: timer.isRunning }]">
    <div class="phase-label">{{ timer.isPaused ? '已暂停' : timer.phaseLabel }}</div>
    <div class="time">{{ timer.displayTime }}</div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: (timer.progress * 100) + '%' }"></div>
    </div>
  </div>
</template>

<style scoped>
.timer-display {
  text-align: center;
  padding: 32px 0 16px;
  transition: background 0.3s;
}
.phase-label {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.8;
  margin-bottom: 12px;
}
.time {
  font-size: 80px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  margin-bottom: 20px;
  line-height: 1;
}
.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
  width: 80%;
  margin: 0 auto;
}
.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 2px;
  transition: width 0.3s linear;
}
.focus { color: #ff6b6b; }
.focus .progress-fill { background: #ff6b6b; }
.shortBreak { color: #51cf66; }
.shortBreak .progress-fill { background: #51cf66; }
.longBreak { color: #339af0; }
.longBreak .progress-fill { background: #339af0; }
</style>
