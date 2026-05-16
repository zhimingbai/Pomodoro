<script setup lang="ts">
import type { Task } from '../types'

const props = defineProps<{
  task: Task
  isActive: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
  setActive: [id: string, text: string]
}>()

let clickCount = 0
let clickTimer: ReturnType<typeof setTimeout> | null = null

function handleDelete(): void {
  clickCount++
  if (clickCount === 1) {
    clickTimer = setTimeout(() => {
      clickCount = 0
    }, 400)
  } else if (clickCount >= 2) {
    if (clickTimer) clearTimeout(clickTimer)
    clickCount = 0
    emit('delete', props.task.id)
  }
}
</script>

<template>
  <div class="task-item" :class="{ completed: task.completed, active: isActive }">
    <label class="task-left">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="emit('toggle', task.id)"
      />
      <span class="task-text">{{ task.text }}</span>
    </label>
    <div class="task-actions">
      <button
        v-if="!task.completed && !isActive"
        class="btn-focus"
        title="专注此任务"
        @click="emit('setActive', task.id, task.text)"
      >
        专注
      </button>
      <button
        v-if="isActive"
        class="btn-focus active-hint"
        title="当前专注任务"
      >
        进行中
      </button>
      <button class="btn-delete" title="双击删除" @click="handleDelete">
        &times;
      </button>
    </div>
  </div>
</template>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  margin-bottom: 6px;
  transition: background 0.15s;
}
.task-item:hover {
  background: rgba(255, 255, 255, 0.07);
}
.task-item.active {
  background: rgba(255, 107, 107, 0.12);
  border: 1px solid rgba(255, 107, 107, 0.3);
}
.task-item.completed {
  opacity: 0.5;
}
.task-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  cursor: pointer;
}
.task-left input[type="checkbox"] {
  accent-color: #51cf66;
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.task-text {
  font-size: 14px;
  color: #fff;
}
.completed .task-text {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.4);
}
.task-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-focus {
  padding: 4px 10px;
  border: none;
  border-radius: 5px;
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-focus:hover {
  background: rgba(255, 107, 107, 0.35);
}
.btn-focus.active-hint {
  background: rgba(255, 107, 107, 0.3);
  cursor: default;
}
.btn-delete {
  padding: 4px 8px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: rgba(255, 255, 255, 0.3);
  font-size: 16px;
  cursor: pointer;
  transition: color 0.15s;
}
.btn-delete:hover {
  color: #ff6b6b;
}
</style>
