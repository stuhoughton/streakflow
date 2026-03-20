interface CompletionRateCardProps {
  title: string
  rate: number
}

export default function CompletionRateCard({ title, rate }: CompletionRateCardProps) {
  const getColor = (rate: number) => {
    if (rate >= 80) return 'text-green-400'
    if (rate >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getBarColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-600'
    if (rate >= 60) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
      <p className="text-slate-400 text-sm mb-2">{title}</p>
      <div className="flex items-end gap-3">
        <p className={`text-3xl font-bold ${getColor(rate)}`}>{rate}%</p>
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(rate)} transition-all`}
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>
    </div>
  )
}
