<script setup lang="ts">
import { computed } from 'vue'
import { useHistoryStore } from '../stores/history'
import { useTaskStore } from '../stores/tasks'

const history = useHistoryStore()
const taskStore = useTaskStore()

// ---- helper ----
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// ---- derived stats ----
const today = computed(() => daysAgo(0))

const todayFocusSessions = computed(() =>
  history.sessions.filter((s) => s.date === today.value && s.phase === 'focus')
)
const todayFocusMinutes = computed(() =>
  Math.round(todayFocusSessions.value.reduce((sum, s) => sum + s.durationSeconds, 0) / 60)
)
const todayFocusCount = computed(() => todayFocusSessions.value.length)

const weekFocusMinutes = computed(() => {
  const weekAgo = daysAgo(6)
  return Math.round(
    history.sessions
      .filter((s) => s.date >= weekAgo && s.phase === 'focus')
      .reduce((sum, s) => sum + s.durationSeconds, 0) / 60
  )
})

const totalFocusMinutes = computed(() =>
  Math.round(
    history.sessions
      .filter((s) => s.phase === 'focus')
      .reduce((sum, s) => sum + s.durationSeconds, 0) / 60
  )
)

const focusHoursDisplay = computed(() => {
  const h = Math.floor(totalFocusMinutes.value / 60)
  const m = totalFocusMinutes.value % 60
  return h > 0 ? `${h}h ${m}m` : `${m}min`
})

const completedTaskCount = computed(() => taskStore.tasks.filter((t) => t.completed).length)

const streak = computed(() => {
  const all = history.sessions
  if (all.length === 0) return 0
  const dates = new Set(all.map((s) => s.date))
  const td = daysAgo(0)
  if (!dates.has(td)) return 0
  let s = 1
  for (let i = 1; i <= 365; i++) {
    if (dates.has(daysAgo(i))) s++
    else break
  }
  return s
})

// ---- weekly chart data ----
const weekChart = computed(() => {
  const days: { label: string; date: string; count: number; minutes: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const date = daysAgo(i)
    const daySessions = history.sessions.filter((s) => s.date === date)
    const focusSessions = daySessions.filter((s) => s.phase === 'focus')
    const dayNames = ['日', '一', '二', '三', '四', '五', '六']
    const d = new Date(date)
    days.push({
      label: dayNames[d.getDay()],
      date,
      count: focusSessions.length,
      minutes: Math.round(focusSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60)
    })
  }
  return days
})

const maxChartMinutes = computed(() => {
  const max = Math.max(...weekChart.value.map((d) => d.minutes), 1)
  return Math.ceil(max / 25) * 25
})

// ---- today detail list ----
const todaySessionsDetail = computed(() =>
  history.sessions
    .filter((s) => s.date === today.value)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
)

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const phaseLabel = (p: string): string =>
  p === 'focus' ? '专注' : p === 'shortBreak' ? '短休' : '长休'

// ---- focus/break ratio ----
const focusRatio = computed(() => {
  const focus = totalFocusMinutes.value
  const breakMins = Math.round(
    history.sessions
      .filter((s) => s.phase !== 'focus')
      .reduce((sum, s) => sum + s.durationSeconds, 0) / 60
  )
  if (focus + breakMins === 0) return 0
  return Math.round((focus / (focus + breakMins)) * 100)
})
</script>

<template>
  <div class="stats-overview">
    <!-- Empty state -->
    <div v-if="history.totalCount === 0" class="empty-state">
      <p>暂无统计数据，开始你的第一个番茄钟吧！</p>
    </div>

    <template v-else>
      <!-- Top stat cards -->
      <div class="stats-grid">
        <div class="stat-card accent-focus">
          <div class="stat-number">{{ todayFocusCount }}</div>
          <div class="stat-label">今日专注</div>
          <div class="stat-sub">{{ todayFocusMinutes }}min</div>
        </div>
        <div class="stat-card accent-green">
          <div class="stat-number">{{ streak }}</div>
          <div class="stat-label">连续天数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ weekChart.filter((d) => d.count > 0).length }}</div>
          <div class="stat-label">本周活跃天</div>
          <div class="stat-sub">{{ weekFocusMinutes }}min</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ focusHoursDisplay }}</div>
          <div class="stat-label">总专注时长</div>
          <div class="stat-sub">{{ totalFocusMinutes }}min / {{ history.totalCount }} 次</div>
        </div>
      </div>

      <!-- Weekly bar chart -->
      <div class="section">
        <div class="section-title">本周专注</div>
        <div class="chart-bars">
          <div v-for="day in weekChart" :key="day.date" class="bar-col">
            <div class="bar-label">{{ day.count }}</div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :class="{ today: day.date === daysAgo(0), empty: day.minutes === 0 }"
                :style="{
                  height: maxChartMinutes > 0 ? (day.minutes / maxChartMinutes) * 100 + '%' : '0%'
                }"
              ></div>
            </div>
            <div class="bar-day">{{ day.label }}</div>
          </div>
        </div>
        <div class="chart-summary">
          <span>总 {{ weekFocusMinutes }}min</span>
          <span>日均 {{ Math.round(weekFocusMinutes / 7) }}min</span>
          <span>专注占比 {{ focusRatio }}%</span>
        </div>
      </div>

      <!-- Today detail -->
      <div v-if="todaySessionsDetail.length" class="section">
        <div class="section-title">今日记录</div>
        <div class="session-list">
          <div v-for="s in todaySessionsDetail" :key="s.id" class="session-row">
            <span class="session-phase" :class="s.phase">{{ phaseLabel(s.phase) }}</span>
            <span v-if="s.taskText" class="session-task">{{ s.taskText }}</span>
            <span v-else class="session-task placeholder">—</span>
            <span class="session-dur">{{ Math.round(s.durationSeconds / 60) }}min</span>
            <span class="session-time">{{ formatTime(s.endTime) }}</span>
          </div>
        </div>
      </div>

      <!-- Task stats -->
      <div v-if="taskStore.tasks.length > 0" class="section">
        <div class="section-title">任务统计</div>
        <div class="task-stats-row">
          <div class="task-stat">
            <span class="ts-num">{{ taskStore.activeTasks.length }}</span>
            <span class="ts-label">待完成</span>
          </div>
          <div class="task-stat">
            <span class="ts-num">{{ completedTaskCount }}</span>
            <span class="ts-label">已完成</span>
          </div>
          <div class="task-stat">
            <span class="ts-num">{{
              taskStore.tasks.filter(
                (t) => t.completed && history.sessions.some((s) => s.taskId === t.id)
              ).length
            }}</span>
            <span class="ts-label">专注过</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stats-overview {
  padding: 0 0 24px;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
  opacity: 0.4;
  font-size: 14px;
}

/* ---- stat cards ---- */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 20px;
}
.stat-card {
  text-align: center;
  padding: 14px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
}
.stat-number {
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
}
.stat-label {
  font-size: 11px;
  opacity: 0.5;
  margin-top: 2px;
}
.stat-sub {
  font-size: 10px;
  opacity: 0.3;
  margin-top: 2px;
}
.stat-card.accent-focus .stat-number {
  color: #ff6b6b;
}
.stat-card.accent-green .stat-number {
  color: #51cf66;
}

/* ---- sections ---- */
.section {
  margin-bottom: 20px;
}
.section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.4;
  margin-bottom: 10px;
}

/* ---- weekly chart ---- */
.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 6px;
  height: 120px;
  padding: 0 2px;
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.bar-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums;
}
.bar-track {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.bar-fill {
  width: 70%;
  border-radius: 4px 4px 0 0;
  background: rgba(255, 107, 107, 0.35);
  min-height: 3px;
  transition: height 0.5s ease;
}
.bar-fill.today {
  background: #ff6b6b;
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.3);
}
.bar-fill.empty {
  background: rgba(255, 255, 255, 0.06);
}
.bar-day {
  font-size: 10px;
  opacity: 0.35;
  margin-top: 6px;
}
.chart-summary {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 10px;
  font-size: 11px;
  opacity: 0.4;
}

/* ---- session list ---- */
.session-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.session-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 12px;
}
.session-phase {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}
.session-phase.focus {
  color: #ff6b6b;
}
.session-phase.shortBreak {
  color: #51cf66;
}
.session-phase.longBreak {
  color: #339af0;
}
.session-task {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.session-task.placeholder {
  opacity: 0.3;
}
.session-dur {
  opacity: 0.5;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.session-time {
  opacity: 0.3;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  width: 42px;
  text-align: right;
}

/* ---- task stats ---- */
.task-stats-row {
  display: flex;
  gap: 8px;
}
.task-stat {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
}
.ts-num {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}
.ts-label {
  display: block;
  font-size: 10px;
  opacity: 0.4;
  margin-top: 2px;
}
</style>
