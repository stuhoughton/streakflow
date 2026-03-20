export interface Habit {
  id: string
  user_id: string
  name: string
  emoji: string
  color_tag: string
  habit_type: 'boolean' | 'quantity'
  target_quantity?: number
  target_unit?: string
  target_days: string[]
  reminder_time?: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface CheckIn {
  id: string
  habit_id: string
  user_id: string
  check_in_date: string
  quantity_value?: number
  completed: boolean
  created_at: string
  updated_at: string
}

export interface Streak {
  currentStreak: number
  longestStreak: number
}

export interface User {
  id: string
  email: string
  timezone: string
  theme: 'dark' | 'light'
}
