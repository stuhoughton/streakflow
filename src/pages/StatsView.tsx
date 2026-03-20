import { useEffect } from 'react'
import MainLayout from '../components/MainLayout'
import { useHabitsStore } from '../stores/habitsStore'
import { useCheckInsStore } from '../stores/checkInsStore'
import HabitCard from '../components/HabitCard'
import StreakDisplay from '../components/StreakDisplay'
import CompletionRateCard from '../components/CompletionRateCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { calculateStreaks } from '../lib/streakCalculations'
import {
  calculateWeeklyCompletionRate,
  calculateMonthlyCompletionRate,
} from '../lib/completionRateCalculations'

export default function StatsView() {
  const { habits, fetchHabits, isLoading: habitsLoading } = useHabitsStore()
  const { checkIns, fetchCheckIns, isLoading: checkInsLoading } =
    useCheckInsStore()

  useEffect(() => {
    fetchHabits()
    fetchCheckIns()
  }, [fetchHabits, fetchCheckIns])

  const activeHabits = habits.filter((h) => !h.is_archived)

  // Calculate overall stats
  let overallCurrentStreak = 0
  let overallLongestStreak = 0
  let bestStreakHabit = null

  activeHabits.forEach((habit) => {
    const habitCheckIns = checkIns.filter((ci) => ci.habit_id === habit.id)
    const { currentStreak, longestStreak } = calculateStreaks(
      habitCheckIns,
      habit.target_days
    )

    if (currentStreak > overallCurrentStreak) {
      overallCurrentStreak = currentStreak
    }
    if (longestStreak > overallLongestStreak) {
      overallLongestStreak = longestStreak
      bestStreakHabit = habit
    }
  })

  // Calculate completion rates
  const weeklyRate = calculateWeeklyCompletionRate(
    checkIns,
    activeHabits.length > 0 ? activeHabits[0].target_days : []
  )
  const monthlyRate = calculateMonthlyCompletionRate(
    checkIns,
    activeHabits.length > 0 ? activeHabits[0].target_days : []
  )

  if (habitsLoading || checkInsLoading) {
    return (
      <MainLayout>
        <div className="p-4">
          <LoadingSpinner fullScreen />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-slate-100 mb-6">Statistics</h1>

        {activeHabits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">
              Create habits to see your statistics
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">
                Overall Performance
              </h2>
              <div className="space-y-4">
                <StreakDisplay
                  currentStreak={overallCurrentStreak}
                  longestStreak={overallLongestStreak}
                  size="lg"
                />
                {bestStreakHabit && (
                  <div className="text-sm text-slate-400">
                    Best streak: {bestStreakHabit.emoji} {bestStreakHabit.name}
                  </div>
                )}
              </div>
            </div>

            {/* Completion Rates */}
            <div className="space-y-3">
              <CompletionRateCard title="This Week" rate={weeklyRate} />
              <CompletionRateCard title="This Month" rate={monthlyRate} />
            </div>

            {/* Individual Habits */}
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-4">
                Habit Details
              </h2>
              <div className="space-y-4">
                {activeHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    checkIns={checkIns}
                    onCheckIn={() => {}}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
