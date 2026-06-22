import { Square, RectangleHorizontal, Circle, Triangle } from 'lucide-react'
import { PLOT_SHAPES } from '../constants'
import { cn } from '@/lib/utils'

const SHAPE_ICONS = {
  rectangle: RectangleHorizontal,
  square: Square,
  circle: Circle,
  triangle: Triangle,
}

export default function PlotShapePicker({ value, onChange, disabled, compact = false }) {
  return (
    <div className={cn('grid grid-cols-4 gap-2', compact && 'gap-1.5')}>
      {PLOT_SHAPES.map((shape) => {
        const Icon = SHAPE_ICONS[shape.id] || Square
        const active = value === shape.id
        return (
          <button
            key={shape.id}
            type="button"
            disabled={disabled}
            title={shape.label}
            onClick={() => onChange(shape.id)}
            className={cn(
              'flex flex-col items-center justify-center rounded-lg border transition-all',
              compact ? 'px-1 py-2' : 'px-2 py-3',
              active
                ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8] shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
              disabled && 'opacity-50 pointer-events-none'
            )}
          >
            <Icon className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} strokeWidth={active ? 2.25 : 2} />
            <span className={cn('mt-1 font-medium', compact ? 'text-[9px]' : 'text-[10px]')}>{shape.label}</span>
          </button>
        )
      })}
    </div>
  )
}
