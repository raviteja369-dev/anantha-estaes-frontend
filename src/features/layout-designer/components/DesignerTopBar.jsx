import {
  ArrowLeft, Undo2, Redo2, ZoomIn, ZoomOut, Download, Upload, Check, Plus, ChevronRight, Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import useLayoutStore from '../store/layoutStore'
import { cn } from '@/lib/utils'

function Breadcrumb({ items }) {
  return (
    <nav className="hidden md:flex items-center gap-1 text-sm text-slate-500 min-w-0">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 min-w-0">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
          <span className={cn('truncate', i === items.length - 1 && 'text-slate-900 font-medium')}>
            {item}
          </span>
        </span>
      ))}
    </nav>
  )
}

export default function DesignerTopBar({
  projectName,
  layoutName,
  breadcrumb,
  onBack,
  onSave,
  onPublish,
  onExport,
  onImport,
  onCreateLayout,
  onEditLayout,
  saving,
  readOnly,
  viewMode = false,
}) {
  const { dirty, undo, redo, history, historyIndex, viewport, zoomIn, zoomOut } = useLayoutStore()
  const zoomPct = Math.round(viewport.scale * 100)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
      <Button variant="ghost" size="icon" className="shrink-0" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <div className="min-w-0 flex-1 flex items-center gap-3">
        {breadcrumb?.length ? (
          <Breadcrumb items={breadcrumb} />
        ) : (
          <span className="text-sm font-medium text-slate-800 truncate">
            {layoutName || projectName || 'Layout Designer'}
          </span>
        )}

        {viewMode ? (
          <span className="text-xs font-medium px-2 py-1 rounded-md shrink-0 bg-slate-100 text-slate-600">
            View only
          </span>
        ) : (
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-md shrink-0',
              dirty ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            )}
          >
            {saving ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {viewMode && onEditLayout && (
          <Button size="sm" className="h-8 text-xs bg-[#2563EB] hover:bg-[#1D4ED8] mr-1" onClick={onEditLayout}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit Layout
          </Button>
        )}

        {!viewMode && !readOnly && onCreateLayout && (
          <Button
            size="sm"
            className="h-8 text-xs bg-[#2563EB] hover:bg-[#1D4ED8] mr-1 hidden sm:inline-flex"
            onClick={onCreateLayout}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create Layout
          </Button>
        )}

        {!viewMode && (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Y)">
              <Redo2 className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-6 w-px bg-slate-200" />
          </>
        )}

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut} title="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="min-w-[48px] text-center text-xs font-medium text-slate-600">{zoomPct}%</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn} title="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </Button>

        {!viewMode && (
          <>
            <div className="mx-1 h-6 w-px bg-slate-200" />

            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onExport}>
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>

            {!readOnly && (
              <>
                <Button variant="outline" size="sm" className="h-8 text-xs hidden md:inline-flex" onClick={onImport}>
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  Import
                </Button>
                <Button size="sm" className="h-8 text-xs" onClick={onSave} disabled={saving}>
                  Save
                </Button>
                <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={onPublish} disabled={saving}>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Publish
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </header>
  )
}
