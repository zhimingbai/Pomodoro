<script setup lang="ts">
import { useTimerStore } from '../stores/timer'
import { useSettingsStore } from '../stores/settings'
import { computed } from 'vue'

const timer = useTimerStore()
const settings = useSettingsStore()

const dots = computed(() => {
  const count = settings.settings.longBreakInterval
  const result: ('completed' | 'active' | 'pending')[] = []
  for (let i = 0; i < count; i++) {
    if (i < timer.sessionsCompletedInCycle) {
      result.push('completed')
    } else if (i === timer.sessionsCompletedInCycle && timer.phase === 'focus') {
      result.push('active')
    } else {
      result.push('pending')
    }
  }
  return result
})
</script>

<template>
  <div v-if="timer.phase !== 'longBreak'" class="session-indicator">
    <div class="dots">
      <span v-for="(dot, i) in dots" :key="i" class="dot" :class="dot"></span>
    </div>
    <div class="session-text">
      第 {{ timer.sessionsCompletedInCycle + 1 }} / {{ settings.settings.longBreakInterval }} 轮
    </div>
  </div>
</template>

<style scoped>
.session-indicator {
  text-align: center;
  padding: 4px 0 8px;
}
.dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 6px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.3s;
}
.dot.pending {
  background: rgba(255, 255, 255, 0.15);
}
.dot.completed {
  background: rgba(255, 255, 255, 0.5);
}
.dot.active {
  background: #ff6b6b;
  box-shadow: 0 0 6px #ff6b6b;
}
.session-text {
  font-size: 12px;
  opacity: 0.5;
}
</style>
