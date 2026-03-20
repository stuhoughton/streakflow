import { CheckIn } from '../types'

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function countTargetDaysInRange(
  startDate: Date,
  endDate: Date,
  targetDays: string[]
): number {
  let count = 0
  const current = new Date(startDate)

  while (current <= endDate) {
    const dayName = current.toLocaleDateString('en-US', { weekday: 'long' })
    if (targetDays.includes(dayName)) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

export function calculateWeeklyCompletionRate(
  checkIns: CheckIn[],
  targetDays: string[]
): number {
  const today = new Date()
  const weekStart = getWeekStart(today)
  const weekEnd = new Date(today)

  const targetDaysThisWeek = countTargetDaysInRange(
    weekStart,
    weekEnd,
    targetDays
  )

  if (targetDaysThisWeek === 0) return 0

  const completedThisWeek = checkIns.filter((ci) => {
    const ciDate = new Date(ci.check_in_date)
    return (
      ci.completed &&
      ciDate >= weekStart &&
      ciDate <= weekEnd
    )
  }).length

  return Math.round((completedThisWeek / targetDaysThisWeek) * 100)
}

export function calculateMonthlyCompletionRate(
  checkIns: CheckIn[],
  targetDays: string[]
): number {
  const today = new Date()
  const monthStart = getMonthStart(today)
  const monthEnd = getMonthEnd(today)

  const targetDaysThisMonth = countTargetDaysInRange(
    monthStart,
    monthEnd,
    targetDays
  )

  if (targetDaysThisMonth === 0) return 0

  const completedThisMonth = checkIns.filter((ci) => {
    const ciDate = new Date(ci.check_in_date)
    return (
      ci.completed &&
      ciDate >= monthStart &&
      ciDate <= monthEnd
    )
  }).length

  return Math.round((completedThisMonth / targetDaysThisMonth) * 100)
}

export function calculateOverallCompletionRate(
  checkIns: CheckIn[],
  allTargetDays: Map<string, string[]>
): number {
  if (checkIns.length === 0) return 0

  const completed = checkIns.filter((ci) => ci.completed).length
  return Math.round((completed / checkIns.length) * 100)
}
