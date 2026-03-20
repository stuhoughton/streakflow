import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SortBy = 'created' | 'current_streak' | 'longest_streak'

interface UIStore {
  theme: 'dark' | 'light'
  sortBy: SortBy
  showArchivedHabits: boolean
  setTheme: (theme: 'dark' | 'light') => void
  setSortBy: (sortBy: SortBy) => void
  toggleArchivedHabits: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      sortBy: 'created',
      showArchivedHabits: false,

      setTheme: (theme: 'dark' | 'light') => {
        set({ theme })
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      setSortBy: (sortBy: SortBy) => {
        set({ sortBy })
      },

      toggleArchivedHabits: () => {
        set((state) => ({ showArchivedHabits: !state.showArchivedHabits }))
      },
    }),
    {
      name: 'ui-store',
    }
  )
)
