import { CheckIn } from '../types'

interface CheckInHistoryProps {
  checkIns: CheckIn[]
  habitName: string
  habitEmoji: string
  isQuantityBased?: boolean
}

export default function CheckInHistory({
  checkIns,
  habitName,
  habitEmoji,
  isQuantityBased = false,
}: CheckInHistoryProps) {
  const sortedCheckIns = [...checkIns].sort(
    (a, b) =>
      new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime()
  )

  const displayCheckIns = sortedCheckIns.slice(0, 30)

  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">
        {habitEmoji} {habitName} - Recent Check-Ins
      </h3>

      {displayCheckIns.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No check-ins yet</p>
      ) : (
        <div className="space-y-2">
          {displayCheckIns.map((checkIn) => {
            const date = new Date(checkIn.check_in_date)
            const dateStr = date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <div
                key={checkIn.id}
                className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
              >
                <span className="text-slate-300">{dateStr}</span>
                <div className="flex items-center gap-2">
                  {checkIn.completed ? (
                    <>
                      <span className="text-green-400">✓</span>
                      {isQuantityBased && checkIn.quantity_value && (
                        <span className="text-slate-400">
                          {checkIn.quantity_value}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-500">✗</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {sortedCheckIns.length > 30 && (
        <p className="text-slate-400 text-sm mt-4 text-center">
          Showing 30 of {sortedCheckIns.length} check-ins
        </p>
      )}
    </div>
  )
}
