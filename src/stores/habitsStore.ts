import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { Habit, CreateHabitInput, UpdateHabitInput } from '../types'

// Re-export types for backward compatibility
export type { Habit, CreateHabitInput, UpdateHabitInput }

interface HabitsStore {
  habits: Habit[]
  isLoading: boolean
  error: string | null
  fetchHabits: () => Promise<void>
  createHabit: (input: CreateHabitInput) => Promise<Habit>
  updateHabit: (id: string, updates: UpdateHabitInput) => Promise<Habit>
  deleteHabit: (id: string) => Promise<void>
  archiveHabit: (id: string) => Promise<void>
  unarchiveHabit: (id: string) => Promise<void>
  getActiveHabits: () => Habit[]
  getArchivedHabits: () => Habit[]
  getHabitsForToday: () => Habit[]
}

export const useHabitsStore = create<HabitsStore>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ habits: data || [], isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch habits',
        isLoading: false,
      })
    }
  },

  createHabit: async (input: CreateHabitInput) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([input])
        .select()
        .single()

      if (error) throw error
      if (data) {
        set((state) => ({
          habits: [data, ...state.habits],
          isLoading: false,
        }))
        return data
      }
      throw new Error('Failed to create habit')
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create habit',
        isLoading: false,
      })
      throw error
    }
  },

  updateHabit: async (id: string, updates: UpdateHabitInput) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (data) {
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? data : h)),
          isLoading: false,
        }))
        return data
      }
      throw new Error('Failed to update habit')
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update habit',
        isLoading: false,
      })
      throw error
    }
  },

  deleteHabit: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.from('habits').delete().eq('id', id)

      if (error) throw error
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete habit',
        isLoading: false,
      })
      throw error
    }
  },

  archiveHabit: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_archived: true })
        .eq('id', id)

      if (error) throw error
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, is_archived: true } : h
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to archive habit',
        isLoading: false,
      })
      throw error
    }
  },

  unarchiveHabit: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_archived: false })
        .eq('id', id)

      if (error) throw error
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, is_archived: false } : h
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to unarchive habit',
        isLoading: false,
      })
      throw error
    }
  },

  getActiveHabits: () => {
    return get().habits.filter((h) => !h.is_archived)
  },

  getArchivedHabits: () => {
    return get().habits.filter((h) => h.is_archived)
  },

  getHabitsForToday: () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    return get()
      .habits.filter((h) => !h.is_archived && h.target_days.includes(today))
  },
}))
