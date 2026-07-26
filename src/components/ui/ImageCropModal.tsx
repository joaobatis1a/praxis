import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ZoomIn } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './Button'
import { Modal } from './Modal'

const VIEWPORT = 280
const OUTPUT_SIZE = 512
const MAX_USER_SCALE = 3

interface Offset {
  x: number
  y: number
}

export interface ImageCropModalProps {
  file: File | null
  open: boolean
  onCancel: () => void
  onConfirm: (file: File) => void
  /** 'circle' just changes the visual mask — the exported image is always a square. */
  shape?: 'circle' | 'square'
  title?: string
}

/** Lets the user pan/zoom a just-picked image so it lands fully framed instead of an arbitrary
 * center-crop — shared by profile photo and company logo uploads. No cropping library: the math
 * is the standard "cover" clamp (base scale so the image always fully covers the square viewport,
 * pan clamped so no edge ever reveals empty space), rendered to a canvas on confirm. */
export function ImageCropModal({ file, open, onCancel, onConfirm, shape = 'circle', title = 'Ajustar foto' }: ImageCropModalProps) {
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null)
  const [baseScale, setBaseScale] = useState(1)
  const [userScale, setUserScale] = useState(1)
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; startOffset: Offset } | null>(null)

  useEffect(() => {
    if (!file || !open) {
      setImgEl(null)
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.max(VIEWPORT / img.naturalWidth, VIEWPORT / img.naturalHeight)
      setBaseScale(scale)
      setUserScale(1)
      setOffset({
        x: (VIEWPORT - img.naturalWidth * scale) / 2,
        y: (VIEWPORT - img.naturalHeight * scale) / 2,
      })
      setImgEl(img)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file, open])

  const scale = baseScale * userScale

  function clamp(next: Offset, s: number): Offset {
    if (!imgEl) return next
    const w = imgEl.naturalWidth * s
    const h = imgEl.naturalHeight * s
    const minX = Math.min(0, VIEWPORT - w)
    const minY = Math.min(0, VIEWPORT - h)
    return {
      x: Math.min(0, Math.max(minX, next.x)),
      y: Math.min(0, Math.max(minY, next.y)),
    }
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, startOffset: offset }
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setOffset(
      clamp(
        { x: dragRef.current.startOffset.x + dx, y: dragRef.current.startOffset.y + dy },
        scale,
      ),
    )
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  function handleZoomChange(nextUserScale: number) {
    setUserScale(nextUserScale)
    setOffset((prev) => clamp(prev, baseScale * nextUserScale))
  }

  function handleConfirm() {
    if (!imgEl) return
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cropX = -offset.x / scale
    const cropY = -offset.y / scale
    const cropSize = VIEWPORT / scale
    ctx.drawImage(imgEl, cropX, cropY, cropSize, cropSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    canvas.toBlob((blob) => {
      if (!blob) return
      onConfirm(new File([blob], 'foto.png', { type: 'image/png' }))
    }, 'image/png')
  }

  return (
    <Modal open={open} onClose={onCancel} title={title} description="Arraste para posicionar e use o zoom para ajustar o enquadramento.">
      <div className="flex flex-col items-center gap-4">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative touch-none overflow-hidden rounded-lg border border-border bg-surface"
          style={{ width: VIEWPORT, height: VIEWPORT, cursor: imgEl ? 'grab' : 'default' }}
        >
          {imgEl && (
            <img
              src={imgEl.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-0 top-0 max-w-none select-none"
              style={{
                width: imgEl.naturalWidth * scale,
                height: imgEl.naturalHeight * scale,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}
          <div
            className={cn(
              'pointer-events-none absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]',
              shape === 'circle' ? 'rounded-full m-auto h-[85%] w-[85%]' : 'rounded-lg m-2',
            )}
          />
        </div>

        <div className="flex w-full max-w-[280px] items-center gap-2">
          <ZoomIn size={16} className="shrink-0 text-text-muted" />
          <input
            type="range"
            min={1}
            max={MAX_USER_SCALE}
            step={0.01}
            value={userScale}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-full accent-primary"
            aria-label="Zoom da foto"
          />
        </div>

        <div className="flex w-full justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!imgEl}>
            Usar foto
          </Button>
        </div>
      </div>
    </Modal>
  )
}
