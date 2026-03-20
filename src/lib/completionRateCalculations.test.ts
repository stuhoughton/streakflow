import { describe, it, expect } from 'vitest'
import {
  calculateWeeklyCompletionRate,
  calculateMonthlyCompletionRate,
} from './completionRateCalculations'
import { CheckIn } from '../types'

describe('Completion Rate Calculations', () => {
  describe('calculateWeeklyCompletionRate', () => {
    it('should return 0 when no check-ins exist', () => {
      const checkIns: CheckIn[] = []
      const targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      const rate = calculateWeeklyCompletionRate(checkIns, targetDays)
      expect(rate).toBe(0)
    })

    it('should calculate weekly completion rate correctly', () => {
      const today = new Date()
      const checkIns: CheckIn[] = [
        {
          id: '1',
          habit_id: 'habit1',
          user_id: 'user1',
          check_in_date: today.toISOString().split('T')[0],
          completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      const targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const rate = calculateWeeklyCompletionRate(checkIns, targetDays)
      expect(rate).toBeGreaterThanOrEqual(0)
      expect(rate).toBeLessThanOrEqual(100)
    })

    it('should return 0 when no target days in range', () => {
      const checkIns: CheckIn[] = []
      const targetDays: string[] = []
      const rate = calculateWeeklyCompletionRate(checkIns, targetDays)
      expect(rate).toBe(0)
    })
  })

  describe('calculateMonthlyCompletionRate', () => {
    it('should return 0 when no check-ins exist', () => {
      const checkIns: CheckIn[] = []
      const targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      const rate = calculateMonthlyCompletionRate(checkIns, targetDays)
      expect(rate).toBe(0)
    })

    it('should calculate monthly completion rate correctly', () => {
      const today = new Date()
      const checkIns: CheckIn[] = [
        {
          id: '1',
          habit_id: 'habit1',
          user_id: 'user1',
          check_in_date: today.toISOString().split('T')[0],
          completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      const targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const rate = calculateMonthlyCompletionRate(checkIns, targetDays)
      expect(rate).toBeGreaterThanOrEqual(0)
      expect(rate).toBeLessThanOrEqual(100)
    })

    it('should return 0 when no target days in range', () => {
      const checkIns: CheckIn[] = []
      const targetDays: string[] = []
      const rate = calculateMonthlyCompletionRate(checkIns, targetDays)
      expect(rate).toBe(0)
    })
  })
})
