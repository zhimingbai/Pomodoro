<script setup lang="ts">
import { useTaskStore } from '../stores/tasks'
import { useTimerStore } from '../stores/timer'
import TaskForm from './TaskForm.vue'
import TaskItem from './TaskItem.vue'
import ActiveTaskBanner from './ActiveTaskBanner.vue'

const taskStore = useTaskStore()
const timer = useTimerStore()

function handleAdd(text: string): void {
  taskStore.addTask(text)
}

function handleToggle(id: string): void {
  const task = taskStore.tasks.find((t) => t.id === id)
  // If the task is being marked complete and was the active focus task, clear it
  if (task && !task.completed && timer.activeTaskId === id) {
    timer.setActiveTask(null, null)
  }
  taskStore.toggleTask(id)
}

function handleDelete(id: string): void {
  // If the deleted task was active, clear active task
  if (timer.activeTaskId === id) {
    timer.setActiveTask(null, null)
  }
  taskStore.deleteTask(id)
}

function handleSetActive(id: string, text: string): void {
  timer.setActiveTask(id, text)
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

    <div v-if="taskStore.activeTasks.length" class="tasks-section">
      <div class="section-title">待完成 ({{ taskStore.activeTasks.length }})</div>
      <TaskItem
        v-for="task in taskStore.activeTasks"
        :key="task.id"
        :task="task"
        :is-active="task.id === timer.activeTaskId"
        @toggle="handleToggle"
        @delete="handleDelete"
        @set-active="handleSetActive"
      />
    </div>

    <div v-if="taskStore.completedTasks.length" class="tasks-section">
      <div class="section-title">已完成 ({{ taskStore.completedTasks.length }})</div>
      <TaskItem
        v-for="task in taskStore.completedTasks"
        :key="task.id"
        :task="task"
        :is-active="false"
        @toggle="handleToggle"
        @delete="handleDelete"
        @set-active="handleSetActive"
      />
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
</style>
