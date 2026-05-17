<script setup lang="ts">
defineProps<{
  title: string
  message: string
  confirmText?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div class="overlay" @click.self="emit('cancel')">
    <div class="dialog">
      <h3 class="dialog-title">{{ title }}</h3>
      <p class="dialog-msg">{{ message }}</p>
      <div class="dialog-actions">
        <button class="btn btn-cancel" @click="emit('cancel')">取消</button>
        <button class="btn btn-confirm" :class="{ danger }" @click="emit('confirm')">
          {{ confirmText || '确认' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}
.dialog {
  background: #1e1e1e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  width: 320px;
  max-width: 90vw;
}
.dialog-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 8px;
}
.dialog-msg {
  font-size: 13px;
  opacity: 0.6;
  margin: 0 0 20px;
  line-height: 1.5;
}
.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn:active { opacity: 0.7; }
.btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}
.btn-cancel:hover { background: rgba(255, 255, 255, 0.14); }
.btn-confirm {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
.btn-confirm:hover { background: rgba(255, 255, 255, 0.25); }
.btn-confirm.danger {
  background: rgba(255, 107, 107, 0.4);
  color: #fff;
}
.btn-confirm.danger:hover { background: rgba(255, 107, 107, 0.55); }
</style>
