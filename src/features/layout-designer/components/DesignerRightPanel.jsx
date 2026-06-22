import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import useLayoutStore from '../store/layoutStore'
import { PLOT_STATUS_COLORS, AMENITY_TYPES, ROAD_TYPES, LAYER_PANEL_KEYS } from '../constants'
import { formatCurrency, cn } from '@/lib/utils'
import PlotShapePicker from './PlotShapePicker'

const LAYER_LABELS = {
  boundary: 'Boundary',
  roads: 'Roads',
  plots: 'Plots',
  amenities: 'Amenities',
  trees: 'Trees',
  labels: 'Labels',
}

const TABS = [
  { id: 'properties', label: 'Properties' },
  { id: 'layers', label: 'Layers' },
  { id: 'analytics', label: 'Analytics' },
]

export default function DesignerRightPanel({ phases }) {
  const [tab, setTab] = useState('properties')
  const store = useLayoutStore()
  const { elements, selectedIds, readOnly, layerVisibility, layerLocks, toggleLayer, toggleLayerLock, updateElement } = store
  const selected = elements.find((el) => el.id === selectedIds[0])

  const plots = elements.filter((e) => e.type === 'plot')
  const analytics = {
    total: plots.length,
    available: plots.filter((p) => p.metadata?.status === 'available').length,
    sold: plots.filter((p) => p.metadata?.status === 'sold').length,
    reserved: plots.filter((p) => p.metadata?.status === 'reserved').length,
    revenue: plots.reduce((sum, p) => sum + (Number(p.metadata?.price) || 0), 0),
  }

  return (
    <aside className="w-[300px] shrink-0 flex flex-col border-l border-slate-200 bg-white overflow-hidden">
      <div className="flex border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 py-3 text-xs font-semibold transition-colors',
              tab === t.id
                ? 'text-[#2563EB] border-b-2 border-[#2563EB] bg-[#EFF6FF]/60'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'properties' && (
          <PropertiesTab selected={selected} readOnly={readOnly} phases={phases} updateElement={updateElement} />
        )}
        {tab === 'layers' && (
          <LayersTab
            layerVisibility={layerVisibility}
            layerLocks={layerLocks}
            toggleLayer={toggleLayer}
            toggleLayerLock={toggleLayerLock}
          />
        )}
        {tab === 'analytics' && <AnalyticsTab analytics={analytics} />}
      </div>
    </aside>
  )
}

function PropertiesTab({ selected, readOnly, phases, updateElement }) {
  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
          <span className="text-xl">↖</span>
        </div>
        <p className="text-sm font-medium text-slate-700">Nothing selected</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
          Click an element on the canvas to view and edit its properties.
        </p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selected.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Properties</h3>
          <Badge variant="outline" className="text-[10px] capitalize">{selected.type}</Badge>
        </div>

        {selected.type === 'plot' && (
          <PlotFields selected={selected} readOnly={readOnly} phases={phases} updateElement={updateElement} />
        )}

        {selected.type === 'road' && !readOnly && (
          <RoadFields selected={selected} updateElement={updateElement} />
        )}

        {selected.type === 'text' && !readOnly && (
          <div className="space-y-2">
            <Label className="text-xs">Label text</Label>
            <Input className="h-9 text-sm" value={selected.text || ''} onChange={(e) => updateElement(selected.id, { text: e.target.value }, true)} />
          </div>
        )}

        {selected.type === 'amenity' && !readOnly && (
          <AmenityFields selected={selected} updateElement={updateElement} />
        )}

        {!readOnly && selected.type !== 'plot' && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div>
              <Label className="text-xs">Width</Label>
              <Input type="number" className="h-8 text-xs" value={Math.round(selected.width || 0)} onChange={(e) => updateElement(selected.id, { width: Number(e.target.value) }, true)} />
            </div>
            <div>
              <Label className="text-xs">Height</Label>
              <Input type="number" className="h-8 text-xs" value={Math.round(selected.height || 0)} onChange={(e) => updateElement(selected.id, { height: Number(e.target.value) }, true)} />
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

function PlotFields({ selected, readOnly, phases, updateElement }) {
  const { gridSize, resizePlot, projectId } = useLayoutStore()
  const meta = selected.metadata || {}
  const setMeta = (patch) => updateElement(selected.id, {
    metadata: { ...meta, ...patch, project: meta.project || projectId },
  }, true)
  const projectPhases = phases || []
  const phaseValue = meta.phase || projectPhases[0]?._id || ''
  const area = meta.area || Math.round((selected.width || 0) * (selected.height || 0) * 10)
  const step = gridSize || 20
  const shape = selected.shape || 'rectangle'

  const setShape = (nextShape) => {
    updateElement(selected.id, { shape: nextShape }, true)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Plot Shape</Label>
        <PlotShapePicker value={shape} onChange={setShape} disabled={readOnly} compact />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Plot Number</Label>
        <Input className="h-9 text-sm" value={meta.plotNumber || ''} disabled={readOnly} onChange={(e) => setMeta({ plotNumber: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Size</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500">Width</span>
            <div className="flex items-center gap-1">
              {!readOnly && (
                <button type="button" className="h-8 w-8 rounded-md border border-slate-200 text-sm hover:bg-slate-50" onClick={() => resizePlot(selected.id, -step, 0)}>−</button>
              )}
              <Input
                type="number"
                className="h-8 text-sm text-center px-1"
                value={Math.round(selected.width || 0)}
                disabled={readOnly || shape === 'square' || shape === 'circle'}
                onChange={(e) => updateElement(selected.id, { width: Number(e.target.value) }, true)}
              />
              {!readOnly && (
                <button type="button" className="h-8 w-8 rounded-md border border-slate-200 text-sm hover:bg-slate-50" onClick={() => resizePlot(selected.id, step, 0)}>+</button>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500">Height</span>
            <div className="flex items-center gap-1">
              {!readOnly && (
                <button type="button" className="h-8 w-8 rounded-md border border-slate-200 text-sm hover:bg-slate-50" onClick={() => resizePlot(selected.id, 0, -step)}>−</button>
              )}
              <Input
                type="number"
                className="h-8 text-sm text-center px-1"
                value={Math.round(selected.height || 0)}
                disabled={readOnly || shape === 'square' || shape === 'circle'}
                onChange={(e) => updateElement(selected.id, { height: Number(e.target.value) }, true)}
              />
              {!readOnly && (
                <button type="button" className="h-8 w-8 rounded-md border border-slate-200 text-sm hover:bg-slate-50" onClick={() => resizePlot(selected.id, 0, step)}>+</button>
              )}
            </div>
          </div>
        </div>
        {(shape === 'square' || shape === 'circle') && (
          <p className="text-[10px] text-slate-500">Drag corner handles or use +/− to resize evenly.</p>
        )}
        {shape === 'rectangle' || shape === 'triangle' ? (
          <p className="text-[10px] text-slate-500">Use Select tool and drag blue handles on canvas to resize.</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Area (sqft)</Label>
        <Input className="h-9 text-sm bg-slate-50" value={area} readOnly />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Price (₹)</Label>
        <Input type="number" className="h-9 text-sm" value={meta.price || ''} disabled={readOnly} onChange={(e) => setMeta({ price: Number(e.target.value) })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Facing</Label>
        <Input className="h-9 text-sm" value={meta.facing || ''} disabled={readOnly} onChange={(e) => setMeta({ facing: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Status</Label>
        <div className="h-9 flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
          {(PLOT_STATUS_COLORS[meta.status] || PLOT_STATUS_COLORS.available).label}
          <span className="ml-2 text-xs text-slate-400">(via bookings only)</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Phase</Label>
        {projectPhases.length > 0 ? (
          <Select
            value={phaseValue}
            disabled={readOnly}
            onValueChange={(v) => setMeta({ phase: v })}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
              {projectPhases.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-xs text-slate-500 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2">
            No phases for this project. Add phases in Projects.
          </p>
        )}
      </div>
      {meta.price > 0 && (
        <p className="text-xs text-slate-500">Display: {formatCurrency(meta.price)}</p>
      )}
    </div>
  )
}

function RoadFields({ selected, updateElement }) {
  const meta = selected.metadata || {}
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Road Name</Label>
        <Input className="h-9 text-sm" value={meta.roadName || ''} onChange={(e) => updateElement(selected.id, { metadata: { ...meta, roadName: e.target.value } }, true)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Road Type</Label>
        <Select value={meta.roadType || 'main'} onValueChange={(v) => updateElement(selected.id, { metadata: { ...meta, roadType: v } }, true)}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ROAD_TYPES.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function AmenityFields({ selected, updateElement }) {
  const meta = selected.metadata || {}
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">Amenity Type</Label>
      <Select value={meta.amenityType || 'clubhouse'} onValueChange={(v) => {
        const a = AMENITY_TYPES.find((x) => x.id === v)
        updateElement(selected.id, { subtype: v, text: a?.icon, fillColor: a?.color, metadata: { ...meta, amenityType: v, label: a?.label } }, true)
      }}>
        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          {AMENITY_TYPES.map((a) => <SelectItem key={a.id} value={a.id}>{a.icon} {a.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

function LayersTab({ layerVisibility, layerLocks, toggleLayer, toggleLayerLock }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 mb-3">Toggle visibility and lock layers.</p>
      {LAYER_PANEL_KEYS.map((layer) => {
        const visible = layerVisibility[layer] !== false
        const locked = layerLocks[layer]
        return (
          <div key={layer} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
            <span className="text-sm font-medium text-slate-700">{LAYER_LABELS[layer]}</span>
            <div className="flex items-center gap-2">
              <Switch checked={visible} onCheckedChange={() => toggleLayer(layer)} />
              <button
                type="button"
                onClick={() => toggleLayerLock(layer)}
                className={cn(
                  'text-[10px] font-medium px-2 py-1 rounded-md border transition-colors',
                  locked ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                )}
              >
                {locked ? 'Locked' : 'Lock'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AnalyticsTab({ analytics }) {
  const items = [
    { label: 'Total Plots', value: analytics.total, color: 'text-slate-900' },
    { label: 'Available', value: analytics.available, color: 'text-emerald-600' },
    { label: 'Sold', value: analytics.sold, color: 'text-red-600' },
    { label: 'Reserved', value: analytics.reserved, color: 'text-amber-600' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">Live summary from your layout.</p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500">{item.label}</p>
            <p className={cn('text-2xl font-bold mt-1', item.color)}>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#DDD6FE] bg-[#EDE9FE] p-4">
        <p className="text-[11px] font-medium text-[#7C3AED]">Total Revenue</p>
        <p className="text-xl font-bold text-[#5B21B6] mt-1">{formatCurrency(analytics.revenue)}</p>
        <p className="text-[10px] text-[#7C3AED] mt-1">Based on plot prices in layout</p>
      </div>
    </div>
  )
}
