import { useEffect, useState } from 'react'
import MainLayout from '../components/MainLayout'
import { useHabitsStore } from '../stores/habitsStore'
import { useCheckInsStore } from '../stores/checkInsStore'
import HabitCard from '../components/HabitCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const { habits, fetchHabits, isLoading: habitsLoading } = useHabitsStore()
  const { checkIns, fetchCheckIns, recordCheckIn, isLoading: checkInsLoading } =
    useCheckInsStore()
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHabits()
    fetchCheckIns()
  }, [fetchHabits, fetchCheckIns])

  const todayHabits = habits.filter((h) => {
    if (h.is_archived) return false
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    return h.target_days.includes(today)
  })

  const handleCheckIn = async (habitId: string) => {
    try {
      setError('')
      await recordCheckIn(habitId, new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in')
    }
  }

  if (habitsLoading) {
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
        <h1 className="text-2xl font-bold text-slate-100 mb-6">Today's Habits</h1>

        {error && (
          <div className="mb-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {todayHabits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No habits scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                checkIns={checkIns}
                onCheckIn={handleCheckIn}
                isLoading={checkInsLoading}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
