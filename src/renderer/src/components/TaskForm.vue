<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  add: [text: string]
}>()

const text = ref('')
const error = ref('')

function handleSubmit(): void {
  const trimmed = text.value.trim()
  if (!trimmed) {
    error.value = '任务不能为空'
    return
  }
  if (trimmed.length > 200) {
    error.value = '任务内容过长（最多 200 字）'
    return
  }
  error.value = ''
  emit('add', trimmed)
  text.value = ''
}
</script>

<template>
  <div class="task-form">
    <form @submit.prevent="handleSubmit">
      <div class="input-row">
        <input
          v-model="text"
          type="text"
          placeholder="要做什么？"
          maxlength="200"
          class="task-input"
        />
        <button type="submit" class="btn-add">添加</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<style scoped>
.task-form {
  margin-bottom: 16px;
}
.input-row {
  display: flex;
  gap: 8px;
}
.task-input {
  flex: 1;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: background 0.15s;
}
.task-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.task-input:focus {
  background: rgba(255, 255, 255, 0.12);
}
.btn-add {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-add:hover {
  background: rgba(255, 255, 255, 0.22);
}
.error {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 4px;
}
</style>
