import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useHabitsStore } from './habitsStore'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          then: vi.fn((cb) => cb({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            then: vi.fn((cb) => cb({ data: null, error: null })),
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              then: vi.fn((cb) => cb({ data: null, error: null })),
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          then: vi.fn((cb) => cb({ error: null })),
        })),
      })),
    })),
  },
}))

describe('Habits Store', () => {
  beforeEach(() => {
    const store = useHabitsStore.getState()
    store.habits = []
    store.isLoading = false
    store.error = null
  })

  describe('initialization', () => {
    it('should initialize with empty habits array', () => {
      const store = useHabitsStore.getState()
      expect(store.habits).toEqual([])
    })

    it('should initialize with isLoading false', () => {
      const store = useHabitsStore.getState()
      expect(store.isLoading).toBe(false)
    })

    it('should initialize with error null', () => {
      const store = useHabitsStore.getState()
      expect(store.error).toBeNull()
    })
  })

  describe('methods', () => {
    it('should have fetchHabits method', () => {
      const store = useHabitsStore.getState()
      expect(typeof store.fetchHabits).toBe('function')
    })

    it('should have createHabit method', () => {
      const store = useHabitsStore.getState()
      expect(typeof store.createHabit).toBe('function')
    })

    it('should have updateHabit method', () => {
      const store = useHabitsStore.getState()
      expect(typeof store.updateHabit).toBe('function')
    })

    it('should have deleteHabit method', () => {
      const store = useHabitsStore.getState()
      expect(typeof store.deleteHabit).toBe('function')
    })

    it('should have archiveHabit method', () => {
      const store = useHabitsStore.getState()
      expect(typeof store.archiveHabit).toBe('function')
    })

    it('should have unarchiveHabit method', () => {
      const store = useHabitsStore.getState()
      expect(typeof store.unarchiveHabit).toBe('function')
    })

    it('should have getActiveHabits method', () => {
      const store = useHabitsStore.getState()
      expect(typeof store.getActiveHabits).toBe('function')
    })

    it('should have getArchivedHabits method', () => {
      const store = useHabitsStore.getState()
      expect(typeof store.getArchivedHabits).toBe('function')
    })

    it('should have getHabitsForToday method', () => {
      const store = useHabitsStore.getState()
      expect(typeof store.getHabitsForToday).toBe('function')
    })
  })

  describe('getActiveHabits', () => {
    it('should return empty array when no habits', () => {
      const store = useHabitsStore.getState()
      const active = store.getActiveHabits()
      expect(active).toEqual([])
    })
  })

  describe('getArchivedHabits', () => {
    it('should return empty array when no habits', () => {
      const store = useHabitsStore.getState()
      const archived = store.getArchivedHabits()
      expect(archived).toEqual([])
    })
  })

  describe('getHabitsForToday', () => {
    it('should return empty array when no habits', () => {
      const store = useHabitsStore.getState()
      const today = store.getHabitsForToday()
      expect(today).toEqual([])
    })
  })
})
