<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from './stores/settings'
import { useTaskStore } from './stores/tasks'
import { useHistoryStore } from './stores/history'
import { useTimerStore } from './stores/timer'
import TimerDisplay from './components/TimerDisplay.vue'
import TimerControls from './components/TimerControls.vue'
import SessionIndicator from './components/SessionIndicator.vue'
import ActiveTaskBanner from './components/ActiveTaskBanner.vue'
import TaskList from './components/TaskList.vue'
import StatsOverview from './components/StatsOverview.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

const tabs = ['计时', '任务', '统计', '设置'] as const
type Tab = (typeof tabs)[number]
const activeTab = ref<Tab>('计时')

const settingsStore = useSettingsStore()
const taskStore = useTaskStore()
const historyStore = useHistoryStore()
const timer = useTimerStore()

const showCloseConfirm = ref(false)

function handleCloseRequest(): void {
  if (timer.isRunning || timer.isPaused) {
    showCloseConfirm.value = true
  } else {
    window.api.confirmClose()
  }
}

function confirmClose(): void {
  window.api.confirmClose()
}

onMounted(async () => {
  window.api.onRequestClose(handleCloseRequest)

  await Promise.all([
    settingsStore.loadSettings(),
    taskStore.loadTasks(),
    historyStore.loadHistory()
  ])
  if (settingsStore.settings.autoCheckUpdate) {
    window.api
      .checkUpdate()
      .then((info) => {
        if (info.hasUpdate) {
          console.log('[update] 发现新版本:', info.latestVersion, info.releaseUrl)
        }
      })
      .catch(() => {})
  }
})

onUnmounted(() => {
  timer.cleanup()
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
        <ActiveTaskBanner />
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

    <ConfirmDialog
      v-if="showCloseConfirm"
      title="确定要退出吗？"
      message="计时器正在运行中，退出将丢失当前进度。"
      confirm-text="退出"
      @confirm="confirmClose"
      @cancel="showCloseConfirm = false"
    />
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
