import { Square, Route, Upload, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useLayoutStore from '../store/layoutStore'

export default function CanvasOnboarding({ onImport, canvasWidth, canvasHeight }) {
  const { readOnly, setActiveTool, quickAddAtCenter, elements } = useLayoutStore()

  if (readOnly || elements.length > 0) return null

  const start = (tool) => {
    setActiveTool(tool)
    if (tool !== 'import') quickAddAtCenter(tool, canvasWidth, canvasHeight)
    else onImport?.()
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto max-w-md text-center px-6">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg border border-slate-200">
          <Map className="h-10 w-10 text-indigo-500" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Start Designing Your Layout</h2>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Create plots, roads, and amenities visually. Pick a starting point below or use the toolbox on the left.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-white" onClick={() => start('plot')}>
            <Square className="h-5 w-5 text-emerald-600" />
            <span className="text-xs font-medium">Create Plot</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-white" onClick={() => start('road')}>
            <Route className="h-5 w-5 text-slate-600" />
            <span className="text-xs font-medium">Create Road</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-white" onClick={() => start('import')}>
            <Upload className="h-5 w-5 text-indigo-600" />
            <span className="text-xs font-medium">Import Layout</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
