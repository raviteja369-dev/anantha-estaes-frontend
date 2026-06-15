import { useRef, useEffect, useCallback } from 'react'
import { Stage, Layer, Line, Rect, Transformer, Text } from 'react-konva'
import useLayoutStore from '../store/layoutStore'
import CanvasElement from './CanvasElement'
import { snapValue } from '../utils/geometry'
import { CANVAS_WORLD, DRAW_TOOLS, calcArea, normalizePlotDimensions } from '../constants'

export default function DesignerCanvas({ width, height, stageRef: externalRef }) {
  const internalRef = useRef(null)
  const stageRef = externalRef || internalRef
  const transformerRef = useRef(null)
  const isPanning = useRef(false)
  const lastPan = useRef({ x: 0, y: 0 })

  const elements = useLayoutStore((s) => s.elements)
  const selectedIds = useLayoutStore((s) => s.selectedIds)
  const activeTool = useLayoutStore((s) => s.activeTool)
  const viewport = useLayoutStore((s) => s.viewport)
  const gridSize = useLayoutStore((s) => s.gridSize)
  const showGrid = useLayoutStore((s) => s.showGrid)
  const snapToGrid = useLayoutStore((s) => s.snapToGrid)
  const layerLocks = useLayoutStore((s) => s.layerLocks)
  const readOnly = useLayoutStore((s) => s.readOnly)
  const viewerMode = useLayoutStore((s) => s.viewerMode)
  const isCreating = useLayoutStore((s) => s.isCreating)
  const createPreview = useLayoutStore((s) => s.createPreview)
  const isMarquee = useLayoutStore((s) => s.isMarquee)
  const marqueeRect = useLayoutStore((s) => s.marqueeRect)
  const debugMode = useLayoutStore((s) => s.debugMode)

  const getVisibleElements = useLayoutStore((s) => s.getVisibleElements)
  const select = useLayoutStore((s) => s.select)
  const clearSelection = useLayoutStore((s) => s.clearSelection)
  const startCreate = useLayoutStore((s) => s.startCreate)
  const updateCreate = useLayoutStore((s) => s.updateCreate)
  const finishCreate = useLayoutStore((s) => s.finishCreate)
  const cancelCreate = useLayoutStore((s) => s.cancelCreate)
  const updateElement = useLayoutStore((s) => s.updateElement)
  const setViewport = useLayoutStore((s) => s.setViewport)
  const setHoverId = useLayoutStore((s) => s.setHoverId)
  const setPointerWorld = useLayoutStore((s) => s.setPointerWorld)

  const visible = getVisibleElements()

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[LayoutDesigner] elements:', elements.length, 'visible:', visible.length, elements)
    }
  }, [elements, visible])

  useEffect(() => {
    const tr = transformerRef.current
    const stage = stageRef.current
    if (!tr || !stage || readOnly) return
    const nodes = selectedIds.map((id) => stage.findOne(`#node-${id}`)).filter(Boolean)
    tr.nodes(nodes)
    tr.getLayer()?.batchDraw()
  }, [selectedIds, elements, readOnly, stageRef])

  const getPointerWorld = useCallback(() => {
    const stage = stageRef.current
    const pos = stage?.getPointerPosition()
    if (!pos) return null
    return { x: (pos.x - viewport.x) / viewport.scale, y: (pos.y - viewport.y) / viewport.scale }
  }, [viewport, stageRef])

  const handleWheel = useCallback(
    (e) => {
      e.evt.preventDefault()
      const stage = stageRef.current
      if (!stage) return
      const oldScale = viewport.scale
      const pointer = stage.getPointerPosition()
      if (!pointer) return
      const scaleBy = 1.1
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
      const clamped = Math.max(0.05, Math.min(5, newScale))
      const mousePointTo = {
        x: (pointer.x - viewport.x) / oldScale,
        y: (pointer.y - viewport.y) / oldScale,
      }
      setViewport({
        scale: clamped,
        x: pointer.x - mousePointTo.x * clamped,
        y: pointer.y - mousePointTo.y * clamped,
      })
    },
    [viewport, setViewport, stageRef]
  )

  const handleBgMouseDown = (e) => {
    const pos = getPointerWorld()

    if (viewerMode) {
      isPanning.current = true
      lastPan.current = { x: e.evt.clientX, y: e.evt.clientY }
      e.cancelBubble = true
      return
    }

    if (readOnly) return
    if (!pos) return

    if (activeTool === 'hand' || e.evt.button === 1) {
      isPanning.current = true
      lastPan.current = { x: e.evt.clientX, y: e.evt.clientY }
      e.cancelBubble = true
      return
    }

    if (activeTool === 'select' || DRAW_TOOLS.includes(activeTool)) {
      e.cancelBubble = true
      clearSelection()
      startCreate(pos)
    }
  }

  const handleStageMouseMove = (e) => {
    const pos = getPointerWorld()
    if (pos) setPointerWorld(pos)

    if (isPanning.current) {
      const dx = e.evt.clientX - lastPan.current.x
      const dy = e.evt.clientY - lastPan.current.y
      lastPan.current = { x: e.evt.clientX, y: e.evt.clientY }
      setViewport({ x: viewport.x + dx, y: viewport.y + dy })
      return
    }
    if (isCreating || isMarquee) {
      const pos = getPointerWorld()
      if (pos) updateCreate(pos)
    }
  }

  const handleStageMouseUp = () => {
    if (isPanning.current) {
      isPanning.current = false
      return
    }
    if (isCreating || isMarquee) {
      const pos = getPointerWorld()
      if (pos) finishCreate(pos, width, height)
      else cancelCreate()
    }
  }

  const handleElementSelect = (id, multi) => {
    if (viewerMode) {
      const el = elements.find((e) => e.id === id)
      if (el?.type === 'plot') select(id, false)
      return
    }
    if (activeTool === 'select' || readOnly) select(id, multi)
  }

  const handleDragEnd = (id, x, y) => {
    updateElement(id, {
      x: snapValue(Math.max(0, x), gridSize, snapToGrid),
      y: snapValue(Math.max(0, y), gridSize, snapToGrid),
    })
  }

  const gridLines = []
  if (showGrid && width > 0) {
    const step = gridSize
    const viewLeft = -viewport.x / viewport.scale
    const viewTop = -viewport.y / viewport.scale
    const viewRight = viewLeft + width / viewport.scale
    const viewBottom = viewTop + height / viewport.scale
    const startX = Math.floor(viewLeft / step) * step
    const startY = Math.floor(viewTop / step) * step
    for (let i = startX; i < viewRight + step; i += step) {
      gridLines.push(
        <Line key={`v${i}`} points={[i, startY, i, viewBottom + step]} stroke="rgba(100,116,139,0.25)" strokeWidth={1 / viewport.scale} listening={false} perfectDrawEnabled={false} />
      )
    }
    for (let j = startY; j < viewBottom + step; j += step) {
      gridLines.push(
        <Line key={`h${j}`} points={[startX, j, viewRight + step, j]} stroke="rgba(100,116,139,0.25)" strokeWidth={1 / viewport.scale} listening={false} perfectDrawEnabled={false} />
      )
    }
  }

  const cursor = viewerMode ? 'grab'
    : activeTool === 'hand' ? 'grab'
    : DRAW_TOOLS.includes(activeTool) ? 'crosshair'
    : 'default'

  const selectedPlot = elements.find((e) => e.id === selectedIds[0] && e.type === 'plot')
  const keepRatio = selectedPlot && ['square', 'circle'].includes(selectedPlot.shape || 'rectangle')

  const previewLabel = createPreview && (createPreview.width > 4 || createPreview.height > 4)
    ? `${Math.round(createPreview.width)} × ${Math.round(createPreview.height)}${activeTool === 'plot' ? ` · ~${calcArea(createPreview.width, createPreview.height)} sqft` : ''}`
    : null

  if (width < 10 || height < 10) return null

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        x={viewport.x}
        y={viewport.y}
        onWheel={handleWheel}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseLeave={() => { isPanning.current = false; cancelCreate() }}
        style={{ cursor, display: 'block' }}
      >
        {/* Layer 1: background hit area (bottom) */}
        <Layer>
          <Rect
            name="canvas-bg"
            x={0}
            y={0}
            width={CANVAS_WORLD.width}
            height={CANVAS_WORLD.height}
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth={2 / viewport.scale}
            onMouseDown={handleBgMouseDown}
          />
        </Layer>

        {/* Layer 2: grid (non-interactive) */}
        <Layer listening={false}>{gridLines}</Layer>

        {/* Layer 3: all layout elements (top) */}
        <Layer>
          {visible.map((el) => (
            <CanvasElement
              key={el.id}
              el={el}
              debugMode={debugMode}
              selected={selectedIds.includes(el.id)}
              onSelect={handleElementSelect}
              onDragEnd={handleDragEnd}
              readOnly={readOnly || viewerMode || layerLocks[el.layer] || activeTool !== 'select'}
              locked={layerLocks[el.layer]}
              onHover={setHoverId}
            />
          ))}

          {createPreview && (createPreview.width > 0 || createPreview.height > 0) && (
            <>
              <Rect
                x={createPreview.x}
                y={createPreview.y}
                width={Math.max(createPreview.width, 1)}
                height={Math.max(createPreview.height, 1)}
                fill="rgba(99,102,241,0.15)"
                stroke="#6366F1"
                strokeWidth={2 / viewport.scale}
                dash={[8 / viewport.scale, 4 / viewport.scale]}
                listening={false}
              />
              {previewLabel && (
                <Text
                  x={createPreview.x + createPreview.width / 2}
                  y={createPreview.y + createPreview.height / 2}
                  text={previewLabel}
                  fontSize={14 / viewport.scale}
                  fill="#4338CA"
                  fontStyle="bold"
                  align="center"
                  verticalAlign="middle"
                  offsetX={previewLabel.length * 3 / viewport.scale}
                  listening={false}
                />
              )}
            </>
          )}

          {marqueeRect && (
            <Rect
              x={marqueeRect.x}
              y={marqueeRect.y}
              width={marqueeRect.width}
              height={marqueeRect.height}
              fill="rgba(96,165,250,0.08)"
              stroke="#60A5FA"
              strokeWidth={1 / viewport.scale}
              listening={false}
            />
          )}
        </Layer>

        {/* Layer 4: transformer handles */}
        {!readOnly && activeTool === 'select' && (
          <Layer>
            <Transformer
              ref={transformerRef}
              rotateEnabled
              keepRatio={keepRatio}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
              onTransformEnd={() => {
                const nodes = transformerRef.current?.nodes() || []
                nodes.forEach((node) => {
                  const id = node.id().replace('node-', '')
                  const el = elements.find((e) => e.id === id)
                  if (!el) return
                  const scaleX = node.scaleX()
                  const scaleY = node.scaleY()
                  const rawW = Math.max(20, (el.width || 100) * scaleX)
                  const rawH = Math.max(20, (el.height || 100) * scaleY)
                  const shape = el.shape || 'rectangle'
                  const dims = el.type === 'plot'
                    ? normalizePlotDimensions(shape, rawW, rawH)
                    : { width: rawW, height: rawH }
                  updateElement(id, {
                    x: snapValue(Math.max(0, node.x()), gridSize, snapToGrid),
                    y: snapValue(Math.max(0, node.y()), gridSize, snapToGrid),
                    width: dims.width,
                    height: dims.height,
                    rotation: node.rotation(),
                  })
                  node.scaleX(1)
                  node.scaleY(1)
                })
              }}
            />
          </Layer>
        )}
      </Stage>
    </div>
  )
}
