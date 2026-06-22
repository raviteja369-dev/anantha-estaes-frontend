export const PLOT_STATUS_COLORS = {
  available: { fill: '#22C55E', stroke: '#15803D', label: 'Available' },
  pending: { fill: '#3B82F6', stroke: '#2563EB', label: 'Pending' },
  reserved: { fill: '#F59E0B', stroke: '#D97706', label: 'Reserved' },
  sold: { fill: '#EF4444', stroke: '#DC2626', label: 'Sold' },
  cancelled: { fill: '#94A3B8', stroke: '#64748B', label: 'Cancelled' },
  under_processing: { fill: '#3B82F6', stroke: '#2563EB', label: 'Processing' },
}

export const DRAW_TOOLS = ['plot', 'road', 'park', 'trees', 'amenity', 'text', 'marker', 'boundary']

export const TOOL_GROUPS = [
  {
    id: 'draw',
    label: 'Draw',
    tools: [
      { id: 'plot', label: 'Plot', shortcut: 'P', icon: 'plot' },
      { id: 'road', label: 'Road', shortcut: 'R', icon: 'road' },
      { id: 'park', label: 'Park', shortcut: 'K', icon: 'park' },
      { id: 'trees', label: 'Trees', shortcut: 'E', icon: 'trees' },
      { id: 'amenity', label: 'Amenity', shortcut: 'A', icon: 'amenity' },
    ],
  },
  {
    id: 'insert',
    label: 'Insert',
    tools: [
      { id: 'text', label: 'Text', shortcut: 'T', icon: 'text' },
      { id: 'marker', label: 'Marker', shortcut: 'M', icon: 'marker' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    tools: [
      { id: 'select', label: 'Select', shortcut: 'V', icon: 'select' },
      { id: 'hand', label: 'Pan', shortcut: 'H', icon: 'hand' },
    ],
  },
]

export const QUICK_ACTIONS = [
  { id: 'road', label: 'Add Road', description: 'Draw a road path', color: 'from-slate-500 to-slate-600' },
  { id: 'park', label: 'Add Park', description: 'Add green space', color: 'from-teal-500 to-emerald-600' },
  { id: 'trees', label: 'Add Trees', description: 'Plant tree clusters', color: 'from-green-500 to-lime-600' },
  { id: 'amenity', label: 'Add Amenity', description: 'Clubhouse, pool, etc.', color: 'from-violet-500 to-purple-600' },
]

export const LAYER_PANEL_KEYS = ['boundary', 'roads', 'plots', 'amenities', 'trees', 'labels']

export const PLOT_SHAPES = [
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'square', label: 'Square' },
  { id: 'circle', label: 'Circle' },
  { id: 'triangle', label: 'Triangle' },
]

export const TOOLS = [
  { id: 'select', label: 'Select', shortcut: 'V' },
  { id: 'hand', label: 'Pan', shortcut: 'H' },
  { id: 'plot', label: 'Plot', shortcut: 'P' },
  { id: 'road', label: 'Road', shortcut: 'R' },
  { id: 'park', label: 'Park', shortcut: 'K' },
  { id: 'trees', label: 'Trees', shortcut: 'E' },
  { id: 'amenity', label: 'Amenity', shortcut: 'A' },
  { id: 'text', label: 'Text', shortcut: 'T' },
  { id: 'marker', label: 'Marker', shortcut: 'M' },
  { id: 'boundary', label: 'Boundary', shortcut: 'B' },
]

export const ROAD_TYPES = [
  { id: 'main', label: 'Main Road', defaultWidth: 60 },
  { id: 'internal', label: 'Internal Road', defaultWidth: 30 },
  { id: 'highway', label: 'Highway Road', defaultWidth: 80 },
]

export const AMENITY_TYPES = [
  { id: 'clubhouse', label: 'Club House', icon: '🏛️', color: '#8B5CF6' },
  { id: 'pool', label: 'Swimming Pool', icon: '🏊', color: '#06B6D4' },
  { id: 'temple', label: 'Temple', icon: '🛕', color: '#F59E0B' },
  { id: 'school', label: 'School', icon: '🏫', color: '#3B82F6' },
  { id: 'hospital', label: 'Hospital', icon: '🏥', color: '#EF4444' },
  { id: 'shopping', label: 'Shopping Complex', icon: '🛒', color: '#EC4899' },
  { id: 'office', label: 'Office Building', icon: '🏢', color: '#2563EB' },
  { id: 'parking', label: 'Parking Area', icon: '🅿️', color: '#64748B' },
  { id: 'gate', label: 'Security Gate', icon: '🚧', color: '#78716C' },
  { id: 'tank', label: 'Water Tank', icon: '💧', color: '#0EA5E9' },
  { id: 'playground', label: "Children's Play Area", icon: '🎠', color: '#22C55E' },
]

export const LANDSCAPE_ICONS = {
  park: { icon: '🏞️', color: '#059669', label: 'Park' },
  tree: { icon: '🌳', color: '#16A34A', label: 'Trees' },
}

export const DEFAULT_LAYER_VISIBILITY = {
  boundary: true,
  roads: true,
  plots: true,
  amenities: true,
  trees: true,
  labels: true,
  phases: true,
}

export const DEFAULT_LAYER_LOCKS = {
  boundary: false,
  roads: false,
  plots: false,
  amenities: false,
  trees: false,
  labels: false,
  phases: false,
}

export const CANVAS_WORLD = { width: 4000, height: 3000 }

export function getLayerForTool(tool) {
  const map = {
    plot: 'plots',
    road: 'roads',
    park: 'trees',
    trees: 'trees',
    amenity: 'amenities',
    boundary: 'boundary',
    text: 'labels',
    marker: 'labels',
  }
  return map[tool] || 'plots'
}

export function getElementTypeForTool(tool) {
  if (tool === 'plot') return 'plot'
  if (tool === 'road') return 'road'
  if (tool === 'park' || tool === 'trees') return 'landscape'
  if (tool === 'amenity') return 'amenity'
  if (tool === 'boundary') return 'boundary'
  if (tool === 'text') return 'text'
  if (tool === 'marker') return 'marker'
  return 'plot'
}

/** 1 canvas unit ≈ 10 sqft for area display */
export const SQFT_PER_UNIT = 10

export function calcArea(width, height) {
  return Math.round((width || 0) * (height || 0) * SQFT_PER_UNIT)
}

export function normalizePlotDimensions(shape, width, height, min = 20) {
  let w = Math.max(Number(width) || 0, min)
  let h = Math.max(Number(height) || 0, min)
  if (shape === 'square' || shape === 'circle') {
    const size = Math.max(w, h)
    return { width: size, height: size }
  }
  return { width: w, height: h }
}

export function createElementWithBounds(tool, bounds, projectId, phaseId, plotCounter = 1, options = {}) {
  const { amenitySubtype = 'clubhouse', roadSubtype = 'main', plotShape = 'rectangle' } = options
  const id = crypto.randomUUID()
  const { x, y, width, height } = bounds
  const layer = getLayerForTool(tool)
  const type = getElementTypeForTool(tool)
  const w = Math.max(width || 0, type === 'plot' ? 120 : 40)
  const h = Math.max(height || 0, type === 'plot' ? 80 : 40)

  const base = {
    id,
    type,
    layer,
    x,
    y,
    width: w,
    height: h,
    rotation: 0,
    strokeWidth: 2,
    opacity: 1,
    zIndex: Date.now(),
  }

  if (type === 'plot') {
    const dims = normalizePlotDimensions(plotShape, w, h, 120)
    const area = calcArea(dims.width, dims.height)
    return {
      ...base,
      width: dims.width,
      height: dims.height,
      shape: plotShape,
      fillColor: PLOT_STATUS_COLORS.available.fill,
      strokeColor: PLOT_STATUS_COLORS.available.stroke,
      metadata: {
        plotNumber: `P${String(plotCounter).padStart(2, '0')}`,
        plotName: '',
        size: String(area),
        widthFt: Math.round(w / 4),
        heightFt: Math.round(h / 4),
        area,
        facing: 'East',
        price: Math.round(area * 2000),
        status: 'available',
        owner: '',
        project: projectId,
        phase: phaseId || '',
        notes: '',
      },
    }
  }

  if (type === 'road') {
    const road = ROAD_TYPES.find((r) => r.id === roadSubtype) || ROAD_TYPES[0]
    return {
      ...base,
      shape: 'line',
      height: Math.max(h, 20),
      fillColor: '#374151',
      strokeColor: '#1F2937',
      metadata: {
        roadType: roadSubtype,
        roadName: road.label,
        roadWidth: road.defaultWidth,
        roadLength: Math.round(w / 4),
      },
    }
  }

  if (type === 'landscape') {
    const subtype = tool === 'trees' ? 'tree' : 'park'
    const info = LANDSCAPE_ICONS[subtype] || LANDSCAPE_ICONS.park
    return {
      ...base,
      shape: 'icon',
      subtype,
      fillColor: info.color,
      strokeColor: info.color,
      text: info.icon,
      metadata: { label: info.label, landscapeType: subtype },
    }
  }

  if (type === 'amenity') {
    const amenity = AMENITY_TYPES.find((a) => a.id === amenitySubtype) || AMENITY_TYPES[0]
    return {
      ...base,
      shape: 'icon',
      subtype: amenity.id,
      fillColor: amenity.color,
      strokeColor: amenity.color,
      text: amenity.icon,
      metadata: { amenityType: amenity.id, label: amenity.label },
    }
  }

  if (type === 'boundary') {
    return {
      ...base,
      shape: 'rectangle',
      fillColor: 'rgba(120,113,108,0.1)',
      strokeColor: '#78716C',
      strokeWidth: 4,
      metadata: { boundaryType: 'compound', label: 'Compound Wall' },
    }
  }

  if (type === 'marker') {
    return {
      ...base,
      shape: 'icon',
      width: Math.max(w, 32),
      height: Math.max(h, 32),
      fillColor: '#EF4444',
      strokeColor: '#DC2626',
      text: '📍',
      metadata: { label: 'Marker' },
    }
  }

  return {
    ...base,
    shape: 'rectangle',
    fillColor: 'transparent',
    strokeColor: 'transparent',
    text: 'Label',
  }
}
