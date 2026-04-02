/**
 * Custom canvas-based heatmap overlay for Google Maps.
 * Replaces the deprecated google.maps.visualization.HeatmapLayer (deprecated May 2025).
 *
 * IMPORTANT: The class must NOT extend google.maps.OverlayView at module scope —
 * that reference is evaluated when the file is first imported, before the Maps
 * script has loaded. Instead the class is defined inside a factory function so
 * the prototype chain is set up only at call-time (after Maps is ready).
 *
 * Rendering strategy:
 *  1. Append a <canvas> to the `overlayLayer` pane, which uses the same
 *     coordinate space as fromLatLngToDivPixel.
 *  2. In draw(), size + position the canvas to cover the current viewport
 *     exactly by projecting the map's SW/NE corners.
 *  3. For each point, draw a weighted radial gradient into an offscreen
 *     "intensity" canvas (black channel = heat).
 *  4. Colorize every pixel via a 256-stop lookup table.
 */

export interface RawHeatmapPoint {
  lat: number
  lng: number
  weight: number // 0–1
}

export interface CanvasHeatmapOptions {
  radius?: number
  opacity?: number
  gradient?: string[]
}

const DEFAULT_GRADIENT = [
  'rgba(0, 255, 255, 0)',
  'rgba(0, 255, 255, 1)',
  'rgba(0, 191, 255, 1)',
  'rgba(0, 127, 255, 1)',
  'rgba(0, 63, 255, 1)',
  'rgba(0, 255, 0, 1)',
  'rgba(127, 255, 0, 1)',
  'rgba(255, 255, 0, 1)',
  'rgba(255, 127, 0, 1)',
  'rgba(255, 63, 0, 1)',
  'rgba(255, 0, 0, 1)',
]

function buildColorRamp(gradient: string[]): Uint8ClampedArray {
  const rampCanvas = document.createElement('canvas')
  rampCanvas.width = 1
  rampCanvas.height = 256
  const ctx = rampCanvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  gradient.forEach((color, i) => {
    grad.addColorStop(i / (gradient.length - 1), color)
  })
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1, 256)
  return ctx.getImageData(0, 0, 1, 256).data
}

/**
 * Factory — call this AFTER google.maps has been loaded.
 * Returns a fully initialised overlay instance ready for setMap().
 */
export function createHeatmapOverlay(options: CanvasHeatmapOptions = {}) {
  const radius = options.radius ?? 35
  const opacity = options.opacity ?? 0.75
  const colorRamp = buildColorRamp(options.gradient ?? DEFAULT_GRADIENT)

  // Class defined here so `google.maps.OverlayView` is resolved at call-time.
  class HeatmapOverlay extends google.maps.OverlayView {
    private _points: RawHeatmapPoint[] = []
    private _canvas: HTMLCanvasElement

    constructor() {
      super()
      this._canvas = document.createElement('canvas')
      this._canvas.style.position = 'absolute'
      this._canvas.style.pointerEvents = 'none'
    }

    onAdd(): void {
      const panes = this.getPanes()
      if (panes) {
        // overlayLayer sits between base tiles and labels/controls
        // and shares the fromLatLngToDivPixel coordinate space.
        panes.overlayLayer.appendChild(this._canvas)
      }
    }

    draw(): void {
      const projection = this.getProjection()
      const map = this.getMap() as google.maps.Map | null
      if (!projection || !map) return

      const bounds = map.getBounds()
      if (!bounds) return

      // Project viewport corners to div-pixel space.
      const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest())
      const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast())
      if (!sw || !ne) return

      const left = Math.floor(sw.x)
      const top = Math.floor(ne.y)
      const width = Math.ceil(ne.x - sw.x)
      const height = Math.ceil(sw.y - ne.y)

      if (width <= 0 || height <= 0) return

      // Position canvas to cover exactly the visible viewport.
      this._canvas.style.left = `${left}px`
      this._canvas.style.top = `${top}px`
      this._canvas.width = width
      this._canvas.height = height

      // ── Step 1: build intensity map ────────────────────────────────────────
      const offscreen = document.createElement('canvas')
      offscreen.width = width
      offscreen.height = height
      const ictx = offscreen.getContext('2d')!

      for (const pt of this._points) {
        const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(pt.lat, pt.lng))
        if (!pixel) continue

        const x = pixel.x - left
        const y = pixel.y - top
        const r = radius

        if (x < -r || x > width + r || y < -r || y > height + r) continue

        const grad = ictx.createRadialGradient(x, y, 0, x, y, r)
        // Cap at 0.8 so a single point never fully saturates the colour ramp.
        const alpha = Math.min(pt.weight, 0.8)
        grad.addColorStop(0, `rgba(0,0,0,${alpha})`)
        grad.addColorStop(1, 'rgba(0,0,0,0)')

        ictx.beginPath()
        ictx.arc(x, y, r, 0, Math.PI * 2)
        ictx.fillStyle = grad
        ictx.fill()
      }

      // ── Step 2: apply colour ramp ──────────────────────────────────────────
      const imageData = ictx.getImageData(0, 0, width, height)
      const data = imageData.data

      for (let i = 3; i < data.length; i += 4) {
        const alpha = data[i] as number
        if (alpha > 0) {
          const base = alpha * 4
          data[i - 3] = colorRamp[base] as number
          data[i - 2] = colorRamp[base + 1] as number
          data[i - 1] = colorRamp[base + 2] as number
          data[i] = colorRamp[base + 3] as number
        }
      }

      // ── Step 3: paint to visible canvas ───────────────────────────────────
      const ctx = this._canvas.getContext('2d')!
      ctx.clearRect(0, 0, width, height)
      ctx.globalAlpha = opacity
      ctx.putImageData(imageData, 0, 0)
    }

    onRemove(): void {
      this._canvas.parentNode?.removeChild(this._canvas)
    }

    setData(points: RawHeatmapPoint[]): void {
      this._points = points
      this.draw()
    }

    clearData(): void {
      this._points = []
      const ctx = this._canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)
    }
  }

  return new HeatmapOverlay()
}

// Convenience type so callers can type their ref without importing the class.
export type HeatmapOverlayInstance = ReturnType<typeof createHeatmapOverlay>
