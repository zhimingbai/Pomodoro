<script setup lang="ts">
import { useTimerStore } from '../stores/timer'

const timer = useTimerStore()

function handleMainClick(): void {
  if (timer.isIdle) {
    timer.startTimer()
  } else if (timer.isRunning) {
    timer.pauseTimer()
  } else if (timer.isPaused) {
    timer.startTimer()
  }
}
</script>

<template>
  <div class="timer-controls">
    <button class="btn btn-main" @click="handleMainClick">
      <span v-if="timer.isIdle">开始</span>
      <span v-else-if="timer.isRunning">暂停</span>
      <span v-else>继续</span>
    </button>
    <div class="secondary-controls">
      <button class="btn btn-secondary" @click="timer.resetTimer()" v-if="!timer.isIdle">
        重置
      </button>
      <button class="btn btn-secondary" @click="timer.resetCycle()" v-if="!timer.isIdle">
        重置循环
      </button>
      <button class="btn btn-secondary" @click="timer.skipPhase()" v-if="timer.isRunning">
        跳过
      </button>
    </div>
  </div>
</template>

<style scoped>
.timer-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0 16px;
}
.btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition:
    opacity 0.15s,
    transform 0.1s;
}
.btn:active {
  transform: scale(0.97);
}
.btn-main {
  padding: 12px 48px;
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  min-width: 160px;
}
.btn-main:hover {
  background: rgba(255, 255, 255, 0.22);
}
.secondary-controls {
  display: flex;
  gap: 8px;
}
.btn-secondary {
  padding: 8px 20px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.06);
  font-size: 13px;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
</style>
