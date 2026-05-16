<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from './stores/settings'
import { useTaskStore } from './stores/tasks'
import { useHistoryStore } from './stores/history'
import TimerDisplay from './components/TimerDisplay.vue'
import TimerControls from './components/TimerControls.vue'
import SessionIndicator from './components/SessionIndicator.vue'
import TaskList from './components/TaskList.vue'
import StatsOverview from './components/StatsOverview.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const tabs = ['计时', '任务', '统计', '设置'] as const
type Tab = (typeof tabs)[number]
const activeTab = ref<Tab>('计时')

const settingsStore = useSettingsStore()
const taskStore = useTaskStore()
const historyStore = useHistoryStore()

onMounted(async () => {
  await Promise.all([
    settingsStore.loadSettings(),
    taskStore.loadTasks(),
    historyStore.loadHistory()
  ])
})
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="app-title">Pomodoro</h1>
    </header>

    <nav class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="tab-btn"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </nav>

    <main class="main-content">
      <template v-if="activeTab === '计时'">
        <TimerDisplay />
        <SessionIndicator />
        <TimerControls />
      </template>
      <template v-else-if="activeTab === '任务'">
        <TaskList />
      </template>
      <template v-else-if="activeTab === '统计'">
        <StatsOverview />
      </template>
      <template v-else-if="activeTab === '设置'">
        <SettingsPanel />
      </template>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 420px;
  margin: 0 auto;
}

.header {
  padding: 16px 20px 8px;
  text-align: center;
  -webkit-app-region: drag;
}

.app-title {
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1px;
}

.tab-nav {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 4px 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tab-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 20px 24px;
}
</style>
