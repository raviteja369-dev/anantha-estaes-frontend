import { Group, Rect, Circle, Line, Text } from 'react-konva'
import { AMENITY_TYPES, LANDSCAPE_ICONS, ROAD_TYPES } from '../constants'
import { formatPlotLabel, getPolygonPoints } from '../utils/geometry'

const DEFAULT_W = 120
const DEFAULT_H = 80

function PlotShape({ el, selected, onSelect, onDragEnd, readOnly, locked, debugMode, onHover }) {
  const w = Math.max(el.width || 0, DEFAULT_W)
  const h = Math.max(el.height || 0, DEFAULT_H)
  const fill = el.fillColor || '#22C55E'
  const stroke = el.strokeColor || '#15803D'
  const centerY = h / 2
  const labelLines = formatPlotLabel(el)

  const labels = (
    <Group listening={false}>
      {labelLines.map((line, i) => (
        <Text
          key={i}
          text={line}
          x={0}
          y={centerY - 14 + i * 14}
          width={w}
          align="center"
          fontSize={i === 0 ? 13 : 10}
          fontStyle={i === 0 ? 'bold' : 'normal'}
          fill="#ffffff"
          shadowColor="#000000"
          shadowBlur={4}
          shadowOpacity={0.6}
        />
      ))}
      {debugMode && (
        <Text
          text={`${Math.round(el.x)},${Math.round(el.y)} ${Math.round(w)}×${Math.round(h)}`}
          x={0}
          y={h + 2}
          width={w}
          align="center"
          fontSize={8}
          fill="#ff6b6b"
        />
      )}
    </Group>
  )

  const groupProps = {
    id: `node-${el.id}`,
    x: el.x,
    y: el.y,
    rotation: el.rotation || 0,
    opacity: 1,
    visible: true,
    draggable: !readOnly && !locked,
    onClick: (e) => { e.cancelBubble = true; onSelect(el.id, e.evt.shiftKey) },
    onTap: (e) => { e.cancelBubble = true; onSelect(el.id) },
    onDragEnd: (e) => onDragEnd(el.id, e.target.x(), e.target.y()),
    onMouseEnter: (e) => { onHover?.(el.id); if (readOnly && !locked) { const stage = e.target.getStage(); if (stage) stage.container().style.cursor = 'pointer' } },
    onMouseLeave: (e) => { onHover?.(null); if (readOnly) { const stage = e.target.getStage(); if (stage) stage.container().style.cursor = 'grab' } },
  }

  if (el.shape === 'circle') {
    const size = Math.max(w, h)
    const r = size / 2
    return (
      <Group {...groupProps}>
        <Circle x={r} y={r} radius={r} fill={fill} stroke={debugMode ? '#ff0000' : stroke} strokeWidth={debugMode ? 3 : selected ? 3 : 2} />
        {labels}
      </Group>
    )
  }

  if (el.shape === 'square') {
    const size = Math.max(w, h)
    return (
      <Group {...groupProps}>
        <Rect
          width={size}
          height={size}
          fill={fill}
          stroke={debugMode ? '#ff0000' : stroke}
          strokeWidth={debugMode ? 3 : selected ? 3 : 2}
          cornerRadius={2}
          opacity={1}
        />
        {labels}
      </Group>
    )
  }

  if (el.shape === 'triangle' || el.shape === 'polygon' || el.shape === 'lShape') {
    const pts = el.points?.length ? el.points : getPolygonPoints(el.shape, w, h)
    return (
      <Group {...groupProps}>
        <Line points={pts} closed fill={fill} stroke={debugMode ? '#ff0000' : stroke} strokeWidth={debugMode ? 3 : 2} />
        {labels}
      </Group>
    )
  }

  if (el.shape === 'freeDraw' && el.points?.length) {
    return (
      <Group {...groupProps}>
        <Line points={el.points} closed fill={fill} stroke={debugMode ? '#ff0000' : stroke} strokeWidth={debugMode ? 3 : 2} />
        {labels}
      </Group>
    )
  }

  return (
    <Group {...groupProps}>
      <Rect
        width={w}
        height={h}
        fill={fill}
        stroke={debugMode ? '#ff0000' : stroke}
        strokeWidth={debugMode ? 3 : selected ? 3 : 2}
        cornerRadius={4}
        opacity={1}
      />
      {labels}
    </Group>
  )
}

function RoadShape({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover }) {
  const road = ROAD_TYPES.find((r) => r.id === el.metadata?.roadType) || ROAD_TYPES[0]
  const w = Math.max(el.width || 0, 200)
  const h = Math.max(12, (el.metadata?.roadWidth || 30) / 3)
  return (
    <Group
      id={`node-${el.id}`}
      x={el.x}
      y={el.y}
      opacity={1}
      visible
      draggable={!readOnly && !locked}
      rotation={el.rotation || 0}
      onClick={(e) => { e.cancelBubble = true; onSelect(el.id, e.evt.shiftKey) }}
      onDragEnd={(e) => onDragEnd(el.id, e.target.x(), e.target.y())}
      onMouseEnter={() => onHover?.(el.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Rect width={w} height={h} fill="#374151" stroke={selected ? '#60A5FA' : '#1F2937'} strokeWidth={selected ? 3 : 1} cornerRadius={2} />
      <Text text={`${el.metadata?.roadName || road.label}`} x={4} y={2} width={w - 8} fontSize={9} fill="#E5E7EB" listening={false} />
    </Group>
  )
}

function IconShape({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover }) {
  const w = Math.max(el.width || 0, 48)
  const h = Math.max(el.height || 0, 48)
  let icon = el.text || '🌳'
  let label = ''
  if (el.type === 'amenity') {
    const a = AMENITY_TYPES.find((x) => x.id === el.subtype || x.id === el.metadata?.amenityType)
    icon = a?.icon || '🏛️'
    label = a?.label || ''
  } else if (el.type === 'landscape') {
    const key = el.subtype || el.metadata?.landscapeType || 'park'
    const info = LANDSCAPE_ICONS[key] || LANDSCAPE_ICONS.park
    icon = info.icon
    label = el.metadata?.label || info.label || ''
  } else if (el.type === 'marker') {
    icon = el.text || '📍'
    label = el.metadata?.label || 'Marker'
  }

  return (
    <Group
      id={`node-${el.id}`}
      x={el.x}
      y={el.y}
      opacity={1}
      visible
      draggable={!readOnly && !locked}
      onClick={(e) => { e.cancelBubble = true; onSelect(el.id, e.evt.shiftKey) }}
      onDragEnd={(e) => onDragEnd(el.id, e.target.x(), e.target.y())}
      onMouseEnter={() => onHover?.(el.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Rect width={w} height={h} fill={el.fillColor || '#059669'} opacity={0.35} stroke={selected ? '#60A5FA' : el.strokeColor} strokeWidth={2} cornerRadius={8} />
      <Text text={icon} x={0} y={h / 2 - 14} width={w} align="center" fontSize={24} listening={false} />
      {label && <Text text={label} x={0} y={h + 2} width={w} align="center" fontSize={8} fill="#94A3B8" listening={false} />}
    </Group>
  )
}

function BoundaryShape({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover }) {
  const w = Math.max(el.width || 0, 100)
  const h = Math.max(el.height || 0, 20)
  return (
    <Group
      id={`node-${el.id}`}
      x={el.x}
      y={el.y}
      opacity={1}
      visible
      draggable={!readOnly && !locked}
      rotation={el.rotation || 0}
      onClick={(e) => { e.cancelBubble = true; onSelect(el.id, e.evt.shiftKey) }}
      onDragEnd={(e) => onDragEnd(el.id, e.target.x(), e.target.y())}
      onMouseEnter={() => onHover?.(el.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Rect width={w} height={h} fill="rgba(120,113,108,0.15)" stroke={selected ? '#60A5FA' : '#78716C'} strokeWidth={4} dash={[8, 4]} />
    </Group>
  )
}

function TextShape({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover }) {
  const w = Math.max(el.width || 0, 100)
  const h = Math.max(el.height || 0, 40)
  return (
    <Group
      id={`node-${el.id}`}
      x={el.x}
      y={el.y}
      opacity={1}
      visible
      draggable={!readOnly && !locked}
      onClick={(e) => { e.cancelBubble = true; onSelect(el.id, e.evt.shiftKey) }}
      onDragEnd={(e) => onDragEnd(el.id, e.target.x(), e.target.y())}
      onMouseEnter={() => onHover?.(el.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Rect width={w} height={h} fill="rgba(255,255,255,0.6)" stroke={selected ? '#6366F1' : '#CBD5E1'} strokeWidth={1} cornerRadius={4} />
      <Text text={el.text || 'Label'} x={4} y={8} width={w - 8} fontSize={14} fill={el.fillColor || '#334155'} listening={false} />
    </Group>
  )
}

export default function CanvasElement({ el, selected, onSelect, onDragEnd, readOnly, locked, onHover, debugMode }) {
  const handlers = { selected, onSelect, onDragEnd, readOnly, locked, debugMode, onHover }

  if (el.type === 'plot') return <PlotShape el={el} {...handlers} />
  if (el.type === 'road') return <RoadShape el={el} {...handlers} />
  if (el.type === 'landscape' || el.type === 'amenity') return <IconShape el={el} {...handlers} />
  if (el.type === 'boundary') return <BoundaryShape el={el} {...handlers} />
  if (el.type === 'marker') return <IconShape el={el} {...handlers} />
  if (el.type === 'text') return <TextShape el={el} {...handlers} />
  return null
}
