import { CheckIn } from '../types'
import { generateHeatmapData, getHeatmapColor } from '../lib/heatmapUtils'

interface HeatmapProps {
  checkIns: CheckIn[]
  habitName: string
}

export default function Heatmap({ checkIns, habitName }: HeatmapProps) {
  const weeks = generateHeatmapData(checkIns)

  const getTooltipText = (cell: any) => {
    const date = new Date(cell.date)
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    if (cell.completed) {
      return cell.quantity
        ? `${dateStr}: ${cell.quantity} completed`
        : `${dateStr}: Completed`
    }
    return `${dateStr}: Not completed`
  }
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 overflow-x-auto">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">
        {habitName} - Last 12 Months
      </h3>
      <div className="flex gap-1 flex-wrap">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((cell, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`w-3 h-3 rounded-sm ${getHeatmapColor(
                  cell.completed
                )} cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all`}
                title={getTooltipText(cell)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <span>Less</span>
        <div className="flex gap-1">
          {['bg-slate-800', 'bg-blue-900', 'bg-blue-700', 'bg-blue-500'].map(
            (color, i) => (
              <div key={i} className={`w-2 h-2 rounded-sm ${color}`} />
            )
          )}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
