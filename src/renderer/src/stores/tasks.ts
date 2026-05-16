import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from '../types'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loaded = ref(false)

  async function loadTasks(): Promise<void> {
    const data = await window.api.readJSON('tasks.json')
    if (data) {
      tasks.value = data as Task[]
    }
    loaded.value = true
  }

  async function saveTasks(): Promise<void> {
    await window.api.writeJSON('tasks.json', tasks.value)
  }

  async function addTask(text: string): Promise<void> {
    const task: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    }
    tasks.value.unshift(task)
    await saveTasks()
  }

  async function toggleTask(id: string): Promise<void> {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      task.completed = !task.completed
      await saveTasks()
    }
  }

  async function deleteTask(id: string): Promise<void> {
    tasks.value = tasks.value.filter((t) => t.id !== id)
    await saveTasks()
  }

  const activeTasks = computed(() =>
    tasks.value.filter((t) => !t.completed).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  )

  const completedTasks = computed(() =>
    tasks.value.filter((t) => t.completed).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  )

  const taskCount = computed(() => tasks.value.length)

  return {
    tasks,
    loaded,
    loadTasks,
    saveTasks,
    addTask,
    toggleTask,
    deleteTask,
    activeTasks,
    completedTasks,
    taskCount
  }
})
