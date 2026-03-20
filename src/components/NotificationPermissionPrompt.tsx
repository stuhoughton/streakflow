import { useState, useEffect } from 'react'
import { requestNotificationPermission } from '../lib/reminderUtils'

export default function NotificationPermissionPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if we should show the prompt
    if ('Notification' in window && Notification.permission === 'default') {
      // Show prompt after a delay
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleRequestPermission = async () => {
    setIsLoading(true)
    try {
      await requestNotificationPermission()
      setShowPrompt(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-24 md:bottom-4 left-4 right-4 bg-blue-900 border border-blue-700 rounded-lg p-4 shadow-lg z-40">
      <p className="text-blue-100 mb-3">
        Enable notifications to get reminders for your habits
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleRequestPermission}
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Enabling...' : 'Enable'}
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-blue-100 rounded-lg transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  )
}
