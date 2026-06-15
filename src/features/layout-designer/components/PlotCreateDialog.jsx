import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { phasesAPI } from '@/services/api'
import useLayoutStore from '../store/layoutStore'
import { PLOT_STATUS_COLORS } from '../constants'
import PlotShapePicker from './PlotShapePicker'

const FACINGS = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']

export default function PlotCreateDialog({ plotId, phases: phasesProp, onClose }) {
  const { elements, updateElement, setPendingPlotId, phaseId, projectId } = useLayoutStore()
  const element = elements.find((e) => e.id === plotId)
  const meta = element?.metadata || {}

  const { data: fetchedPhases } = useQuery({
    queryKey: ['phases', projectId],
    queryFn: () => phasesAPI.getByProject(projectId).then((r) => r.data),
    enabled: !!projectId && !!plotId,
  })

  const phaseOptions = useMemo(() => {
    const list = phasesProp?.length ? phasesProp : fetchedPhases
    return Array.isArray(list) ? list : []
  }, [phasesProp, fetchedPhases])

  const [plotNumber, setPlotNumber] = useState('')
  const [price, setPrice] = useState('')
  const [facing, setFacing] = useState('East')
  const [phase, setPhase] = useState('')
  const [shape, setShape] = useState('rectangle')

  useEffect(() => {
    if (!element) return
    setPlotNumber(meta.plotNumber || '')
    setPrice(String(meta.price || ''))
    setFacing(meta.facing || 'East')
    setShape(element.shape || 'rectangle')
    const initialPhase = meta.phase || phaseId || phaseOptions[0]?._id || ''
    setPhase(initialPhase)
  }, [element, plotId, meta.plotNumber, meta.price, meta.facing, meta.phase, phaseId, phaseOptions, element?.shape])

  if (!element || element.type !== 'plot') return null

  const handleSave = () => {
    const colors = PLOT_STATUS_COLORS.available
    const resolvedPhase = phase || phaseId || phaseOptions[0]?._id || ''
    updateElement(plotId, {
      shape,
      metadata: {
        ...meta,
        plotNumber,
        price: Number(price) || 0,
        facing,
        status: 'available',
        phase: resolvedPhase,
      },
      fillColor: colors.fill,
      strokeColor: colors.stroke,
    })
    setPendingPlotId(null)
    onClose?.()
  }

  const handleOpenChange = (open) => {
    if (!open) {
      setPendingPlotId(null)
      onClose?.()
    }
  }

  const area = meta.area || Math.round((element.width || 0) * (element.height || 0) * 10)

  return (
    <Dialog open={!!plotId} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Plot Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Dimensions: {Math.round(element.width)} × {Math.round(element.height)} units · Area: ~{area} sqft
          </div>
          <div className="space-y-2">
            <Label>Plot Shape</Label>
            <PlotShapePicker value={shape} onChange={setShape} compact />
          </div>
          <div className="space-y-2">
            <Label>Plot Number</Label>
            <Input value={plotNumber} onChange={(e) => setPlotNumber(e.target.value)} placeholder="e.g. A-12" />
          </div>
          <div className="space-y-2">
            <Label>Price (₹)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>Facing</Label>
            <Select value={facing} onValueChange={setFacing}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="z-[200]">
                {FACINGS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Phase</Label>
            {phaseOptions.length > 0 ? (
              <Select value={phase || phaseOptions[0]._id} onValueChange={setPhase}>
                <SelectTrigger><SelectValue placeholder="Select phase" /></SelectTrigger>
                <SelectContent className="z-[200]">
                  {phaseOptions.map((p) => (
                    <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                No phases yet. Add phases in the Projects page, then assign this plot.
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
            New plots are always <strong>Available</strong>. Status changes only through the booking workflow.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Skip</Button>
          <Button onClick={handleSave}>Save Plot</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
