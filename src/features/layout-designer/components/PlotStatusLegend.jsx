import { PLOT_STATUS_COLORS } from '../constants'

const LEGEND_ITEMS = [
  { key: 'available', emoji: '🟢', label: 'Available' },
  { key: 'pending', emoji: '🔵', label: 'Pending' },
  { key: 'reserved', emoji: '🟠', label: 'Reserved' },
  { key: 'sold', emoji: '🔴', label: 'Sold' },
]

export default function PlotStatusLegend() {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-2 shadow-sm max-w-[95%]">
      {LEGEND_ITEMS.map(({ key, emoji, label }) => (
        <div key={key} className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <span>{emoji}</span>
          <span
            className="hidden sm:inline w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: PLOT_STATUS_COLORS[key]?.fill }}
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
