import { useEffect, useRef } from 'react'
import './alpine-atmosphere.css'

type Flake = {
  x: number
  y: number
  depth: number
  radius: number
  opacity: number
  phase: number
  glint: boolean
}

/** A quiet foreground layer. The mountain photograph remains the focal point. */
export default function AlpineAtmosphere({ reducedMotion }: { reducedMotion: boolean }) {
  const mount = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = mount.current
    if (!host) return
    const canvas = host.querySelector('canvas')!
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return

    let width = 1
    let height = 1
    let bounds = host.getBoundingClientRect()
    let flakes: Flake[] = []
    let frame = 0
    let previous = 0
    let elapsed = 0
    let visible = false
    let pointerX = 0
    let pointerY = 0
    let currentX = 0
    let currentY = 0
    let disposed = false

    function seedFlakes() {
      let seed = 2300
      const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
        return seed / 4294967296
      }
      const count = reducedMotion ? 18 : width < 640 ? 65 : 180
      flakes = Array.from({ length: count }, (_, index) => ({
        x: random() * 2.6 - 1.3,
        y: random() * 2.5 - 1.25,
        depth: 0.3 + random() * 0.7,
        radius: 0.45 + random() * 1.1,
        opacity: 0.14 + random() * 0.35,
        phase: random() * Math.PI * 2,
        glint: index % 31 === 0,
      }))
    }

    function draw(delta: number) {
      context!.clearRect(0, 0, width, height)
      const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * 2.8)
      currentX += (pointerX - currentX) * ease
      currentY += (pointerY - currentY) * ease
      for (const flake of flakes) {
        if (!reducedMotion) {
          flake.y += delta * (0.023 + flake.depth * 0.023)
          flake.x += delta * (0.009 + Math.sin(elapsed * 0.2 + flake.phase) * 0.009)
          if (flake.y > 1.3) flake.y = -1.3
          if (flake.x > 1.35) flake.x = -1.35
        }
        const perspective = 1.25 - flake.depth * 0.55
        const x = width * 0.5 + flake.x * width * 0.5 * perspective + currentX * (1 - flake.depth) * 22
        const y = height * 0.5 + flake.y * height * 0.5 * perspective + currentY * (1 - flake.depth) * 12
        const pulse = reducedMotion ? 0.6 : 0.65 + Math.sin(elapsed * 0.7 + flake.phase) * 0.35
        const opacity = flake.opacity * (0.7 + pulse * 0.3)
        const radius = flake.radius * perspective
        context!.fillStyle = `rgba(246,251,255,${opacity})`
        context!.beginPath()
        context!.arc(x, y, radius, 0, Math.PI * 2)
        context!.fill()
        if (flake.glint && !reducedMotion && pulse > 0.9) {
          context!.strokeStyle = `rgba(246,251,255,${(pulse - 0.9) * 1.4})`
          context!.lineWidth = 0.65
          context!.beginPath()
          context!.moveTo(x - 4, y)
          context!.lineTo(x + 4, y)
          context!.moveTo(x, y - 4)
          context!.lineTo(x, y + 4)
          context!.stroke()
        }
      }
    }

    function animate(timestamp: number) {
      frame = 0
      if (disposed || reducedMotion || !visible || document.hidden) return
      const delta = previous ? Math.min((timestamp - previous) / 1000, 0.05) : 0
      previous = timestamp
      elapsed += delta
      draw(delta)
      frame = requestAnimationFrame(animate)
    }

    function resume() {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      previous = 0
      if (!disposed && !reducedMotion && visible && !document.hidden) frame = requestAnimationFrame(animate)
    }

    function resize() {
      bounds = host!.getBoundingClientRect()
      width = Math.max(1, bounds.width)
      height = Math.max(1, bounds.height)
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
      seedFlakes()
      draw(0)
    }

    function move(event: PointerEvent) {
      if (reducedMotion || event.pointerType === 'touch') return
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / width - 0.5) * 2))
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / height - 0.5) * 2))
    }
    function resetPointer() { pointerX = 0; pointerY = 0 }

    const parent = host.parentElement
    parent?.addEventListener('pointermove', move)
    parent?.addEventListener('pointerleave', resetPointer)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) bounds = host.getBoundingClientRect()
      resume()
    })
    visibilityObserver.observe(host)
    document.addEventListener('visibilitychange', resume)
    resize()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      document.removeEventListener('visibilitychange', resume)
      parent?.removeEventListener('pointermove', move)
      parent?.removeEventListener('pointerleave', resetPointer)
    }
  }, [reducedMotion])

  return <div className="alpine-atmosphere" ref={mount} aria-hidden="true"><canvas /></div>
}
