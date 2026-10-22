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
}

type Pixel = { x: number; y: number; createdAt: number }

export default function PixelTrail({
  gridSize = 50,
  trailSize = 0.1,
  maxAge = 500,
  interpolate = 5,
  color = '#bba9ff',
  trailColor = '#72b8ff',
  glow = 0.35,
}: PixelTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let animationFrame = 0
    let pixels: Pixel[] = []
    let lastPoint: { x: number; y: number } | null = null

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * ratio
      canvas.height = window.innerHeight * ratio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const addPoint = (x: number, y: number) => {
      const spacing = Math.max(1, gridSize / Math.max(1, interpolate))
      const start = lastPoint ?? { x, y }
      const distance = Math.hypot(x - start.x, y - start.y)
      const steps = Math.max(1, Math.ceil(distance / spacing))
      for (let index = 1; index <= steps; index += 1) {
        const progress = index / steps
        pixels.push({
          x: start.x + (x - start.x) * progress,
          y: start.y + (y - start.y) * progress,
          createdAt: performance.now(),
        })
      }
      lastPoint = { x, y }
      if (pixels.length > 500) pixels = pixels.slice(-500)
    }

    const handlePointerMove = (event: PointerEvent) => addPoint(event.clientX, event.clientY)

    const draw = (now: number) => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      pixels = pixels.filter((pixel) => now - pixel.createdAt < maxAge)
      pixels.forEach((pixel, index) => {
        const age = (now - pixel.createdAt) / maxAge
        const opacity = Math.max(0, 1 - age) * (0.35 + trailSize * 0.65)
        const size = Math.max(2, gridSize * 0.08)
        context.globalAlpha = opacity
        context.fillStyle = index % 4 === 0 ? color : trailColor
        context.shadowColor = context.fillStyle
        context.shadowBlur = glow * 18
        context.fillRect(Math.round(pixel.x / size) * size, Math.round(pixel.y / size) * size, size, size)
      })
      context.globalAlpha = 1
      context.shadowBlur = 0
      animationFrame = requestAnimationFrame(draw)
    }

    resize()
    animationFrame = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [color, glow, gridSize, interpolate, maxAge, trailColor, trailSize])

  return <canvas ref={canvasRef} aria-hidden="true" className="pixel-trail pointer-events-none fixed inset-0" />
}
