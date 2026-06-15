import { Switch } from '@/components/ui/switch'
import useLayoutStore from '../store/layoutStore'
import { CANVAS_WORLD } from '../constants'

export default function DesignerStatusBar({ viewMode = false }) {
  const {
    pointerWorld, viewport, snapToGrid, showGrid, gridSize,
    toggleSnapToGrid, toggleShowGrid,
  } = useLayoutStore()

  const zoomPct = Math.round(viewport.scale * 100)

  return (
    <footer className="flex h-9 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-4 text-[11px] text-slate-500">
      <div className="flex items-center gap-4">
        <span>
          X: {Math.round(pointerWorld.x)} · Y: {Math.round(pointerWorld.y)}
        </span>
        <span className="hidden sm:inline">Zoom: {zoomPct}%</span>
        <span className="hidden md:inline">
          Canvas: {CANVAS_WORLD.width} × {CANVAS_WORLD.height}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {!viewMode && (
          <>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={snapToGrid} onCheckedChange={toggleSnapToGrid} className="scale-75" />
              <span>Grid snap</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={showGrid} onCheckedChange={toggleShowGrid} className="scale-75" />
              <span>Show grid ({gridSize}px)</span>
            </label>
          </>
        )}
        {viewMode && <span className="text-slate-400">Pan and zoom to explore</span>}
      </div>
    </footer>
  )
}
