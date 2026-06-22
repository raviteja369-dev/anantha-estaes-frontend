import { Group, Rect, Circle, Line, Text } from 'react-konva'
import { AMENITY_TYPES, LANDSCAPE_ICONS, ROAD_TYPES } from '../constants'
import { getPolygonPoints } from '../utils/geometry'

const DEFAULT_W = 120
const DEFAULT_H = 80

const SELECT_COLOR = '#2563EB'

/** Lighten (amt > 0) or darken (amt < 0) a #RRGGBB color. amt in -1..1 */
function shade(hex, amt) {
  if (typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const target = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  const mix = (c) => Math.round((target - c) * p) + c
  const hx = (c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')
  return `#${hx(mix(r))}${hx(mix(g))}${hx(mix(b))}`
}

function makeGroupProps(el, { readOnly, locked, onSelect, onDragEnd, onHover }) {
  return {
    id: `node-${el.id}`,
    x: el.x,
    y: el.y,
    rotation: el.rotation || 0,
    draggable: !readOnly && !locked,
    onClick: (e) => { e.cancelBubble = true; onSelect(el.id, e.evt.shiftKey) },
    onTap: (e) => { e.cancelBubble = true; onSelect(el.id) },
    onDragEnd: (e) => onDragEnd(el.id, e.target.x(), e.target.y()),
    onMouseEnter: (e) => {
      onHover?.(el.id)
      const stage = e.target.getStage()
      if (stage && readOnly && !locked) stage.container().style.cursor = 'pointer'
    },
    onMouseLeave: (e) => {
      onHover?.(null)
      const stage = e.target.getStage()
      if (stage && readOnly) stage.container().style.cursor = 'grab'
    },
  }
}

/* ------------------------------- PLOTS ------------------------------- */
function PlotTextStack({ cx, cy, width, lines }) {
  const totalH = lines.reduce((s, l) => s + l.size + 3, 0)
  let y = cy - totalH / 2
  return (
    <Group listening={false}>
      {lines.map((l, i) => {
        const node = (
          <Text
            key={i}
            text={l.t}
            x={cx - width / 2}
            y={y}
            width={width}
            align="center"
            fontFamily="Inter, sans-serif"
            fontSize={l.size}
            fontStyle={l.bold ? '700' : '500'}
            fill={l.color}
            letterSpacing={l.bold ? 0.3 : 0}
          />
        )
        y += l.size + 3
        return node
      })}
    </Group>
  )
}

function PlotShape({ el, selected, onSelect, onDragEnd, readOnly, locked, debugMode, onHover }) {
  const w = Math.max(el.width || 0, DEFAULT_W)
  const h = Math.max(el.height || 0, DEFAULT_H)
  const base = el.fillColor || '#22C55E'
  const shape = el.shape || 'rectangle'

  // Surveyed-parcel palette: soft tinted ground + saturated status border + dark labels
  const border = debugMode ? '#ff0000' : selected ? SELECT_COLOR : shade(base, -0.06)
  const strokeWidth = debugMode ? 3 : selected ? 3 : 2
  const darkText = shade(base, -0.62)
  const subText = shade(base, -0.34)
  const parcelGrad = {
    fillLinearGradientStartPoint: { x: 0, y: 0 },
    fillLinearGradientEndPoint: { x: 0, y: h },
    fillLinearGradientColorStops: [0, shade(base, 0.82), 1, shade(base, 0.66)],
  }
  const shadow = {
    shadowColor: '#0f172a',
    shadowBlur: selected ? 12 : 6,
    shadowOpacity: selected ? 0.32 : 0.2,
    shadowOffsetX: 0,
    shadowOffsetY: selected ? 4 : 2,
  }

  const num = el.metadata?.plotNumber || ''
  const wFt = Math.round(w / 4)
  const hFt = Math.round(h / 4)
  const area = el.metadata?.area || el.metadata?.size
  const big = w >= 70 && h >= 60
  const tall = h >= 88

  const lines = []
  if (num) lines.push({ t: num, size: Math.min(16, Math.max(11, w * 0.15)), color: darkText, bold: true })
  if (big) lines.push({ t: `${wFt}' × ${hFt}'`, size: 10, color: subText, bold: false })
  if (big && tall && area) lines.push({ t: `${area} sqft`, size: 9.5, color: subText, bold: false })

  const debug = debugMode && (
    <Text text={`${Math.round(el.x)},${Math.round(el.y)} ${Math.round(w)}×${Math.round(h)}`} x={0} y={h + 2} width={w} align="center" fontSize={8} fill="#ff6b6b" listening={false} />
  )

  const groupProps = makeGroupProps(el, { readOnly, locked, onSelect, onDragEnd, onHover })

  if (shape === 'circle') {
    const size = Math.max(w, h)
    const r = size / 2
    return (
      <Group {...groupProps}>
        <Circle x={r} y={r} radius={r} {...parcelGrad} fillLinearGradientEndPoint={{ x: 0, y: size }} stroke={border} strokeWidth={strokeWidth} {...shadow} />
        <PlotTextStack cx={r} cy={r} width={size} lines={lines} />
        {debug}
      </Group>
    )
  }

  if (shape === 'square') {
    const size = Math.max(w, h)
    return (
      <Group {...groupProps}>
        <Rect width={size} height={size} {...parcelGrad} fillLinearGradientEndPoint={{ x: 0, y: size }} stroke={border} strokeWidth={strokeWidth} cornerRadius={2} {...shadow} />
        <Rect x={4} y={4} width={size - 8} height={size - 8} cornerRadius={1} stroke={shade(base, -0.12)} strokeWidth={1} dash={[6, 4]} opacity={0.45} listening={false} />
        <PlotTextStack cx={size / 2} cy={size / 2} width={size} lines={lines} />
        {big && <Circle x={size - 9} y={9} radius={4} fill={base} stroke="#ffffff" strokeWidth={1.5} listening={false} />}
        {debug}
      </Group>
    )
  }

  if (shape === 'triangle' || shape === 'polygon' || shape === 'lShape') {
    const pts = el.points?.length ? el.points : getPolygonPoints(shape, w, h)
    return (
      <Group {...groupProps}>
        <Line points={pts} closed {...parcelGrad} stroke={border} strokeWidth={strokeWidth} {...shadow} lineJoin="round" />
        <PlotTextStack cx={w / 2} cy={h * 0.6} width={w} lines={lines.slice(0, 2)} />
        {debug}
      </Group>
    )
  }

  if (shape === 'freeDraw' && el.points?.length) {
    return (
      <Group {...groupProps}>
        <Line points={el.points} closed {...parcelGrad} stroke={border} strokeWidth={strokeWidth} {...shadow} lineJoin="round" />
        <PlotTextStack cx={w / 2} cy={h / 2} width={w} lines={lines.slice(0, 2)} />
        {debug}
      </Group>
    )
  }

  // Default rectangle parcel
  return (
    <Group {...groupProps}>
      <Rect width={w} height={h} {...parcelGrad} stroke={border} strokeWidth={strokeWidth} cornerRadius={2} {...shadow} />
      {/* setback line — like a surveyed plat */}
      <Rect x={4} y={4} width={w - 8} height={h - 8} cornerRadius={1} stroke={shade(base, -0.12)} strokeWidth={1} dash={[6, 4]} opacity={0.45} listening={false} />
      {/* status corner marker */}
      {big && <Circle x={w - 9} y={9} radius={4} fill={base} stroke="#ffffff" strokeWidth={1.5} listening={false} />}
      <PlotTextStack cx={w / 2} cy={h / 2} width={w} lines={lines} />
      {debug}
    </Group>
  )
}

/* ------------------------------- ROADS ------------------------------- */
function RoadShape({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover }) {
  const road = ROAD_TYPES.find((r) => r.id === el.metadata?.roadType) || ROAD_TYPES[0]
  const len = Math.max(el.width || 0, 200)
  const thickness = Math.max(14, (el.metadata?.roadWidth || 30) / 3)
  const curb = 3
  const groupProps = makeGroupProps(el, { readOnly, locked, onSelect, onDragEnd, onHover })

  const dash = Math.max(8, thickness * 0.6)
  const gap = Math.max(6, thickness * 0.45)

  return (
    <Group {...groupProps}>
      {/* curb / shoulder */}
      <Rect
        y={-curb}
        width={len}
        height={thickness + curb * 2}
        fill="#cbd2d9"
        cornerRadius={2}
        shadowColor="#0f172a"
        shadowBlur={4}
        shadowOpacity={0.18}
        shadowOffsetY={2}
      />
      {/* asphalt */}
      <Rect
        width={len}
        height={thickness}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: thickness }}
        fillLinearGradientColorStops={[0, '#4b5563', 0.5, '#3a4049', 1, '#2b3038']}
        stroke={selected ? SELECT_COLOR : '#1f2937'}
        strokeWidth={selected ? 2.5 : 1}
        cornerRadius={1}
      />
      {/* lane center marking */}
      <Line
        points={[8, thickness / 2, len - 8, thickness / 2]}
        stroke="#fbbf24"
        strokeWidth={Math.max(1.5, thickness * 0.09)}
        dash={[dash, gap]}
        listening={false}
        opacity={0.95}
      />
      {thickness > 22 && (
        <Text text={el.metadata?.roadName || road.label} x={8} y={2} width={len - 16} fontSize={8} fill="rgba(255,255,255,0.55)" listening={false} />
      )}
    </Group>
  )
}

/* ------------------------------- TREES ------------------------------- */
function treePositions(w, h) {
  const r = Math.max(9, Math.min(w, h) / 3)
  const stepX = r * 1.75
  const stepY = r * 1.75
  const out = []
  let idx = 0
  for (let cy = r; cy <= h - r * 0.1 && out.length < 40; cy += stepY) {
    for (let cx = r; cx <= w - r * 0.1 && out.length < 40; cx += stepX) {
      const jx = ((((idx * 37) % 9) / 9) - 0.5) * r * 0.4
      const jy = ((((idx * 53) % 9) / 9) - 0.5) * r * 0.4
      const rr = r * (0.82 + ((idx * 29) % 8) / 22)
      out.push({ x: cx + jx, y: cy + jy, r: rr })
      idx++
    }
  }
  if (!out.length) out.push({ x: w / 2, y: h / 2, r: Math.min(w, h) / 2.4 })
  return out
}

/** A single tree drawn side-on: trunk + layered leafy crown. (x, y) = crown center. */
function Tree({ x, y, r }) {
  const tw = Math.max(2, r * 0.22)
  const trunkH = r * 0.9
  const crown = [
    { dx: 0, dy: 0, rr: r },
    { dx: -r * 0.6, dy: r * 0.18, rr: r * 0.62 },
    { dx: r * 0.6, dy: r * 0.18, rr: r * 0.62 },
    { dx: 0, dy: -r * 0.55, rr: r * 0.6 },
  ]
  return (
    <>
      {/* ground shadow */}
      <Circle x={x} y={y + r * 1.35} radius={r * 0.78} scaleY={0.32} fill="#0f172a" opacity={0.15} listening={false} />
      {/* trunk */}
      <Rect
        x={x - tw / 2}
        y={y + r * 0.3}
        width={tw}
        height={trunkH}
        cornerRadius={tw / 2}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: tw, y: 0 }}
        fillLinearGradientColorStops={[0, '#a16207', 0.5, '#854d0e', 1, '#5c350b']}
        listening={false}
      />
      {/* crown — darker base for depth */}
      {crown.map((c, i) => (
        <Circle key={`b${i}`} x={x + c.dx} y={y + c.dy + r * 0.14} radius={c.rr} fill="#14532d" listening={false} />
      ))}
      {/* crown — lit foliage */}
      {crown.map((c, i) => (
        <Circle
          key={`f${i}`}
          x={x + c.dx}
          y={y + c.dy}
          radius={c.rr}
          fillRadialGradientStartPoint={{ x: -c.rr * 0.3, y: -c.rr * 0.3 }}
          fillRadialGradientStartRadius={0}
          fillRadialGradientEndPoint={{ x: 0, y: 0 }}
          fillRadialGradientEndRadius={c.rr}
          fillRadialGradientColorStops={[0, '#86efac', 0.55, '#22c55e', 1, '#15803d']}
          listening={false}
        />
      ))}
      {/* highlight */}
      <Circle x={x - r * 0.32} y={y - r * 0.34} radius={r * 0.22} fill="#bbf7d0" opacity={0.6} listening={false} />
    </>
  )
}

function TreeShape({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover }) {
  const w = Math.max(el.width || 0, 48)
  const h = Math.max(el.height || 0, 48)
  const groupProps = makeGroupProps(el, { readOnly, locked, onSelect, onDragEnd, onHover })
  const trees = treePositions(w, h)
  return (
    <Group {...groupProps}>
      {selected && <Rect x={-6} y={-6} width={w + 12} height={h + 12} stroke={SELECT_COLOR} strokeWidth={2} dash={[6, 4]} cornerRadius={8} />}
      {trees.map((p, i) => <Tree key={i} {...p} />)}
    </Group>
  )
}

/* ------------------------------- PARK ------------------------------- */
function ParkShape({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover }) {
  const w = Math.max(el.width || 0, 60)
  const h = Math.max(el.height || 0, 48)
  const label = el.metadata?.label || LANDSCAPE_ICONS.park.label
  const groupProps = makeGroupProps(el, { readOnly, locked, onSelect, onDragEnd, onHover })
  const trees = treePositions(w * 0.88, h * 0.7).filter((_, i) => i % 2 === 0).slice(0, 7)
  const treeR = Math.min(h / 4, w / 6, 22)
  return (
    <Group {...groupProps}>
      <Rect
        width={w}
        height={h}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: h }}
        fillLinearGradientColorStops={[0, '#bbf7d0', 1, '#86efac']}
        stroke={selected ? SELECT_COLOR : '#4ade80'}
        strokeWidth={selected ? 3 : 1.5}
        cornerRadius={8}
        shadowColor="#0f172a"
        shadowBlur={5}
        shadowOpacity={0.15}
        shadowOffsetY={2}
      />
      {/* curved pathway */}
      <Line points={[w * 0.1, h * 0.82, w * 0.4, h * 0.55, w * 0.65, h * 0.6, w * 0.92, h * 0.3]} stroke="#e7d9b8" strokeWidth={Math.max(3, h * 0.06)} tension={0.5} lineCap="round" listening={false} opacity={0.85} />
      {trees.map((p, i) => <Tree key={i} x={p.x + w * 0.06} y={p.y + h * 0.08} r={Math.min(p.r, treeR)} />)}
      <Text text={label} x={0} y={h - 15} width={w} align="center" fontSize={10} fontStyle="600" fill="#166534" listening={false} />
    </Group>
  )
}

/* ----------------------------- AMENITIES ----------------------------- */
function AmenityShape({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover }) {
  const w = Math.max(el.width || 0, 48)
  const h = Math.max(el.height || 0, 48)
  const a = AMENITY_TYPES.find((x) => x.id === el.subtype || x.id === el.metadata?.amenityType)
  const icon = a?.icon || el.text || '🏛️'
  const label = a?.label || el.metadata?.label || ''
  const color = a?.color || el.fillColor || '#8B5CF6'
  const groupProps = makeGroupProps(el, { readOnly, locked, onSelect, onDragEnd, onHover })
  const iconSize = Math.min(w, h) * 0.46

  return (
    <Group {...groupProps}>
      <Rect
        width={w}
        height={h}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: h }}
        fillLinearGradientColorStops={[0, shade(color, 0.7), 1, shade(color, 0.5)]}
        stroke={selected ? SELECT_COLOR : color}
        strokeWidth={selected ? 3 : 1.5}
        cornerRadius={10}
        shadowColor="#0f172a"
        shadowBlur={6}
        shadowOpacity={0.18}
        shadowOffsetY={2}
      />
      <Rect x={0} y={0} width={w} height={Math.max(6, h * 0.16)} fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: w, y: 0 }} fillLinearGradientColorStops={[0, color, 1, shade(color, -0.2)]} cornerRadius={[10, 10, 0, 0]} listening={false} />
      <Text text={icon} x={0} y={h / 2 - iconSize / 2 - 2} width={w} align="center" fontSize={iconSize} listening={false} />
      {label && h > 40 && (
        <Text text={label} x={2} y={h - 14} width={w - 4} align="center" fontSize={9} fontStyle="600" fill={shade(color, -0.4)} listening={false} />
      )}
    </Group>
  )
}

/* ----------------------------- MARKER ----------------------------- */
function MarkerShape({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover }) {
  const w = Math.max(el.width || 0, 32)
  const h = Math.max(el.height || 0, 32)
  const icon = el.text || '📍'
  const label = el.metadata?.label || 'Marker'
  const groupProps = makeGroupProps(el, { readOnly, locked, onSelect, onDragEnd, onHover })
  return (
    <Group {...groupProps}>
      {selected && <Circle x={w / 2} y={h / 2} radius={Math.max(w, h) / 2 + 3} stroke={SELECT_COLOR} strokeWidth={2} dash={[5, 3]} />}
      <Text text={icon} x={0} y={0} width={w} height={h} align="center" verticalAlign="middle" fontSize={Math.min(w, h)} listening={false} />
      {label && <Text text={label} x={-20} y={h + 1} width={w + 40} align="center" fontSize={9} fontStyle="600" fill="#475569" listening={false} />}
    </Group>
  )
}

/* ----------------------------- BOUNDARY ----------------------------- */
function BoundaryShape({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover }) {
  const w = Math.max(el.width || 0, 100)
  const h = Math.max(el.height || 0, 20)
  const groupProps = makeGroupProps(el, { readOnly, locked, onSelect, onDragEnd, onHover })
  return (
    <Group {...groupProps}>
      <Rect width={w} height={h} fill="rgba(120,113,108,0.06)" stroke={selected ? SELECT_COLOR : '#92400e'} strokeWidth={5} cornerRadius={2} />
      <Rect x={4} y={4} width={Math.max(w - 8, 1)} height={Math.max(h - 8, 1)} stroke={selected ? SELECT_COLOR : '#b45309'} strokeWidth={1.5} dash={[10, 6]} cornerRadius={1} listening={false} />
    </Group>
  )
}

/* ----------------------------- TEXT ----------------------------- */
function TextShape({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover }) {
  const w = Math.max(el.width || 0, 100)
  const h = Math.max(el.height || 0, 40)
  const groupProps = makeGroupProps(el, { readOnly, locked, onSelect, onDragEnd, onHover })
  return (
    <Group {...groupProps}>
      <Rect width={w} height={h} fill="rgba(255,255,255,0.82)" stroke={selected ? SELECT_COLOR : '#cbd5e1'} strokeWidth={selected ? 2 : 1} cornerRadius={6} shadowColor="#0f172a" shadowBlur={4} shadowOpacity={0.1} shadowOffsetY={1} />
      <Text text={el.text || 'Label'} x={8} y={0} width={w - 16} height={h} verticalAlign="middle" fontSize={14} fontStyle="600" fontFamily="Inter, sans-serif" fill={el.fillColor || '#334155'} listening={false} />
    </Group>
  )
}

export default function CanvasElement({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover, debugMode }) {
  const handlers = { selected, onSelect, onDragEnd, readOnly, locked, debugMode, onHover }

  if (el.type === 'plot') return <PlotShape el={el} {...handlers} />
  if (el.type === 'road') return <RoadShape el={el} {...handlers} />
  if (el.type === 'landscape') {
    const subtype = el.subtype || el.metadata?.landscapeType || 'park'
    return subtype === 'tree' ? <TreeShape el={el} {...handlers} /> : <ParkShape el={el} {...handlers} />
  }
  if (el.type === 'amenity') return <AmenityShape el={el} {...handlers} />
  if (el.type === 'boundary') return <BoundaryShape el={el} {...handlers} />
  if (el.type === 'marker') return <MarkerShape el={el} {...handlers} />
  if (el.type === 'text') return <TextShape el={el} {...handlers} />
  return null
}
