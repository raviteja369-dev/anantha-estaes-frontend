import { motion } from 'framer-motion'
import {
  MousePointer2, Hand, Square, Route, Trees, Building2, Type, Fence,
  Undo2, Redo2, Copy, Clipboard, Trash2, ZoomIn, ZoomOut, Save, Download,
  Maximize2, RotateCcw,
} from 'lucide-react'
import { TOOLS, AMENITY_TYPES, ROAD_TYPES } from '../constants'
import useLayoutStore from '../store/layoutStore'
import { cn } from '@/lib/utils'

const ICONS = {
  select: MousePointer2,
  hand: Hand,
  plot: Square,
  road: Route,
  park: Trees,
  amenity: Building2,
  text: Type,
  boundary: Fence,
}

const TOOL_LABELS = {
  select: 'Pointer',
  hand: 'Hand',
  plot: 'Plot',
  road: 'Road',
  park: 'Park',
  amenity: 'Amenity',
  text: 'Text',
  boundary: 'Boundary',
}

function ToolbarDivider({ className }) {
  return <div className={cn('shrink-0 bg-white/10 md:w-full md:h-px max-md:w-px max-md:h-10 max-md:mx-1', className)} />
}

function ToolButton({ icon: Icon, label, active, onClick, disabled, destructive, className }) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center justify-center gap-1.5',
        'min-h-[56px] min-w-[56px] w-full max-md:min-w-[56px] max-md:w-[56px] max-md:shrink-0',
        'rounded-2xl px-2 py-2',
        'transition-all duration-200 ease-out',
        'overflow-visible',
        'disabled:opacity-40 disabled:pointer-events-none disabled:scale-100',
        !active && !destructive && [
          'text-slate-400',
          'hover:scale-105 hover:text-white',
          'hover:bg-blue-500/10 hover:shadow-[0_0_24px_rgba(59,130,246,0.35)]',
        ],
        active && [
          'bg-[#2563EB] text-white',
          'shadow-lg shadow-[#2563EB]/40',
          'ring-1 ring-[#2563EB]/50',
        ],
        destructive && !active && 'text-red-400 hover:scale-105 hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
        className
      )}
    >
      <Icon
        className={cn('h-6 w-6 shrink-0', active ? 'text-white' : 'text-current')}
        strokeWidth={active ? 2.25 : 2}
      />
      <span
        className={cn(
          'text-[10px] font-medium leading-none text-center max-w-full truncate',
          'max-md:hidden',
          active ? 'text-white/95' : 'text-slate-500 group-hover:text-slate-200'
        )}
      >
        {label}
      </span>
    </button>
  )
}

function ToolbarShell({ children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'pointer-events-auto',
        'border border-white/[0.12]',
        'bg-slate-950/80 backdrop-blur-2xl',
        'shadow-[0_8px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.04)_inset]',
        'overflow-visible',
        'md:flex md:flex-col md:items-center md:justify-start md:gap-4',
        'md:w-[110px] md:max-h-[calc(100vh-8rem)] md:overflow-y-auto md:overflow-x-visible',
        'md:rounded-[24px] md:p-4',
        'max-md:flex max-md:flex-row max-md:flex-wrap max-md:items-center max-md:justify-center',
        'max-md:gap-2 max-md:px-3 max-md:py-2.5',
        'max-md:rounded-2xl max-md:max-w-[min(100%,calc(100vw-1rem))]',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export default function DesignerToolbar({ onSave, onExport, onCenterView, onResetCanvas }) {
  const {
    activeTool, setActiveTool, readOnly, undo, redo, history, historyIndex,
    copySelected, pasteClipboard, deleteSelected,
    zoomIn, zoomOut, amenitySubtype, setAmenitySubtype,
    roadSubtype, setRoadSubtype, dirty, saving,
  } = useLayoutStore()

  if (readOnly) {
    return (
      <ToolbarShell>
        <ToolButton icon={Hand} label="Hand" active onClick={() => {}} />
        <ToolbarDivider />
        <ToolButton icon={ZoomIn} label="Zoom In" onClick={zoomIn} />
        <ToolButton icon={ZoomOut} label="Zoom Out" onClick={zoomOut} />
        <ToolButton icon={Maximize2} label="Center" onClick={onCenterView} />
      </ToolbarShell>
    )
  }

  return (
    <ToolbarShell>
      <p className="hidden md:block text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold w-full text-center pb-1">
        Tools
      </p>

      <div className="flex flex-col items-center gap-2 w-full max-md:flex-row max-md:flex-wrap max-md:justify-center max-md:gap-2 max-md:w-auto">
        {TOOLS.map((tool) => {
          const Icon = ICONS[tool.id] || Square
          const label = TOOL_LABELS[tool.id] || tool.label
          return (
            <ToolButton
              key={tool.id}
              icon={Icon}
              label={label}
              active={activeTool === tool.id}
              onClick={() => setActiveTool(tool.id)}
            />
          )
        })}
      </div>

      {(activeTool === 'amenity' || activeTool === 'road') && (
        <div className="w-full max-md:min-w-full max-md:basis-full">
          {activeTool === 'amenity' && (
            <select
              className="w-full text-[10px] bg-slate-900/90 border border-white/10 rounded-xl px-2 py-2 text-slate-200 outline-none focus:ring-1 focus:ring-[#2563EB]"
              value={amenitySubtype}
              onChange={(e) => setAmenitySubtype(e.target.value)}
            >
              {AMENITY_TYPES.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          )}
          {activeTool === 'road' && (
            <select
              className="w-full text-[10px] bg-slate-900/90 border border-white/10 rounded-xl px-2 py-2 text-slate-200 outline-none focus:ring-1 focus:ring-[#2563EB]"
              value={roadSubtype}
              onChange={(e) => setRoadSubtype(e.target.value)}
            >
              {ROAD_TYPES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          )}
        </div>
      )}

      <ToolbarDivider />

      <div className="flex flex-col items-center gap-2 w-full max-md:flex-row max-md:flex-wrap max-md:justify-center max-md:w-auto">
        <ToolButton icon={Undo2} label="Undo" onClick={undo} disabled={historyIndex <= 0} />
        <ToolButton icon={Redo2} label="Redo" onClick={redo} disabled={historyIndex >= history.length - 1} />
        <ToolButton icon={Copy} label="Copy" onClick={copySelected} />
        <ToolButton icon={Clipboard} label="Paste" onClick={pasteClipboard} />
        <ToolButton icon={Trash2} label="Delete" destructive onClick={deleteSelected} />
      </div>

      <ToolbarDivider />

      <div className="flex flex-col items-center gap-2 w-full max-md:flex-row max-md:flex-wrap max-md:justify-center max-md:w-auto">
        <ToolButton icon={Maximize2} label="Center" onClick={onCenterView} />
        <ToolButton icon={RotateCcw} label="Reset" onClick={onResetCanvas} />
        <ToolButton icon={ZoomIn} label="Zoom In" onClick={zoomIn} />
        <ToolButton icon={ZoomOut} label="Zoom Out" onClick={zoomOut} />
      </div>

      <ToolbarDivider />

      <div className="flex flex-col items-center gap-2 w-full max-md:flex-row max-md:justify-center max-md:w-auto">
        <ToolButton
          icon={Save}
          label="Save"
          onClick={onSave}
          disabled={saving}
          className={dirty && !saving ? 'text-amber-400 hover:text-amber-300' : undefined}
        />
        <ToolButton icon={Download} label="Export" onClick={onExport} />
      </div>

      <p className="hidden md:block text-[9px] text-slate-600 text-center leading-snug w-full pt-1">
        Drag canvas to draw
      </p>
    </ToolbarShell>
  )
}
