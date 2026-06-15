import { create } from 'zustand'
import {
  DEFAULT_LAYER_LOCKS,
  DEFAULT_LAYER_VISIBILITY,
  PLOT_STATUS_COLORS,
  DRAW_TOOLS,
  createElementWithBounds,
  calcArea,
  normalizePlotDimensions,
} from '../constants'
import { snapValue } from '../utils/geometry'

const MAX_HISTORY = 50
const DEFAULT_PLOT_W = 120
const DEFAULT_PLOT_H = 80

function cloneElements(elements) {
  return JSON.parse(JSON.stringify(elements))
}

function normalizeBounds(x1, y1, x2, y2, gridSize, snap) {
  const sx = snapValue(Math.min(x1, x2), gridSize, snap)
  const sy = snapValue(Math.min(y1, y2), gridSize, snap)
  const ex = snapValue(Math.max(x1, x2), gridSize, snap)
  const ey = snapValue(Math.max(y1, y2), gridSize, snap)
  return { x: sx, y: sy, width: ex - sx, height: ey - sy }
}

/** Ensure every element has valid geometry and colors for Konva rendering */
export function sanitizeElement(el) {
  const isPlot = el.type === 'plot'
  const shape = el.shape || (isPlot ? 'rectangle' : el.shape)
  const rawW = Math.max(Number(el.width) || 0, isPlot ? DEFAULT_PLOT_W : 40)
  const rawH = Math.max(Number(el.height) || 0, isPlot ? DEFAULT_PLOT_H : 40)
  const dims = isPlot ? normalizePlotDimensions(shape, rawW, rawH, DEFAULT_PLOT_W) : { width: rawW, height: rawH }
  const w = dims.width
  const h = dims.height
  const colors = isPlot
    ? PLOT_STATUS_COLORS[el.metadata?.status] || PLOT_STATUS_COLORS.available
    : null

  return {
    ...el,
    x: Math.max(0, Number(el.x) || 0),
    y: Math.max(0, Number(el.y) || 0),
    width: w,
    height: h,
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    shape: shape || (isPlot ? 'rectangle' : el.shape),
    fillColor: el.fillColor || colors?.fill || '#22C55E',
    strokeColor: el.strokeColor || colors?.stroke || '#15803D',
    strokeWidth: el.strokeWidth || 2,
    layer: el.layer || (isPlot ? 'plots' : el.layer || 'labels'),
  }
}

function getContentBounds(elements) {
  if (!elements.length) return { minX: 0, minY: 0, maxX: 800, maxY: 600 }
  return elements.reduce(
    (acc, el) => ({
      minX: Math.min(acc.minX, el.x),
      minY: Math.min(acc.minY, el.y),
      maxX: Math.max(acc.maxX, el.x + (el.width || DEFAULT_PLOT_W)),
      maxY: Math.max(acc.maxY, el.y + (el.height || DEFAULT_PLOT_H)),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  )
}

const useLayoutStore = create((set, get) => ({
  viewerMode: false,
  layoutId: null,
  projectId: null,
  phaseId: null,
  readOnly: false,
  elements: [],
  selectedIds: [],
  activeTool: 'select',
  viewport: { scale: 1, x: 0, y: 0 },
  gridSize: 20,
  snapToGrid: true,
  showGrid: true,
  debugMode: false,
  layerVisibility: { ...DEFAULT_LAYER_VISIBILITY },
  layerLocks: { ...DEFAULT_LAYER_LOCKS },
  clipboard: [],
  history: [],
  historyIndex: -1,
  hoverId: null,
  filters: { status: '', employee: '', phase: '', search: '' },
  amenitySubtype: 'clubhouse',
  roadSubtype: 'main',
  saving: false,
  dirty: false,
  plotCounter: 1,
  activePlotShape: 'rectangle',
  pointerWorld: { x: 0, y: 0 },
  pendingPlotId: null,

  isCreating: false,
  createStart: null,
  createPreview: null,
  isMarquee: false,
  marqueeStart: null,
  marqueeRect: null,

  initLayout: (data, options = {}) => {
    const readOnly = options.readOnly ?? options === true
    const viewerMode = options.viewerMode ?? false
    const raw = data.elements || []
    const elements = raw.map(sanitizeElement)
    const plotCount = elements.filter((e) => e.type === 'plot').length + 1
    set({
      layoutId: data._id || data.layoutId || null,
      projectId: data.projectId,
      phaseId: data.phaseId || null,
      elements,
      viewport: data.viewport ? { ...data.viewport } : { scale: 1, x: 0, y: 0 },
      gridSize: data.gridSize ?? 20,
      snapToGrid: data.snapToGrid ?? true,
      layerVisibility: { ...DEFAULT_LAYER_VISIBILITY, ...(data.layerVisibility || {}) },
      layerLocks: { ...DEFAULT_LAYER_LOCKS, ...(data.layerLocks || {}) },
      readOnly: readOnly || viewerMode,
      viewerMode,
      activeTool: viewerMode ? 'hand' : 'select',
      selectedIds: [],
      history: [cloneElements(elements)],
      historyIndex: 0,
      dirty: false,
      plotCounter: plotCount,
      isCreating: false,
      createStart: null,
      createPreview: null,
    })
  },

  fitToContent: (stageWidth, stageHeight) => {
    const { elements } = get()
    if (!stageWidth || !stageHeight) return
    if (!elements.length) {
      set({ viewport: { scale: 1, x: 40, y: 40 } })
      return
    }
    const b = getContentBounds(elements)
    const pad = 60
    const contentW = b.maxX - b.minX + pad * 2
    const contentH = b.maxY - b.minY + pad * 2
    const scale = Math.min(stageWidth / contentW, stageHeight / contentH, 2)
    const x = stageWidth / 2 - (b.minX + (b.maxX - b.minX) / 2) * scale
    const y = stageHeight / 2 - (b.minY + (b.maxY - b.minY) / 2) * scale
    set({ viewport: { scale: Math.max(0.1, scale), x, y } })
  },

  centerOnElement: (id, stageWidth, stageHeight) => {
    const el = get().elements.find((e) => e.id === id)
    if (!el || !stageWidth || !stageHeight) return
    const { viewport } = get()
    const cx = el.x + (el.width || DEFAULT_PLOT_W) / 2
    const cy = el.y + (el.height || DEFAULT_PLOT_H) / 2
    set({
      viewport: {
        scale: viewport.scale,
        x: stageWidth / 2 - cx * viewport.scale,
        y: stageHeight / 2 - cy * viewport.scale,
      },
    })
  },

  resetViewport: () => set({ viewport: { scale: 1, x: 0, y: 0 } }),

  pushHistory: () => {
    const { elements, history, historyIndex } = get()
    const next = history.slice(0, historyIndex + 1)
    next.push(cloneElements(elements))
    if (next.length > MAX_HISTORY) next.shift()
    set({ history: next, historyIndex: next.length - 1, dirty: true })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const idx = historyIndex - 1
    set({ elements: cloneElements(history[idx]), historyIndex: idx, selectedIds: [], dirty: true })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const idx = historyIndex + 1
    set({ elements: cloneElements(history[idx]), historyIndex: idx, selectedIds: [], dirty: true })
  },

  setActiveTool: (tool) =>
    set({
      activeTool: tool,
      selectedIds: [],
      isCreating: false,
      createStart: null,
      createPreview: null,
      isMarquee: false,
      marqueeStart: null,
      marqueeRect: null,
    }),

  setActivePlotShape: (shape) => set({ activePlotShape: shape }),

  resizePlot: (id, deltaW, deltaH) => {
    const el = get().elements.find((e) => e.id === id)
    if (!el || el.type !== 'plot' || get().readOnly) return
    const shape = el.shape || 'rectangle'
    const dims = normalizePlotDimensions(shape, (el.width || 0) + deltaW, (el.height || 0) + deltaH)
    get().updateElement(id, dims)
  },

  setProjectId: (id) => set({ projectId: id }),
  setPhaseId: (id) => set({ phaseId: id }),
  setAmenitySubtype: (subtype) => set({ amenitySubtype: subtype }),
  setRoadSubtype: (subtype) => set({ roadSubtype: subtype }),
  setHoverId: (id) => set({ hoverId: id }),
  setPointerWorld: (pos) => set({ pointerWorld: pos }),
  setPendingPlotId: (id) => set({ pendingPlotId: id }),
  setSaving: (saving) => set({ saving }),
  setDirty: (dirty) => set({ dirty }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  setViewport: (viewport) => set((s) => ({ viewport: { ...s.viewport, ...viewport } })),

  zoomIn: () => set((s) => ({ viewport: { ...s.viewport, scale: Math.min(s.viewport.scale * 1.2, 5) } })),
  zoomOut: () => set((s) => ({ viewport: { ...s.viewport, scale: Math.max(s.viewport.scale / 1.2, 0.1) } })),

  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid, dirty: true })),
  toggleShowGrid: () => set((s) => ({ showGrid: !s.showGrid })),

  quickAddAtCenter: (tool, stageWidth, stageHeight) => {
    const { viewport, projectId, phaseId, plotCounter, amenitySubtype, roadSubtype, readOnly, activePlotShape } = get()
    if (readOnly || !DRAW_TOOLS.includes(tool)) return null
    const cx = (stageWidth / 2 - viewport.x) / viewport.scale
    const cy = (stageHeight / 2 - viewport.y) / viewport.scale
    const defaults = {
      plot: { width: DEFAULT_PLOT_W, height: DEFAULT_PLOT_H },
      road: { width: 200, height: 30 },
      park: { width: 100, height: 80 },
      trees: { width: 56, height: 56 },
      amenity: { width: 80, height: 80 },
      text: { width: 120, height: 40 },
      marker: { width: 32, height: 32 },
      boundary: { width: 300, height: 200 },
    }
    const size = defaults[tool] || defaults.plot
    const bounds = { x: cx - size.width / 2, y: cy - size.height / 2, ...size }
    const el = createElementWithBounds(tool, bounds, projectId, phaseId, plotCounter, { amenitySubtype, roadSubtype, plotShape: activePlotShape })
    const added = get().addElement(el)
    set({
      selectedIds: [added.id],
      activeTool: 'select',
      plotCounter: tool === 'plot' ? plotCounter + 1 : plotCounter,
      pendingPlotId: tool === 'plot' ? added.id : null,
    })
    return added
  },

  importElements: (imported) => {
    if (get().readOnly || !Array.isArray(imported)) return
    get().pushHistory()
    const sanitized = imported.map(sanitizeElement)
    set((s) => ({
      elements: sanitized,
      selectedIds: [],
      dirty: true,
      plotCounter: sanitized.filter((e) => e.type === 'plot').length + 1,
    }))
  },

  toggleLayer: (layer) =>
    set((s) => {
      const visible = s.layerVisibility[layer] !== false
      return { layerVisibility: { ...s.layerVisibility, [layer]: !visible }, dirty: true }
    }),

  toggleLayerLock: (layer) =>
    set((s) => ({
      layerLocks: { ...s.layerLocks, [layer]: !s.layerLocks[layer] },
      dirty: true,
    })),

  select: (id, multi = false) => {
    if (get().readOnly && get().elements.find((e) => e.id === id)?.type !== 'plot') return
    set((s) => ({
      selectedIds: multi
        ? s.selectedIds.includes(id)
          ? s.selectedIds.filter((x) => x !== id)
          : [...s.selectedIds, id]
        : [id],
    }))
  },

  selectMultiple: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),

  addElement: (element, skipHistory = false) => {
    const sanitized = sanitizeElement(element)
    if (!skipHistory) get().pushHistory()
    set((s) => ({ elements: [...s.elements, sanitized], dirty: true }))
    return sanitized
  },

  updateElement: (id, patch, skipHistory = false) => {
    if (!skipHistory) get().pushHistory()
    set((s) => ({
      elements: s.elements.map((el) => {
        if (el.id !== id) return el
        const merged = { ...el, ...patch }
        if (patch.metadata) merged.metadata = { ...el.metadata, ...patch.metadata }
        if (patch.width !== undefined || patch.height !== undefined || patch.shape !== undefined) {
          const shape = patch.shape ?? merged.shape ?? 'rectangle'
          const w = patch.width ?? el.width
          const h = patch.height ?? el.height
          const dims = el.type === 'plot' ? normalizePlotDimensions(shape, w, h) : { width: w, height: h }
          merged.width = dims.width
          merged.height = dims.height
          if (el.type === 'plot' && merged.metadata) {
            const area = calcArea(dims.width, dims.height)
            merged.metadata = { ...merged.metadata, area, size: String(area) }
          }
          if (el.type === 'plot' && patch.shape) {
            merged.points = undefined
          }
        }
        return sanitizeElement(merged)
      }),
      dirty: true,
    }))
  },

  deleteSelected: () => {
    const { selectedIds, readOnly } = get()
    if (readOnly || !selectedIds.length) return
    get().pushHistory()
    set((s) => ({
      elements: s.elements.filter((el) => !selectedIds.includes(el.id)),
      selectedIds: [],
    }))
  },

  duplicateSelected: () => {
    const { selectedIds, elements, snapToGrid, gridSize, readOnly, plotCounter } = get()
    if (readOnly || !selectedIds.length) return
    let counter = plotCounter
    const dupes = elements
      .filter((el) => selectedIds.includes(el.id))
      .map((el) => {
        const copy = JSON.parse(JSON.stringify(el))
        copy.id = crypto.randomUUID()
        copy.x = snapValue(el.x + 20, gridSize, snapToGrid)
        copy.y = snapValue(el.y + 20, gridSize, snapToGrid)
        if (copy.type === 'plot' && copy.metadata) {
          copy.metadata.plotId = undefined
          copy.metadata.plotNumber = `P${String(counter++).padStart(2, '0')}`
        }
        return sanitizeElement(copy)
      })
    get().pushHistory()
    set((s) => ({ elements: [...s.elements, ...dupes], selectedIds: dupes.map((d) => d.id), plotCounter: counter }))
  },

  copySelected: () => {
    const { selectedIds, elements } = get()
    set({ clipboard: JSON.parse(JSON.stringify(elements.filter((el) => selectedIds.includes(el.id)))) })
  },

  pasteClipboard: () => {
    const { clipboard, snapToGrid, gridSize, readOnly } = get()
    if (readOnly || !clipboard.length) return
    const pasted = clipboard.map((el) =>
      sanitizeElement({
        ...JSON.parse(JSON.stringify(el)),
        id: crypto.randomUUID(),
        x: snapValue(el.x + 30, gridSize, snapToGrid),
        y: snapValue(el.y + 30, gridSize, snapToGrid),
        metadata: el.metadata ? { ...el.metadata, plotId: undefined } : undefined,
      })
    )
    get().pushHistory()
    set((s) => ({ elements: [...s.elements, ...pasted], selectedIds: pasted.map((p) => p.id) }))
  },

  startCreate: (pos) => {
    const { activeTool, readOnly, snapToGrid, gridSize } = get()
    if (readOnly) return
    const snapped = { x: snapValue(pos.x, gridSize, snapToGrid), y: snapValue(pos.y, gridSize, snapToGrid) }

    if (activeTool === 'select') {
      set({ isMarquee: true, marqueeStart: snapped, marqueeRect: { ...snapped, width: 0, height: 0 } })
      return
    }
    if (activeTool === 'hand') return
    if (DRAW_TOOLS.includes(activeTool)) {
      set({ isCreating: true, createStart: snapped, createPreview: { x: snapped.x, y: snapped.y, width: 0, height: 0 } })
    }
  },

  updateCreate: (pos) => {
    const { isCreating, isMarquee, createStart, marqueeStart, snapToGrid, gridSize } = get()
    const snapped = { x: snapValue(pos.x, gridSize, snapToGrid), y: snapValue(pos.y, gridSize, snapToGrid) }

    if (isCreating && createStart) {
      set({ createPreview: normalizeBounds(createStart.x, createStart.y, snapped.x, snapped.y, gridSize, false) })
    }
    if (isMarquee && marqueeStart) {
      set({ marqueeRect: normalizeBounds(marqueeStart.x, marqueeStart.y, snapped.x, snapped.y, gridSize, false) })
    }
  },

  finishCreate: (pos, stageWidth, stageHeight) => {
    const state = get()
    const { activeTool, readOnly, isCreating, createStart, projectId, phaseId, plotCounter, amenitySubtype, roadSubtype, snapToGrid, gridSize, elements, isMarquee, marqueeStart, activePlotShape } = state
    if (readOnly) return null

    if (isMarquee && marqueeStart) {
      const snapped = { x: snapValue(pos.x, gridSize, snapToGrid), y: snapValue(pos.y, gridSize, snapToGrid) }
      const bounds = normalizeBounds(marqueeStart.x, marqueeStart.y, snapped.x, snapped.y, gridSize, false)
      const selected = elements
        .filter((el) => {
          const ex = el.x + (el.width || 0)
          const ey = el.y + (el.height || 0)
          return el.x < bounds.x + bounds.width && ex > bounds.x && el.y < bounds.y + bounds.height && ey > bounds.y
        })
        .map((el) => el.id)
      set({ isMarquee: false, marqueeStart: null, marqueeRect: null, selectedIds: selected })
      return null
    }

    if (!isCreating || !createStart) {
      set({ isCreating: false, createStart: null, createPreview: null })
      return null
    }

    const snapped = { x: snapValue(pos.x, gridSize, snapToGrid), y: snapValue(pos.y, gridSize, snapToGrid) }
    let bounds = normalizeBounds(createStart.x, createStart.y, snapped.x, snapped.y, gridSize, snapToGrid)

    if (bounds.width < 10 && bounds.height < 10) {
      bounds = {
        x: bounds.x,
        y: bounds.y,
        width: activeTool === 'road' ? 200 : DEFAULT_PLOT_W,
        height: activeTool === 'road' ? 30 : DEFAULT_PLOT_H,
      }
    }

    const el = createElementWithBounds(activeTool, bounds, projectId, phaseId, plotCounter, { amenitySubtype, roadSubtype, plotShape: activePlotShape })
    const added = get().addElement(el)
    set({
      isCreating: false,
      createStart: null,
      createPreview: null,
      selectedIds: [added.id],
      activeTool: activeTool === 'plot' ? 'select' : 'select',
      plotCounter: activeTool === 'plot' ? plotCounter + 1 : plotCounter,
      pendingPlotId: activeTool === 'plot' ? added.id : null,
    })

    if (stageWidth && stageHeight) {
      get().centerOnElement(added.id, stageWidth, stageHeight)
    }
    return added
  },

  cancelCreate: () =>
    set({ isCreating: false, createStart: null, createPreview: null, isMarquee: false, marqueeStart: null, marqueeRect: null }),

  syncPlotStatuses: (plots, phaseId) => {
    const plotById = new Map(plots.map((p) => [String(p._id), p]))
    const plotByNumber = new Map(
      plots.map((p) => [`${String(p.phase?._id || p.phase)}:${p.plotNumber}`, p])
    )
    set((s) => ({
      elements: s.elements.map((el) => {
        if (el.type !== 'plot') return el
        const meta = el.metadata || {}
        const resolvedPhase = String(meta.phase || phaseId || '')
        const plot = (meta.plotId && plotById.get(String(meta.plotId)))
          || (meta.plotNumber && plotByNumber.get(`${resolvedPhase}:${meta.plotNumber}`))
          || (meta.plotNumber && plots.find((p) => p.plotNumber === meta.plotNumber))
        if (!plot) return el
        const colors = PLOT_STATUS_COLORS[plot.status] || PLOT_STATUS_COLORS.available
        return sanitizeElement({
          ...el,
          fillColor: colors.fill,
          strokeColor: colors.stroke,
          metadata: {
            ...el.metadata,
            plotId: plot._id,
            status: plot.status,
            active: plot.active,
            plotNumber: plot.plotNumber,
            plotName: plot.plotName,
            size: String(plot.size),
            area: plot.size,
            price: plot.cost,
            owner: plot.customer?.name || '',
            employee: plot.assignedEmployee?._id || plot.assignedEmployee,
            customer: plot.customer?._id || plot.customer,
          },
        })
      }),
    }))
  },

  isLayerVisible: (layer) => {
    const { layerVisibility } = get()
    return layerVisibility[layer] !== false
  },

  getVisibleElements: () => {
    const { elements, layerVisibility, filters } = get()
    return elements.filter((el) => {
      if (layerVisibility[el.layer] === false) return false
      if (el.type !== 'plot') return true
      const m = el.metadata || {}
      if (filters.status && m.status !== filters.status) return false
      if (filters.phase && String(m.phase) !== filters.phase) return false
      if (filters.employee && String(m.employee) !== filters.employee) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const match =
          m.plotNumber?.toLowerCase().includes(q) ||
          m.plotName?.toLowerCase().includes(q) ||
          m.owner?.toLowerCase?.().includes(q)
        if (!match) return false
      }
      return true
    })
  },

  getLayoutPayload: () => {
    const s = get()
    return {
      elements: s.elements,
      viewport: s.viewport,
      gridSize: s.gridSize,
      snapToGrid: s.snapToGrid,
      layerVisibility: s.layerVisibility,
      layerLocks: s.layerLocks,
    }
  },
}))

export default useLayoutStore
