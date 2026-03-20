import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './authStore'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
  },
}))

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useAuthStore.getState()
    store.user = null
    store.isLoading = true
    store.error = null
  })

  describe('login', () => {
    it('should initialize with null user', () => {
      const store = useAuthStore.getState()
      expect(store.user).toBeNull()
    })

    it('should have isLoading flag', () => {
      const store = useAuthStore.getState()
      expect(store.isLoading).toBeDefined()
    })

    it('should have error state', () => {
      const store = useAuthStore.getState()
      expect(store.error).toBeDefined()
    })
  })

  describe('signup', () => {
    it('should have signup method', () => {
      const store = useAuthStore.getState()
      expect(typeof store.signup).toBe('function')
    })
  })

  describe('logout', () => {
    it('should have logout method', () => {
      const store = useAuthStore.getState()
      expect(typeof store.logout).toBe('function')
    })
  })

  describe('restoreSession', () => {
    it('should have restoreSession method', () => {
      const store = useAuthStore.getState()
      expect(typeof store.restoreSession).toBe('function')
    })
  })
})
