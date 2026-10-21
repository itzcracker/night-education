'use client'

import { useEffect, useRef } from 'react'
import './pixel-trail.css'

type PixelTrailProps = {
  gridSize?: number
  trailSize?: number
  maxAge?: number
  interpolate?: number
  color?: string
  trailColor?: string
  glow?: number
  className?: string
}

export default function PixelTrail({
  gridSize = 44,
  trailSize = 0.11,
  maxAge = 520,
  interpolate = 5,
  color = '#bba9ff',
  trailColor = '#72b8ff',
  glow = 0.35,
  className = '',
}: PixelTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    const context = canvas?.getContext('2d')
    if (!canvas || !host || !context) return

    type Point = { x: number; y: number; born: number; strength: number }
    let points: Point[] = []
    let frame = 0
    let width = 1
    let height = 1

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = host.clientWidth
      height = host.clientHeight
      canvas.width = Math.max(1, width * ratio)
      canvas.height = Math.max(1, height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const addPoint = (x: number, y: number, now: number, strength = 1) => {
      const previous = points[points.length - 1]
      if (previous) {
        const distance = Math.hypot(x - previous.x, y - previous.y)
        const steps = Math.min(interpolate * 4, Math.max(1, Math.ceil(distance / 12)))
        for (let index = 1; index < steps; index += 1) {
          const progress = index / steps
          points.push({ x: previous.x + (x - previous.x) * progress, y: previous.y + (y - previous.y) * progress, born: now, strength })
        }
      }
      points.push({ x, y, born: now, strength })
      if (points.length > 180) points = points.slice(-180)
    }

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height)
      const cell = Math.max(width, height) / gridSize
      points = points.filter((point) => now - point.born < maxAge)
      points.forEach((point, index) => {
        const age = Math.min(1, (now - point.born) / maxAge)
        const opacity = (1 - age) * 0.62 * point.strength
        const size = Math.max(2, cell * trailSize * (1 - age * 0.35))
        const x = Math.round(point.x / cell) * cell
        const y = Math.round(point.y / cell) * cell
        context.globalAlpha = opacity * glow
        context.fillStyle = trailColor
        context.fillRect(x - size, y - size, size * 2, size * 2)
        context.globalAlpha = opacity
        context.fillStyle = index % 3 === 0 ? color : trailColor
        context.fillRect(x - size / 2, y - size / 2, size, size)
      })
      context.globalAlpha = 1
      if (points.length) frame = requestAnimationFrame(draw)
    }

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return
      addPoint(event.clientX - rect.left, event.clientY - rect.top, performance.now())
      if (!frame) frame = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [color, glow, gridSize, interpolate, maxAge, trailColor, trailSize])

  return <div className={`pixel-trail ${className}`.trim()} aria-hidden="true"><canvas ref={canvasRef} /></div>
}
