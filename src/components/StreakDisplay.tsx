interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  size?: 'sm' | 'md' | 'lg'
}

export default function StreakDisplay({
  currentStreak,
  longestStreak,
  size = 'md',
}: StreakDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const numberSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  return (
    <div className="flex gap-4">
      <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
        <p className={`text-slate-400 ${sizeClasses[size]}`}>Current</p>
        <p className={`font-bold text-blue-400 ${numberSizeClasses[size]}`}>
          {currentStreak}
        </p>
      </div>
      <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
        <p className={`text-slate-400 ${sizeClasses[size]}`}>Longest</p>
        <p className={`font-bold text-slate-300 ${numberSizeClasses[size]}`}>
          {longestStreak}
        </p>
      </div>
    </div>
  )
}
