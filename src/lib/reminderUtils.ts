export interface ReminderSchedule {
  habitId: string
  habitName: string
  habitEmoji: string
  reminderTime: string
  timezone: string
}

export function scheduleReminder(schedule: ReminderSchedule): void {
  const [hours, minutes] = schedule.reminderTime.split(':').map(Number)

  const checkReminder = () => {
    const now = new Date()
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()

    if (currentHours === hours && currentMinutes === minutes) {
      sendNotification(schedule.habitName, schedule.habitEmoji)
    }

    // Check again in 1 minute
    setTimeout(checkReminder, 60000)
  }

  checkReminder()
}

export function sendNotification(habitName: string, habitEmoji: string): void {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return
  }

  if (Notification.permission === 'granted') {
    new Notification(`${habitEmoji} ${habitName}`, {
      body: 'Time to check in!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `habit-${habitName}`,
    })
  }
}

export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return Promise.resolve(false)
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve(true)
  }

  if (Notification.permission !== 'denied') {
    return Notification.requestPermission().then((permission) => {
      return permission === 'granted'
    })
  }

  return Promise.resolve(false)
}
