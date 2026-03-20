import { create } from 'zustand'
import { supabase } from '../lib/supabase'

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

interface CheckInsStore {
  checkIns: CheckIn[]
  isLoading: boolean
  error: string | null
  fetchCheckIns: (habitId?: string, startDate?: Date, endDate?: Date) => Promise<void>
  recordCheckIn: (habitId: string, date: Date, quantity?: number) => Promise<CheckIn>
  undoCheckIn: (habitId: string, date: Date) => Promise<void>
  getCheckInsForHabit: (habitId: string) => CheckIn[]
  getCheckInForDate: (habitId: string, date: Date) => CheckIn | null
}

export const useCheckInsStore = create<CheckInsStore>((set, get) => ({
  checkIns: [],
  isLoading: false,
  error: null,

  fetchCheckIns: async (habitId?: string, startDate?: Date, endDate?: Date) => {
    set({ isLoading: true, error: null })
    try {
      let query = supabase.from('check_ins').select('*')

      if (habitId) {
        query = query.eq('habit_id', habitId)
      }

      if (startDate) {
        query = query.gte('check_in_date', startDate.toISOString().split('T')[0])
      }

      if (endDate) {
        query = query.lte('check_in_date', endDate.toISOString().split('T')[0])
      }

      const { data, error } = await query.order('check_in_date', {
        ascending: false,
      })

      if (error) throw error
      set({ checkIns: data || [], isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch check-ins',
        isLoading: false,
      })
    }
  },

  recordCheckIn: async (habitId: string, date: Date, quantity?: number) => {
    set({ isLoading: true, error: null })
    try {
      const checkInDate = date.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('check_ins')
        .upsert(
          {
            habit_id: habitId,
            check_in_date: checkInDate,
            quantity_value: quantity,
            completed: true,
          },
          { onConflict: 'habit_id,check_in_date' }
        )
        .select()
        .single()

      if (error) throw error
      if (data) {
        set((state) => {
          const existing = state.checkIns.find(
            (ci) =>
              ci.habit_id === habitId && ci.check_in_date === checkInDate
          )
          if (existing) {
            return {
              checkIns: state.checkIns.map((ci) =>
                ci.id === data.id ? data : ci
              ),
              isLoading: false,
            }
          }
          return {
            checkIns: [data, ...state.checkIns],
            isLoading: false,
          }
        })
        return data
      }
      throw new Error('Failed to record check-in')
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to record check-in',
        isLoading: false,
      })
      throw error
    }
  },

  undoCheckIn: async (habitId: string, date: Date) => {
    set({ isLoading: true, error: null })
    try {
      const checkInDate = date.toISOString().split('T')[0]
      const now = new Date()
      const checkInTime = new Date(date)

      // Validate 24-hour window
      const hoursDiff = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
      if (hoursDiff > 24) {
        throw new Error('Cannot undo check-in after 24 hours')
      }

      const { error } = await supabase
        .from('check_ins')
        .delete()
        .eq('habit_id', habitId)
        .eq('check_in_date', checkInDate)

      if (error) throw error
      set((state) => ({
        checkIns: state.checkIns.filter(
          (ci) => !(ci.habit_id === habitId && ci.check_in_date === checkInDate)
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to undo check-in',
        isLoading: false,
      })
      throw error
    }
  },

  getCheckInsForHabit: (habitId: string) => {
    return get().checkIns.filter((ci) => ci.habit_id === habitId)
  },

  getCheckInForDate: (habitId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return (
      get().checkIns.find(
        (ci) => ci.habit_id === habitId && ci.check_in_date === dateStr
      ) || null
    )
  },
}))
