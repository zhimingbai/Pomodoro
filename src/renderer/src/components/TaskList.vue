<script setup lang="ts">
import { useTaskStore } from '../stores/tasks'
import { useTimerStore } from '../stores/timer'
import TaskForm from './TaskForm.vue'
import TaskItem from './TaskItem.vue'

const taskStore = useTaskStore()
const timer = useTimerStore()

function handleAdd(text: string): void {
  taskStore.addTask(text)
}

function handleToggle(id: string): void {
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
    <div class="active-task" v-if="timer.activeTaskText && timer.phase === 'focus'">
      <span class="active-label">正在专注：</span>
      <span class="active-name">{{ timer.activeTaskText }}</span>
    </div>

    <TaskForm @add="handleAdd" />

    <div v-if="taskStore.activeTasks.length === 0 && taskStore.completedTasks.length === 0" class="empty-state">
      <p>暂无任务，在上方添加一个吧。</p>
    </div>

    <div class="tasks-section" v-if="taskStore.activeTasks.length">
      <div class="section-title">待完成 ({{ taskStore.activeTasks.length }})</div>
      <TaskItem
        v-for="task in taskStore.activeTasks"
        :key="task.id"
        :task="task"
        :isActive="task.id === timer.activeTaskId"
        @toggle="handleToggle"
        @delete="handleDelete"
        @setActive="handleSetActive"
      />
    </div>

    <div class="tasks-section" v-if="taskStore.completedTasks.length">
      <div class="section-title">已完成 ({{ taskStore.completedTasks.length }})</div>
      <TaskItem
        v-for="task in taskStore.completedTasks"
        :key="task.id"
        :task="task"
        :isActive="false"
        @toggle="handleToggle"
        @delete="handleDelete"
        @setActive="handleSetActive"
      />
    </div>
  </div>
</template>

<style scoped>
.task-list {
  padding: 0;
}
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
