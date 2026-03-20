import { CheckIn } from '../types'

export interface HeatmapCell {
  date: Date
  completed: boolean
  quantity: number | null
}

export function generateHeatmapData(checkIns: CheckIn[]): HeatmapCell[][] {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setFullYear(today.getFullYear() - 1)

  const weeks: HeatmapCell[][] = []
  let currentWeek: HeatmapCell[] = []

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()

    const checkIn = checkIns.find(
      (ci) =>
        new Date(ci.check_in_date).toDateString() === d.toDateString()
    )

    currentWeek.push({
      date: new Date(d),
      completed: checkIn?.completed ?? false,
      quantity: checkIn?.quantity_value ?? null,
    })

    if (dayOfWeek === 6 || d.toDateString() === today.toDateString()) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  }

  return weeks
}

export function getHeatmapColor(completed: boolean, intensity: number = 1): string {
  if (!completed) return 'bg-slate-800'

  const colors = [
    'bg-blue-900',
    'bg-blue-700',
    'bg-blue-500',
    'bg-blue-400',
  ]

  const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1)
  return colors[index]
}
