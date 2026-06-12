import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCcw, Trees } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PlotCard from './PlotCard'
import { PLOT_STATUS } from '@/lib/utils'

export default function PlotMap({ plots, phases, onPlotClick, selectedPlot, onPositionChange, isAdmin }) {
  const [zoom, setZoom] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [draggedPlot, setDraggedPlot] = useState(null)

  const filteredPlots = useMemo(() => {
    return plots.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (phaseFilter !== 'all' && p.phase?._id !== phaseFilter && p.phase !== phaseFilter) return false
      return true
    })
  }, [plots, statusFilter, phaseFilter])

  const groupedByPhase = useMemo(() => {
    const groups = {}
    filteredPlots.forEach((plot) => {
      const phaseId = plot.phase?._id || plot.phase
      const phaseName = plot.phase?.name || 'Unknown'
      if (!groups[phaseId]) groups[phaseId] = { name: phaseName, plots: [] }
      groups[phaseId].plots.push(plot)
    })
    return Object.values(groups)
  }, [filteredPlots])

  const handleDrop = (e, targetPhaseId) => {
    e.preventDefault()
    if (!draggedPlot || !isAdmin) return
    onPositionChange?.(draggedPlot._id, { phase: targetPhaseId })
    setDraggedPlot(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Layout Map</h3>
          <div className="flex items-center gap-3 text-xs">
            {Object.entries(PLOT_STATUS).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-full ${val.color}`} />
                <span className="text-muted-foreground">{val.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="All Phases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Phases</SelectItem>
              {phases?.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(PLOT_STATUS).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.min(z + 0.1, 1.5))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(1)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        className="rounded-2xl border border-border bg-card p-6 overflow-auto"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        {groupedByPhase.map((group, gi) => (
          <div key={group.name}>
            {gi > 0 && (
              <div className="flex items-center gap-2 my-4 px-2">
                <div className="flex-1 h-px bg-border" />
                <Trees className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground font-medium">Road</span>
                <Trees className="h-4 w-4 text-green-600" />
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">{group.name}</h4>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, group.plots[0]?.phase?._id)}
            >
              {group.plots.map((plot) => (
                <PlotCard
                  key={plot._id}
                  plot={plot}
                  selected={selectedPlot?._id === plot._id}
                  onClick={onPlotClick}
                  draggable={isAdmin}
                  onDragStart={() => setDraggedPlot(plot)}
                  onDragEnd={() => setDraggedPlot(null)}
                />
              ))}
            </div>
          </div>
        ))}
        {!groupedByPhase.length && (
          <div className="text-center py-16 text-muted-foreground">No plots found. Create plots to see the layout map.</div>
        )}
      </motion.div>
    </div>
  )
}
