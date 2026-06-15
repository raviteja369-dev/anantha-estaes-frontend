export function snapValue(value, gridSize, enabled) {
  if (!enabled) return value
  return Math.round(value / gridSize) * gridSize
}

export function getPolygonPoints(shape, width, height) {
  if (shape === 'triangle') return [0, height, width / 2, 0, width, height]
  if (shape === 'lShape') {
    const w = width / 3
    const h = height / 3
    return [0, 0, width, 0, width, h, w, h, w, height, 0, height]
  }
  return []
}

export function normalizeFreeDrawPoints(points) {
  if (!points?.length) return { points: [], x: 0, y: 0, width: 0, height: 0 }
  const xs = points.filter((_, i) => i % 2 === 0)
  const ys = points.filter((_, i) => i % 2 === 1)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)
  const normalized = points.map((v, i) => (i % 2 === 0 ? v - minX : v - minY))
  return { points: normalized, x: minX, y: minY, width: maxX - minX || 10, height: maxY - minY || 10 }
}

export function getElementBounds(el) {
  return { x: el.x, y: el.y, width: el.width || 0, height: el.height || 0 }
}

export function elementsIntersectViewport(el, vp, stageW, stageH) {
  const scale = vp.scale
  const vx = -vp.x / scale
  const vy = -vp.y / scale
  const vw = stageW / scale
  const vh = stageH / scale
  const b = getElementBounds(el)
  return !(b.x + b.width < vx || b.x > vx + vw || b.y + b.height < vy || b.y > vy + vh)
}

export function formatPlotLabel(el) {
  const m = el.metadata || {}
  const lines = []
  if (m.plotNumber) lines.push(m.plotNumber)
  const area = m.area || m.size
  if (area) lines.push(`${area} Sqft`)
  if (m.price) {
    const lakhs = (m.price / 100000).toFixed(1)
    lines.push(`₹${lakhs}L`)
  }
  return lines
}
