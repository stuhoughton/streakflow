import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/MainLayout'
import { useHabitsStore } from '../stores/habitsStore'
import { useCheckInsStore } from '../stores/checkInsStore'
import HabitCard from '../components/HabitCard'
import HabitForm from '../components/HabitForm'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import { CreateHabitInput } from '../types'

export default function HabitsView() {
  const navigate = useNavigate()
  const {
    habits,
    fetchHabits,
    createHabit,
    deleteHabit,
    isLoading,
  } = useHabitsStore()
  const { checkIns, fetchCheckIns } = useCheckInsStore()
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHabits()
    fetchCheckIns()
  }, [fetchHabits, fetchCheckIns])

  const activeHabits = habits.filter((h) => !h.is_archived)
  const archivedHabits = habits.filter((h) => h.is_archived)
  const displayHabits = showArchived ? archivedHabits : activeHabits

  const handleCreateHabit = async (data: CreateHabitInput) => {
    try {
      setError('')
      await createHabit(data)
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit')
    }
  }

  const handleDeleteHabit = async () => {
    if (!deletingId) return
    try {
      setError('')
      await deleteHabit(deletingId)
      setDeletingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete habit')
    }
  }

  const handleHabitClick = (habitId: string) => {
    navigate(`/habits/${habitId}`)
  }

  if (isLoading) {
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-100">
            {showArchived ? 'Archived Habits' : 'My Habits'}
          </h1>
          {!showArchived && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              + New Habit
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-6 bg-slate-900 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
              Create New Habit
            </h2>
            <HabitForm
              onSubmit={handleCreateHabit}
              onCancel={() => setShowForm(false)}
              isLoading={isLoading}
            />
          </div>
        )}

        {displayHabits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">
              {showArchived
                ? 'No archived habits'
                : 'No habits yet. Create one to get started!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayHabits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => handleHabitClick(habit.id)}
                className="cursor-pointer"
              >
                <HabitCard
                  habit={habit}
                  checkIns={checkIns}
                  onCheckIn={() => {}}
                  onDelete={() => setDeletingId(habit.id)}
                />
              </div>
            ))}
          </div>
        )}

        {!showArchived && archivedHabits.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-700">
            <button
              onClick={() => setShowArchived(true)}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              View {archivedHabits.length} archived habit
              {archivedHabits.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        {showArchived && (
          <div className="mt-8 pt-8 border-t border-slate-700">
            <button
              onClick={() => setShowArchived(false)}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Back to Active Habits
            </button>
          </div>
        )}

        {deletingId && (
          <ConfirmDialog
            title="Delete Habit"
            message="Are you sure you want to delete this habit? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            isDangerous
            onConfirm={handleDeleteHabit}
            onCancel={() => setDeletingId(null)}
            isLoading={isLoading}
          />
        )}
      </div>
    </MainLayout>
  )
}
