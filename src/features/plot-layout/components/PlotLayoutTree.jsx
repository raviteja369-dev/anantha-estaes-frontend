import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ChevronDown, Map, Layers, Search } from 'lucide-react'
import { plotsAPI, phasesAPI } from '@/services/api'
import { cn } from '@/lib/utils'

function PhaseList({ plotId, plotName, expanded, phaseSearch, selectedPhaseId, onPhaseSelect }) {
  const { data: phases, isLoading } = useQuery({
    queryKey: ['phases-published', plotId],
    queryFn: () => phasesAPI.getAll({ plotId, status: 'published' }).then((r) => r.data),
    enabled: expanded,
    staleTime: 60000,
  })

  const filtered = useMemo(() => {
    if (!phases) return []
    if (!phaseSearch.trim()) return phases
    const q = phaseSearch.toLowerCase()
    return phases.filter((p) => p.name.toLowerCase().includes(q))
  }, [phases, phaseSearch])

  if (!expanded) return null

  if (isLoading) {
    return (
      <div className="ml-6 space-y-2 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded-md bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!filtered.length) {
    return (
      <p className="ml-8 py-2 text-xs text-slate-400">No phases found</p>
    )
  }

  return (
    <div className="ml-2 border-l border-slate-200 pl-2 space-y-0.5 py-1">
      {filtered.map((phase) => (
        <button
          key={phase._id}
          type="button"
          onClick={() => onPhaseSelect({ plotId, plotName, phase })}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all',
            selectedPhaseId === phase._id
              ? 'bg-indigo-50 text-indigo-700 font-medium'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          )}
        >
          <Layers className="h-3.5 w-3.5 shrink-0 opacity-60" />
          <span className="truncate">{phase.name}</span>
        </button>
      ))}
    </div>
  )
}

export default function PlotLayoutTree({ selectedPlotId, selectedPhaseId, onPhaseSelect }) {
  const [expandedPlots, setExpandedPlots] = useState(new Set())
  const [plotSearch, setPlotSearch] = useState('')
  const [phaseSearch, setPhaseSearch] = useState('')

  const { data: plots, isLoading } = useQuery({
    queryKey: ['published-plot-layouts'],
    queryFn: () => plotsAPI.getPublishedLayouts().then((r) => r.data),
    staleTime: 60000,
  })

  const filteredPlots = useMemo(() => {
    if (!plots) return []
    if (!plotSearch.trim()) return plots
    const q = plotSearch.toLowerCase()
    return plots.filter((p) => p.name.toLowerCase().includes(q))
  }, [plots, plotSearch])

  const togglePlot = (plotId) => {
    setExpandedPlots((prev) => {
      const next = new Set(prev)
      if (next.has(plotId)) next.delete(plotId)
      else next.add(plotId)
      return next
    })
  }

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Map className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-900">Plot Layout</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search plots…"
            value={plotSearch}
            onChange={(e) => setPlotSearch(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        {expandedPlots.size > 0 && (
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search phases…"
              value={phaseSearch}
              onChange={(e) => setPhaseSearch(e.target.value)}
              className="w-full h-8 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : !filteredPlots.length ? (
          <div className="p-4 text-center">
            <p className="text-sm text-slate-500">No published plots found</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredPlots.map((plot) => {
              const expanded = expandedPlots.has(plot._id)
              return (
                <div key={plot._id}>
                  <button
                    type="button"
                    onClick={() => togglePlot(plot._id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm font-medium transition-all',
                      selectedPlotId === plot._id && !selectedPhaseId
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    <span className="truncate">{plot.name}</span>
                  </button>
                  <PhaseList
                    plotId={plot._id}
                    plotName={plot.name}
                    expanded={expanded}
                    phaseSearch={phaseSearch}
                    selectedPhaseId={selectedPhaseId}
                    onPhaseSelect={onPhaseSelect}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
