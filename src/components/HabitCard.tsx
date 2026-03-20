import { Habit, CheckIn } from '../types'
import { calculateStreaks } from '../lib/streakCalculations'

interface HabitCardProps {
  habit: Habit
  checkIns: CheckIn[]
  onCheckIn: (habitId: string) => void
  onEdit?: (habitId: string) => void
  onDelete?: (habitId: string) => void
  isLoading?: boolean
}

const colorMap: Record<string, string> = {
  red: 'bg-red-600',
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  yellow: 'bg-yellow-600',
  purple: 'bg-purple-600',
  pink: 'bg-pink-600',
}

export default function HabitCard({
  habit,
  checkIns,
  onCheckIn,
  onEdit,
  onDelete,
  isLoading = false,
}: HabitCardProps) {
  const habitCheckIns = checkIns.filter((ci) => ci.habit_id === habit.id)
  const { currentStreak, longestStreak } = calculateStreaks(
    habitCheckIns,
    habit.target_days
  )

  const today = new Date().toISOString().split('T')[0]
  const todayCheckIn = habitCheckIns.find((ci) => ci.check_in_date === today)
  const isCompletedToday = todayCheckIn?.completed ?? false

  const colorClass = colorMap[habit.color_tag] || 'bg-blue-600'

  return (
    <div className="bg-slate-900 rounded-card p-4 shadow-card border border-slate-700 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{habit.emoji}</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100">{habit.name}</h3>
            <p className="text-sm text-slate-400">
              {habit.target_days.join(', ')}
            </p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${colorClass}`} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-slate-400">Current</p>
            <p className="text-xl font-bold text-blue-400">{currentStreak}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Longest</p>
            <p className="text-xl font-bold text-slate-300">{longestStreak}</p>
          </div>
        </div>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
            isCompletedToday
              ? 'bg-green-600 text-white'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {isCompletedToday ? '✓' : '○'}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onCheckIn(habit.id)}
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-2 px-4 rounded-button transition-colors"
        >
          {isCompletedToday ? 'Done' : 'Check In'}
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(habit.id)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-button transition-colors"
            aria-label="Edit habit"
          >
            ✎
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(habit.id)}
            className="px-4 py-2 bg-slate-800 hover:bg-red-900 text-slate-300 hover:text-red-300 rounded-button transition-colors"
            aria-label="Delete habit"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
