function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatLocalDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function getTodayLocalDateKey(): string {
  return formatLocalDateKey()
}

export function getDaysAgoLocalDateKey(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return formatLocalDateKey(date)
}

export function getStartOfWeekLocalDateKey(date = new Date()): string {
  const startOfWeek = new Date(date)
  startOfWeek.setHours(0, 0, 0, 0)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  return formatLocalDateKey(startOfWeek)
}

