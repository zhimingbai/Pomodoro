<script setup lang="ts">
import { useHistoryStore } from '../stores/history'

const history = useHistoryStore()
</script>

<template>
  <div class="stats-overview">
    <div v-if="history.totalCount === 0" class="empty-state">
      <p>暂无完成记录。</p>
      <p class="sub">开始你的第一个番茄钟吧！</p>
    </div>

    <div v-else class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ history.todayCount }}</div>
        <div class="stat-label">今日</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ history.weekCount }}</div>
        <div class="stat-label">本周</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ history.totalCount }}</div>
        <div class="stat-label">总计</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ history.currentStreak }}</div>
        <div class="stat-label">连续天数</div>
      </div>
    </div>

    <div class="recent-section" v-if="history.todaySessions.length">
      <div class="section-title">今日记录</div>
      <div class="session-list">
        <div v-for="s in history.todaySessions" :key="s.id" class="session-row">
          <span class="session-phase" :class="s.phase">
            {{ s.phase === 'focus' ? '专注' : s.phase === 'shortBreak' ? '短休' : '长休' }}
          </span>
          <span class="session-task" v-if="s.taskText">{{ s.taskText }}</span>
          <span class="session-time">{{ new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-overview {
  padding: 0;
}
.empty-state {
  text-align: center;
  padding: 48px 0;
}
.empty-state p {
  opacity: 0.5;
  font-size: 14px;
  margin: 0;
}
.empty-state .sub {
  font-size: 12px;
  margin-top: 4px;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
}
.stat-card {
  text-align: center;
  padding: 16px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
}
.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
}
.stat-label {
  font-size: 12px;
  opacity: 0.5;
  margin-top: 4px;
}
.section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.4;
  margin-bottom: 8px;
}
.session-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.session-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 13px;
}
.session-phase {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
}
.session-phase.focus { color: #ff6b6b; }
.session-phase.shortBreak { color: #51cf66; }
.session-phase.longBreak { color: #339af0; }
.session-task {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.session-time {
  opacity: 0.4;
  font-variant-numeric: tabular-nums;
}
</style>
