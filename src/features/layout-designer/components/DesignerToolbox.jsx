import {
  MousePointer2, Hand, Square, Route, Trees, TreePine, Building2, Type, MapPin, Trash2, Flower2,
} from 'lucide-react'
import { TOOL_GROUPS, AMENITY_TYPES, ROAD_TYPES } from '../constants'
import useLayoutStore from '../store/layoutStore'
import { cn } from '@/lib/utils'
import PlotShapePicker from './PlotShapePicker'

const ICONS = {
  select: MousePointer2,
  hand: Hand,
  plot: Square,
  road: Route,
  park: Flower2,
  trees: TreePine,
  amenity: Building2,
  text: Type,
  marker: MapPin,
}

function ToolItem({ tool, active, onClick }) {
  const Icon = ICONS[tool.id] || Square
  return (
    <button
      type="button"
      title={`${tool.label} (${tool.shortcut})`}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
        active
          ? 'bg-[#2563EB] text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 2} />
      <span className="flex-1 text-sm font-medium">{tool.label}</span>
      <kbd className={cn(
        'text-[10px] font-mono px-1.5 py-0.5 rounded border',
        active ? 'border-white/30 text-white/80' : 'border-slate-200 text-slate-400 bg-slate-50'
      )}>
        {tool.shortcut}
      </kbd>
    </button>
  )
}

export default function DesignerToolbox() {
  const {
    activeTool, setActiveTool, readOnly, deleteSelected, selectedIds,
    amenitySubtype, setAmenitySubtype, roadSubtype, setRoadSubtype,
    activePlotShape, setActivePlotShape,
  } = useLayoutStore()

  if (readOnly) {
    return (
      <aside className="w-[260px] shrink-0 border-r border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">View Mode</p>
        <ToolItem tool={{ id: 'hand', label: 'Pan', shortcut: 'H' }} active={activeTool === 'hand'} onClick={() => setActiveTool('hand')} />
      </aside>
    )
  }

  return (
    <aside className="w-[260px] shrink-0 flex flex-col border-r border-slate-200 bg-white overflow-y-auto">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Toolbox</h2>
        <p className="text-xs text-slate-500 mt-0.5">Select a tool, then click or drag on canvas</p>
      </div>

      <div className="flex-1 p-3 space-y-5">
        {TOOL_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.tools.map((tool) => (
                <ToolItem
                  key={tool.id}
                  tool={tool}
                  active={activeTool === tool.id}
                  onClick={() => setActiveTool(tool.id)}
                />
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
            Actions
          </p>
          <button
            type="button"
            onClick={deleteSelected}
            disabled={!selectedIds.length}
            title="Delete selected (Del)"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-sm font-medium">Delete</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-red-200 text-red-400 bg-red-50">Del</kbd>
          </button>
        </div>

        {(activeTool === 'amenity' || activeTool === 'road' || activeTool === 'plot') && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <p className="text-xs font-medium text-slate-600">Tool options</p>
            {activeTool === 'plot' && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500">Default plot shape for new plots</p>
                <PlotShapePicker value={activePlotShape} onChange={setActivePlotShape} compact />
              </div>
            )}
            {activeTool === 'amenity' && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500">Choose amenity to place</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {AMENITY_TYPES.map((a) => {
                    const sel = amenitySubtype === a.id
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAmenitySubtype(a.id)}
                        title={a.label}
                        className={cn(
                          'flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-[11px] font-medium transition-all',
                          sel
                            ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8] ring-1 ring-[#2563EB]/30'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        <span className="text-base leading-none">{a.icon}</span>
                        <span className="truncate">{a.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            {activeTool === 'road' && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500">Road type</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {ROAD_TYPES.map((r) => {
                    const sel = roadSubtype === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRoadSubtype(r.id)}
                        className={cn(
                          'flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-xs font-medium transition-all',
                          sel
                            ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8] ring-1 ring-[#2563EB]/30'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        <span>{r.label}</span>
                        <span className="text-[10px] text-slate-400">{r.defaultWidth}ft</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/80">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <strong className="text-slate-600">Tip:</strong> Drag on canvas to draw shapes. Use Select to move and resize.
        </p>
      </div>
    </aside>
  )
}
