import { useRef } from 'react'

import { Stage, Layer, Rect } from 'react-konva'

import useLayoutStore from '../store/layoutStore'



export default function Minimap({ canvasWidth, canvasHeight }) {

  const { elements, viewport, setViewport } = useLayoutStore()

  const w = 160

  const h = 100



  const bounds = elements.reduce(

    (acc, el) => ({

      minX: Math.min(acc.minX, el.x),

      minY: Math.min(acc.minY, el.y),

      maxX: Math.max(acc.maxX, el.x + (el.width || 50)),

      maxY: Math.max(acc.maxY, el.y + (el.height || 50)),

    }),

    { minX: 0, minY: 0, maxX: 1200, maxY: 800 }

  )



  const layoutW = Math.max(bounds.maxX - bounds.minX, 400)

  const layoutH = Math.max(bounds.maxY - bounds.minY, 300)

  const scale = Math.min(w / layoutW, h / layoutH) * 0.9



  const vpW = canvasWidth / viewport.scale

  const vpH = canvasHeight / viewport.scale

  const vpX = (-viewport.x / viewport.scale - bounds.minX) * scale

  const vpY = (-viewport.y / viewport.scale - bounds.minY) * scale



  const handleClick = (e) => {

    const stage = e.target.getStage()

    const pos = stage.getPointerPosition()

    if (!pos) return

    const worldX = pos.x / scale + bounds.minX

    const worldY = pos.y / scale + bounds.minY

    setViewport({

      x: canvasWidth / 2 - worldX * viewport.scale,

      y: canvasHeight / 2 - worldY * viewport.scale,

    })

  }



  if (!elements.length) return null



  return (

    <div className="absolute bottom-3 right-3 z-30 pointer-events-auto rounded-lg border border-slate-200 bg-white/95 backdrop-blur-sm p-2 shadow-lg">

      <p className="text-[9px] font-medium text-slate-500 mb-1">Overview</p>

      <Stage width={w} height={h} onClick={handleClick}>

        <Layer>

          <Rect x={0} y={0} width={w} height={h} fill="#F1F5F9" />

          {elements.map((el) => (

            <Rect

              key={el.id}

              x={(el.x - bounds.minX) * scale}

              y={(el.y - bounds.minY) * scale}

              width={Math.max(2, (el.width || 40) * scale)}

              height={Math.max(2, (el.height || 30) * scale)}

              fill={el.fillColor?.startsWith('#') ? el.fillColor : '#22C55E'}

              opacity={0.75}

            />

          ))}

          <Rect

            x={vpX}

            y={vpY}

            width={vpW * scale}

            height={vpH * scale}

            stroke="#6366F1"

            strokeWidth={1.5}

            fill="rgba(99,102,241,0.1)"

          />

        </Layer>

      </Stage>

    </div>

  )

}


