import { useState } from 'react'
import { Habit, CreateHabitInput } from '../types'

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink']

const EMOJIS = [
  '🏃',
  '📚',
  '🧘',
  '💧',
  '🥗',
  '😴',
  '🎵',
  '🎨',
  '💪',
  '🚴',
  '🏊',
  '🧗',
]

interface HabitFormProps {
  habit?: Habit
  onSubmit: (data: CreateHabitInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function HabitForm({
  habit,
  onSubmit,
  onCancel,
  isLoading = false,
}: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '')
  const [emoji, setEmoji] = useState(habit?.emoji || '🏃')
  const [colorTag, setColorTag] = useState(habit?.color_tag || 'blue')
  const [habitType, setHabitType] = useState<'boolean' | 'quantity'>(
    habit?.habit_type || 'boolean'
  )
  const [targetQuantity, setTargetQuantity] = useState(
    habit?.target_quantity?.toString() || ''
  )
  const [targetUnit, setTargetUnit] = useState(habit?.target_unit || '')
  const [targetDays, setTargetDays] = useState<string[]>(
    habit?.target_days || DAYS_OF_WEEK
  )
  const [reminderTime, setReminderTime] = useState(habit?.reminder_time || '')
  const [error, setError] = useState('')

  const handleDayToggle = (day: string) => {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Habit name is required')
      return
    }

    if (targetDays.length === 0) {
      setError('Select at least one target day')
      return
    }

    if (habitType === 'quantity') {
      if (!targetQuantity) {
        setError('Target quantity is required')
        return
      }
      if (!targetUnit) {
        setError('Target unit is required')
        return
      }
    }

    try {
      await onSubmit({
        name: name.trim(),
        emoji,
        color_tag: colorTag,
        habit_type: habitType,
        target_quantity: habitType === 'quantity' ? parseInt(targetQuantity) : undefined,
        target_unit: habitType === 'quantity' ? targetUnit : undefined,
        target_days: targetDays,
        reminder_time: reminderTime || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save habit')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
          Habit Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Morning Exercise"
        />
      </div>

      <div>
        <label htmlFor="emoji" className="block text-sm font-medium text-slate-300 mb-2">
          Emoji
        </label>
        <div className="grid grid-cols-6 gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`text-2xl p-2 rounded-lg transition-colors ${
                emoji === e
                  ? 'bg-blue-600'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium text-slate-300 mb-2">
          Color
        </label>
        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setColorTag(color)}
              className={`w-8 h-8 rounded-full transition-transform ${
                colorTag === color ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-blue-400 scale-110' : ''
              } ${
                color === 'red'
                  ? 'bg-red-600'
                  : color === 'blue'
                  ? 'bg-blue-600'
                  : color === 'green'
                  ? 'bg-green-600'
                  : color === 'yellow'
                  ? 'bg-yellow-600'
                  : color === 'purple'
                  ? 'bg-purple-600'
                  : 'bg-pink-600'
              }`}
              aria-label={`Select ${color} color`}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Habit Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="boolean"
              checked={habitType === 'boolean'}
              onChange={(e) => setHabitType(e.target.value as 'boolean' | 'quantity')}
              className="w-4 h-4"
            />
            <span className="text-slate-300">Yes/No</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="quantity"
              checked={habitType === 'quantity'}
              onChange={(e) => setHabitType(e.target.value as 'boolean' | 'quantity')}
              className="w-4 h-4"
            />
            <span className="text-slate-300">Quantity</span>
          </label>
        </div>
      </div>

      {habitType === 'quantity' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-slate-300 mb-2">
                Target Quantity
              </label>
              <input
                id="quantity"
                type="number"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(e.target.value)}
                min="1"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8"
              />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-slate-300 mb-2">
                Unit
              </label>
              <input
                id="unit"
                type="text"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., glasses"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Target Days
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <label key={day} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={targetDays.includes(day)}
                onChange={() => handleDayToggle(day)}
                className="w-4 h-4"
              />
              <span className="text-slate-300">{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="reminder" className="block text-sm font-medium text-slate-300 mb-2">
          Reminder Time (optional)
        </label>
        <input
          id="reminder"
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Habit'}
        </button>
      </div>
    </form>
  )
}
