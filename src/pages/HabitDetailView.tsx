import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../components/MainLayout'
import { useHabitsStore } from '../stores/habitsStore'
import { useCheckInsStore } from '../stores/checkInsStore'
import Heatmap from '../components/Heatmap'
import CheckInHistory from '../components/CheckInHistory'
import StreakDisplay from '../components/StreakDisplay'
import CompletionRateCard from '../components/CompletionRateCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { calculateStreaks } from '../lib/streakCalculations'
import {
  calculateWeeklyCompletionRate,
  calculateMonthlyCompletionRate,
} from '../lib/completionRateCalculations'

export default function HabitDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { habits, fetchHabits, isLoading: habitsLoading } = useHabitsStore()
  const { checkIns, fetchCheckIns, isLoading: checkInsLoading } =
    useCheckInsStore()

  useEffect(() => {
    fetchHabits()
    fetchCheckIns()
  }, [fetchHabits, fetchCheckIns])

  const habit = habits.find((h) => h.id === id)
  const habitCheckIns = checkIns.filter((ci) => ci.habit_id === id)

  if (habitsLoading || checkInsLoading) {
    return (
      <MainLayout>
        <div className="p-4">
          <LoadingSpinner fullScreen />
        </div>
      </MainLayout>
    )
  }

  if (!habit) {
    return (
      <MainLayout>
        <div className="p-4">
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">Habit not found</p>
            <button
              onClick={() => navigate('/habits')}
              className="text-blue-400 hover:text-blue-300"
            >
              Back to Habits
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const { currentStreak, longestStreak } = calculateStreaks(
    habitCheckIns,
    habit.target_days
  )
  const weeklyRate = calculateWeeklyCompletionRate(habitCheckIns, habit.target_days)
  const monthlyRate = calculateMonthlyCompletionRate(habitCheckIns, habit.target_days)

  return (
    <MainLayout>
      <div className="p-4">
        <button
          onClick={() => navigate('/habits')}
          className="text-blue-400 hover:text-blue-300 mb-4"
        >
          ← Back to Habits
        </button>

        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{habit.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{habit.name}</h1>
              <p className="text-slate-400">
                {habit.target_days.join(', ')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <StreakDisplay
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              size="lg"
            />

            <div className="grid grid-cols-2 gap-3">
              <CompletionRateCard title="This Week" rate={weeklyRate} />
              <CompletionRateCard title="This Month" rate={monthlyRate} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Heatmap checkIns={habitCheckIns} habitName={habit.name} />
          <CheckInHistory
            checkIns={habitCheckIns}
            habitName={habit.name}
            habitEmoji={habit.emoji}
            isQuantityBased={habit.habit_type === 'quantity'}
          />
        </div>
      </div>
    </MainLayout>
  )
}
