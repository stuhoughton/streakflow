import { describe, it, expect } from 'vitest'
import { generateHeatmapData, getHeatmapColor } from './heatmapUtils'
import { CheckIn } from '../types'

describe('Heatmap Utilities', () => {
  describe('generateHeatmapData', () => {
    it('should return array of weeks', () => {
      const checkIns: CheckIn[] = []
      const weeks = generateHeatmapData(checkIns)
      expect(Array.isArray(weeks)).toBe(true)
      expect(weeks.length).toBeGreaterThan(0)
    })

    it('should return weeks with cells', () => {
      const checkIns: CheckIn[] = []
      const weeks = generateHeatmapData(checkIns)
      weeks.forEach((week) => {
        expect(Array.isArray(week)).toBe(true)
        week.forEach((cell) => {
          expect(cell).toHaveProperty('date')
          expect(cell).toHaveProperty('completed')
          expect(cell).toHaveProperty('quantity')
        })
      })
    })

    it('should mark check-ins as completed', () => {
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

      const weeks = generateHeatmapData(checkIns)
      const hasCompleted = weeks.some((week) =>
        week.some((cell) => cell.completed)
      )
      expect(hasCompleted).toBe(true)
    })

    it('should include quantity values', () => {
      const today = new Date()
      const checkIns: CheckIn[] = [
        {
          id: '1',
          habit_id: 'habit1',
          user_id: 'user1',
          check_in_date: today.toISOString().split('T')[0],
          quantity_value: 8,
          completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      const weeks = generateHeatmapData(checkIns)
      const hasQuantity = weeks.some((week) =>
        week.some((cell) => cell.quantity !== null)
      )
      expect(hasQuantity).toBe(true)
    })
  })

  describe('getHeatmapColor', () => {
    it('should return dark color for incomplete', () => {
      const color = getHeatmapColor(false)
      expect(color).toBe('bg-slate-800')
    })

    it('should return blue color for completed', () => {
      const color = getHeatmapColor(true, 0.5)
      expect(color).toMatch(/bg-blue-/)
    })

    it('should return darker blue for low intensity', () => {
      const color = getHeatmapColor(true, 0.1)
      expect(color).toBe('bg-blue-900')
    })

    it('should return lighter blue for high intensity', () => {
      const color = getHeatmapColor(true, 0.9)
      expect(color).toBe('bg-blue-400')
    })
  })
})
