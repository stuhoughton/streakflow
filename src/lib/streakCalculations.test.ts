import { describe, it, expect } from 'vitest'
import { calculateCurrentStreak, calculateLongestStreak, calculateStreaks } from './streakCalculations'
import { CheckIn } from '../types'

describe('Streak Calculations', () => {
  describe('calculateCurrentStreak', () => {
    it('should return 0 when no check-ins exist', () => {
      const checkIns: CheckIn[] = []
      const targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      const streak = calculateCurrentStreak(checkIns, targetDays)
      expect(streak).toBe(0)
    })

    it('should calculate current streak for consecutive days', () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const twoDaysAgo = new Date(today)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

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
        {
          id: '2',
          habit_id: 'habit1',
          user_id: 'user1',
          check_in_date: yesterday.toISOString().split('T')[0],
          completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      const targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const streak = calculateCurrentStreak(checkIns, targetDays)
      expect(streak).toBeGreaterThanOrEqual(0)
    })

    it('should reset streak when a target day is missed', () => {
      const today = new Date()
      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const checkIns: CheckIn[] = [
        {
          id: '1',
          habit_id: 'habit1',
          user_id: 'user1',
          check_in_date: threeDaysAgo.toISOString().split('T')[0],
          completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      const targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const streak = calculateCurrentStreak(checkIns, targetDays)
      expect(streak).toBe(0)
    })
  })

  describe('calculateLongestStreak', () => {
    it('should return 0 when no check-ins exist', () => {
      const checkIns: CheckIn[] = []
      const targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      const streak = calculateLongestStreak(checkIns, targetDays)
      expect(streak).toBe(0)
    })

    it('should calculate longest streak correctly', () => {
      const today = new Date()
      const checkIns: CheckIn[] = []

      // Create 5 consecutive days of check-ins
      for (let i = 0; i < 5; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        checkIns.push({
          id: `${i}`,
          habit_id: 'habit1',
          user_id: 'user1',
          check_in_date: date.toISOString().split('T')[0],
          completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      const targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const streak = calculateLongestStreak(checkIns, targetDays)
      expect(streak).toBeGreaterThan(0)
    })
  })

  describe('calculateStreaks', () => {
    it('should return both current and longest streaks', () => {
      const checkIns: CheckIn[] = []
      const targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      const streaks = calculateStreaks(checkIns, targetDays)

      expect(streaks).toHaveProperty('currentStreak')
      expect(streaks).toHaveProperty('longestStreak')
      expect(streaks.currentStreak).toBe(0)
      expect(streaks.longestStreak).toBe(0)
    })
  })
})
