<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore } from '../stores/tasks'
import { useTimerStore } from '../stores/timer'
import { useHistoryStore } from '../stores/history'
import type { Task } from '../types'
import TaskForm from './TaskForm.vue'
import TaskItem from './TaskItem.vue'
import ActiveTaskBanner from './ActiveTaskBanner.vue'

const taskStore = useTaskStore()
const timer = useTimerStore()
const historyStore = useHistoryStore()

type SortMode = 'newest' | 'oldest' | 'focused'
const sortMode = ref<SortMode>('newest')
const showCompleted = ref(true)

const focusedTaskIds = computed(() => {
  const ids = new Set<string>()
  for (const s of historyStore.sessions) {
    if (s.taskId) ids.add(s.taskId)
  }
  return ids
})

function sortTasks(tasks: Task[]): Task[] {
  const sorted = [...tasks]
  switch (sortMode.value) {
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case 'focused':
      return sorted.sort((a, b) => {
        const aF = focusedTaskIds.value.has(a.id) ? 0 : 1
        const bF = focusedTaskIds.value.has(b.id) ? 0 : 1
        if (aF !== bF) return aF - bF
        return b.createdAt.localeCompare(a.createdAt)
      })
    default:
      return sorted
  }
}

const sortedActive = computed(() => sortTasks(taskStore.activeTasks))
const sortedCompleted = computed(() => sortTasks(taskStore.completedTasks))

function handleAdd(text: string): void {
  taskStore.addTask(text)
}

function handleToggle(id: string): void {
  const task = taskStore.tasks.find((t) => t.id === id)
  if (task && !task.completed && timer.activeTaskId === id) {
    timer.setActiveTask(null, null)
  }
  taskStore.toggleTask(id)
}

function handleDelete(id: string): void {
  if (timer.activeTaskId === id) {
    timer.setActiveTask(null, null)
  }
  taskStore.deleteTask(id)
}

function handleSetActive(id: string, text: string): void {
  timer.setActiveTask(id, text)
}

const sortLabels: Record<SortMode, string> = {
  newest: '最新',
  oldest: '最早',
  focused: '专注过'
}
</script>

<template>
  <div class="task-list">
    <ActiveTaskBanner />

    <TaskForm @add="handleAdd" />

    <div
      v-if="taskStore.activeTasks.length === 0 && taskStore.completedTasks.length === 0"
      class="empty-state"
    >
      <p>暂无任务，在上方添加一个吧。</p>
    </div>

    <div class="toolbar">
      <div class="sort-group">
        <button
          v-for="mode in ['newest', 'oldest', 'focused'] as SortMode[]"
          :key="mode"
          class="sort-btn"
          :class="{ active: sortMode === mode }"
          @click="sortMode = mode"
        >
          {{ sortLabels[mode] }}
        </button>
      </div>
    </div>

    <div v-if="taskStore.activeTasks.length" class="tasks-section">
      <div class="section-title">待完成 ({{ taskStore.activeTasks.length }})</div>
      <TaskItem
        v-for="task in sortedActive"
        :key="task.id"
        :task="task"
        :is-active="task.id === timer.activeTaskId"
        @toggle="handleToggle"
        @delete="handleDelete"
        @set-active="handleSetActive"
      />
    </div>

    <div v-if="taskStore.completedTasks.length" class="tasks-section">
      <div class="section-title clickable" @click="showCompleted = !showCompleted">
        已完成 ({{ taskStore.completedTasks.length }})
        <span class="collapse-icon">{{ showCompleted ? '▼' : '▶' }}</span>
      </div>
      <template v-if="showCompleted">
        <TaskItem
          v-for="task in sortedCompleted"
          :key="task.id"
          :task="task"
          :is-active="false"
          @toggle="handleToggle"
          @delete="handleDelete"
          @set-active="handleSetActive"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.task-list {
  padding: 0;
}
.empty-state {
  text-align: center;
  padding: 32px 0;
  opacity: 0.4;
  font-size: 14px;
}
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.sort-group {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  padding: 2px;
}
.sort-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.sort-btn:hover {
  color: rgba(255, 255, 255, 0.7);
}
.sort-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.tasks-section {
  margin-bottom: 12px;
}
.section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.4;
  margin-bottom: 6px;
}
.section-title.clickable {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  user-select: none;
}
.section-title.clickable:hover {
  opacity: 0.6;
}
.collapse-icon {
  font-size: 9px;
}
</style>
