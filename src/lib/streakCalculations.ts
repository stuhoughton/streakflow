import { CheckIn } from '../types'

export function calculateCurrentStreak(
  checkIns: CheckIn[],
  targetDays: string[]
): number {
  const sortedCheckIns = checkIns.sort(
    (a, b) =>
      new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime()
  )

  let currentStreak = 0
  const today = new Date()
  let checkDate = new Date(today)

  while (true) {
    const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' })

    if (!targetDays.includes(dayName)) {
      checkDate.setDate(checkDate.getDate() - 1)
      continue
    }

    const checkIn = sortedCheckIns.find(
      (ci) =>
        new Date(ci.check_in_date).toDateString() === checkDate.toDateString()
    )

    if (checkIn?.completed) {
      currentStreak++
    } else {
      break
    }

    checkDate.setDate(checkDate.getDate() - 1)
  }

  return currentStreak
}

export function calculateLongestStreak(
  checkIns: CheckIn[],
  targetDays: string[]
): number {
  const sortedCheckIns = [...checkIns].sort(
    (a, b) =>
      new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime()
  )

  let longestStreak = 0
  let tempStreak = 0

  sortedCheckIns.forEach((checkIn) => {
    const dayName = new Date(checkIn.check_in_date).toLocaleDateString(
      'en-US',
      { weekday: 'long' }
    )

    if (targetDays.includes(dayName) && checkIn.completed) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else if (targetDays.includes(dayName)) {
      tempStreak = 0
    }
  })

  return longestStreak
}

export function calculateStreaks(
  checkIns: CheckIn[],
  targetDays: string[]
): { currentStreak: number; longestStreak: number } {
  return {
    currentStreak: calculateCurrentStreak(checkIns, targetDays),
    longestStreak: calculateLongestStreak(checkIns, targetDays),
  }
}

export function shouldResetStreak(
  lastCheckInDate: Date,
  targetDays: string[]
): boolean {
  const today = new Date()
  let checkDate = new Date(lastCheckInDate)
  checkDate.setDate(checkDate.getDate() + 1)

  while (checkDate <= today) {
    const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' })
    if (targetDays.includes(dayName)) {
      return true
    }
    checkDate.setDate(checkDate.getDate() + 1)
  }

  return false
}
