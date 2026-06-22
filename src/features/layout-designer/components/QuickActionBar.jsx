import { Square, Route, Flower2, TreePine, Building2 } from 'lucide-react'
import { QUICK_ACTIONS } from '../constants'
import useLayoutStore from '../store/layoutStore'
import { cn } from '@/lib/utils'

const ICONS = { plot: Square, road: Route, park: Flower2, trees: TreePine, amenity: Building2 }

export default function QuickActionBar({ canvasWidth, canvasHeight }) {
  const { readOnly, setActiveTool, quickAddAtCenter } = useLayoutStore()

  if (readOnly) return null

  const handleQuickAdd = (toolId) => {
    setActiveTool(toolId)
    quickAddAtCenter(toolId, canvasWidth, canvasHeight)
  }

  return (
    <div className="shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-500 shrink-0">Quick add</span>
        {QUICK_ACTIONS.map((action) => {
          const Icon = ICONS[action.id] || Plus
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleQuickAdd(action.id)}
              className={cn(
                'group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3',
                'hover:border-[#93C5FD] hover:shadow-md transition-all shrink-0 min-w-[140px]'
              )}
            >
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm', action.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                <p className="text-[11px] text-slate-500">{action.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
