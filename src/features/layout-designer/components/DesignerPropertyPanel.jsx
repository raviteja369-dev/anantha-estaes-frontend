import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import useLayoutStore from '../store/layoutStore'
import { PLOT_STATUS_COLORS, AMENITY_TYPES, ROAD_TYPES } from '../constants'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const LAYER_LABELS = {
  boundary: 'Boundary',
  roads: 'Roads',
  plots: 'Plots',
  amenities: 'Amenities',
  trees: 'Trees',
  labels: 'Labels',
  phases: 'Phases',
}

const panelLabel = 'text-xs font-medium text-slate-300'
const fieldInput = 'h-8 text-xs bg-slate-900/80 border-white/15 text-slate-100 placeholder:text-slate-500'

export default function DesignerPropertyPanel({ phases, employees }) {
  const { elements, selectedIds, updateElement, readOnly, layerVisibility, layerLocks, toggleLayer, toggleLayerLock } = useLayoutStore()
  const selected = elements.find((el) => el.id === selectedIds[0])

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="designer-ui pointer-events-auto w-72 flex flex-col gap-3 max-h-full overflow-y-auto overflow-x-visible glass-panel rounded-2xl border border-white/10 p-4 shadow-2xl text-slate-200"
    >
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Layers</h3>
        <div className="space-y-2.5">
          {Object.entries(layerVisibility).map(([layer, visible]) => {
            const isVisible = visible !== false
            const isLocked = layerLocks[layer]
            return (
              <div key={layer} className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-200 capitalize shrink-0 min-w-[72px]">
                  {LAYER_LABELS[layer] || layer}
                </span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isVisible}
                    onCheckedChange={() => toggleLayer(layer)}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                  <button
                    type="button"
                    className={cn(
                      'text-[10px] font-medium px-2 py-1 rounded-md border transition-colors',
                      isLocked
                        ? 'bg-amber-500/25 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-white/15 hover:bg-slate-700 hover:text-white'
                    )}
                    onClick={() => toggleLayerLock(layer)}
                  >
                    {isLocked ? 'Locked' : 'Lock'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 border-t border-white/10 pt-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Properties</h3>
              <Badge variant="outline" className="text-[10px] capitalize text-slate-200 border-white/20">
                {selected.type}
              </Badge>
            </div>

            {!readOnly && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className={panelLabel}>X</Label>
                    <Input type="number" className={fieldInput} value={Math.round(selected.x)} onChange={(e) => updateElement(selected.id, { x: Number(e.target.value) }, true)} />
                  </div>
                  <div>
                    <Label className={panelLabel}>Y</Label>
                    <Input type="number" className={fieldInput} value={Math.round(selected.y)} onChange={(e) => updateElement(selected.id, { y: Number(e.target.value) }, true)} />
                  </div>
                  <div>
                    <Label className={panelLabel}>Width</Label>
                    <Input type="number" className={fieldInput} value={Math.round(selected.width || 0)} onChange={(e) => updateElement(selected.id, { width: Number(e.target.value) }, true)} />
                  </div>
                  <div>
                    <Label className={panelLabel}>Height</Label>
                    <Input type="number" className={fieldInput} value={Math.round(selected.height || 0)} onChange={(e) => updateElement(selected.id, { height: Number(e.target.value) }, true)} />
                  </div>
                  <div className="col-span-2">
                    <Label className={panelLabel}>Rotation</Label>
                    <Input type="number" className={fieldInput} value={Math.round(selected.rotation || 0)} onChange={(e) => updateElement(selected.id, { rotation: Number(e.target.value) }, true)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className={panelLabel}>Fill</Label>
                    <Input type="color" className="h-9 p-1 bg-slate-900/80 border-white/15" value={selected.fillColor?.startsWith('#') ? selected.fillColor : '#22C55E'} onChange={(e) => updateElement(selected.id, { fillColor: e.target.value }, true)} />
                  </div>
                  <div>
                    <Label className={panelLabel}>Border</Label>
                    <Input type="color" className="h-9 p-1 bg-slate-900/80 border-white/15" value={selected.strokeColor?.startsWith('#') ? selected.strokeColor : '#15803D'} onChange={(e) => updateElement(selected.id, { strokeColor: e.target.value }, true)} />
                  </div>
                </div>
              </>
            )}

            {selected.type === 'plot' && (
              <PlotMetadataFields selected={selected} readOnly={readOnly} phases={phases} employees={employees} updateElement={updateElement} />
            )}

            {selected.type === 'road' && !readOnly && (
              <>
                <div>
                  <Label className={panelLabel}>Road Name</Label>
                  <Input className={fieldInput} value={selected.metadata?.roadName || ''} onChange={(e) => updateElement(selected.id, { metadata: { ...selected.metadata, roadName: e.target.value } }, true)} />
                </div>
                <div>
                  <Label className={panelLabel}>Road Type</Label>
                  <Select value={selected.metadata?.roadType || 'main'} onValueChange={(v) => updateElement(selected.id, { metadata: { ...selected.metadata, roadType: v } }, true)}>
                    <SelectTrigger className={fieldInput}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROAD_TYPES.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className={panelLabel}>Width (ft)</Label>
                    <Input type="number" className={fieldInput} value={selected.metadata?.roadWidth || 30} onChange={(e) => updateElement(selected.id, { metadata: { ...selected.metadata, roadWidth: Number(e.target.value) } }, true)} />
                  </div>
                  <div>
                    <Label className={panelLabel}>Length (ft)</Label>
                    <Input type="number" className={fieldInput} value={selected.metadata?.roadLength || 200} onChange={(e) => updateElement(selected.id, { metadata: { ...selected.metadata, roadLength: Number(e.target.value) } }, true)} />
                  </div>
                </div>
              </>
            )}

            {selected.type === 'text' && !readOnly && (
              <div>
                <Label className={panelLabel}>Text</Label>
                <Input className={fieldInput} value={selected.text || ''} onChange={(e) => updateElement(selected.id, { text: e.target.value }, true)} />
              </div>
            )}

            {selected.type === 'amenity' && !readOnly && (
              <div>
                <Label className={panelLabel}>Amenity Type</Label>
                <Select value={selected.metadata?.amenityType || 'clubhouse'} onValueChange={(v) => {
                  const a = AMENITY_TYPES.find((x) => x.id === v)
                  updateElement(selected.id, { subtype: v, text: a?.icon, fillColor: a?.color, metadata: { ...selected.metadata, amenityType: v } }, true)
                }}>
                  <SelectTrigger className={fieldInput}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AMENITY_TYPES.map((a) => <SelectItem key={a.id} value={a.id}>{a.icon} {a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-slate-400 border-t border-white/10 pt-3"
          >
            Select an element to edit properties
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PlotMetadataFields({ selected, readOnly, phases, employees, updateElement }) {
  const meta = selected.metadata || {}
  const setMeta = (patch) => updateElement(selected.id, { metadata: { ...meta, ...patch } }, true)
  const projectPhases = phases?.filter((p) => String(p.project) === String(meta.project) || String(p.project?._id) === String(meta.project)) || []

  return (
    <div className="space-y-2">
      <div>
        <Label className={panelLabel}>Plot Number</Label>
        <Input className={fieldInput} value={meta.plotNumber || ''} disabled={readOnly} onChange={(e) => setMeta({ plotNumber: e.target.value })} />
      </div>
      <div>
        <Label className={panelLabel}>Plot Name</Label>
        <Input className={fieldInput} value={meta.plotName || ''} disabled={readOnly} onChange={(e) => setMeta({ plotName: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className={panelLabel}>Width</Label>
          <Input type="number" className={fieldInput} value={Math.round(selected.width || 0)} disabled={readOnly} onChange={(e) => updateElement(selected.id, { width: Number(e.target.value) }, true)} />
        </div>
        <div>
          <Label className={panelLabel}>Height</Label>
          <Input type="number" className={fieldInput} value={Math.round(selected.height || 0)} disabled={readOnly} onChange={(e) => updateElement(selected.id, { height: Number(e.target.value) }, true)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className={panelLabel}>Area (sqft)</Label>
          <Input className={fieldInput} value={meta.area || meta.size || ''} disabled={readOnly} onChange={(e) => setMeta({ area: Number(e.target.value), size: e.target.value })} />
        </div>
        <div>
          <Label className={panelLabel}>Price (₹)</Label>
          <Input type="number" className={fieldInput} value={meta.price || ''} disabled={readOnly} onChange={(e) => setMeta({ price: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <Label className={panelLabel}>Status</Label>
        <div className={`${fieldInput} flex items-center bg-slate-50 text-slate-600`}>
          {(PLOT_STATUS_COLORS[meta.status] || PLOT_STATUS_COLORS.available).label}
        </div>
      </div>
      <div>
        <Label className={panelLabel}>Owner</Label>
        <Input className={fieldInput} value={meta.owner || ''} disabled={readOnly} placeholder="Customer name" onChange={(e) => setMeta({ owner: e.target.value })} />
      </div>
      <div>
        <Label className={panelLabel}>Phase</Label>
        <Select value={meta.phase || ''} disabled={readOnly} onValueChange={(v) => setMeta({ phase: v })}>
          <SelectTrigger className={fieldInput}><SelectValue placeholder="Select phase" /></SelectTrigger>
          <SelectContent>
            {projectPhases.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className={panelLabel}>Assigned Employee</Label>
        <Select value={meta.employee || 'none'} disabled={readOnly} onValueChange={(v) => setMeta({ employee: v === 'none' ? '' : v })}>
          <SelectTrigger className={fieldInput}><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {employees?.map((e) => <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className={panelLabel}>Notes</Label>
        <Textarea className="text-xs bg-slate-900/80 border-white/15 text-slate-100" value={meta.notes || ''} disabled={readOnly} rows={2} onChange={(e) => setMeta({ notes: e.target.value })} />
      </div>
      {meta.price > 0 && (
        <p className="text-xs text-slate-400">Display: {formatCurrency(meta.price)}</p>
      )}
    </div>
  )
}
