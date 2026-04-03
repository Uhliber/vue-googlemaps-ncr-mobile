/**
 * Canvas-based heatmap overlay for Google Maps.
 * Replaces the deprecated google.maps.visualization.HeatmapLayer (deprecated May 2025).
 *
 * SMOOTHNESS
 * ----------
 * The "jumpy" behaviour in a naive OverlayView happens because:
 *   1. During zoom/pan, Maps CSS-transforms the entire overlay pane for smooth
 *      animation.
 *   2. draw() is only called once — at the end of the animation (on "idle").
 *   3. So the canvas rides along with the CSS transform, then snaps into its
 *      new position when draw() finally fires.
 *
 * Fix: register a `bounds_changed` listener on the map. That event fires on
 * every animation frame during pan and zoom, not just at idle. We call draw()
 * inside requestAnimationFrame so it runs at display refresh rate and the
 * canvas stays perfectly aligned with the tiles throughout every animation.
 *
 * PERFORMANCE
 * -----------
 * Two persistent offscreen canvases (_intensityCanvas, _colorCanvas) are
 * allocated once and reused on every frame. Only their dimensions are updated
 * when the viewport size changes. This eliminates the per-frame
 * document.createElement('canvas') cost that caused frame drops.
 *
 * A _pendingFrame flag ensures at most one rAF is queued at a time, so rapid
 * bounds_changed events don't stack up.
 *
 * OPACITY / LABEL VISIBILITY
 * --------------------------
 * putImageData() ignores globalAlpha — it always writes raw RGBA bytes.
 * We write colourised pixels to _colorCanvas with putImageData, then use
 * drawImage() on the visible canvas so globalAlpha is respected and map
 * labels remain legible beneath the heatmap.
 *
 * DEFERRED CLASS CONSTRUCTION
 * ---------------------------
 * The class must NOT extend google.maps.OverlayView at module scope because
 * that reference is evaluated at import time, before the Maps script has loaded.
 * The factory createHeatmapOverlay() defines the class at call-time.
 */

export interface RawHeatmapPoint {
  lat: number
  lng: number
  weight: number // 0–1
}

export interface CanvasHeatmapOptions {
  /** Geographic coverage radius in metres. Default: 1200 m. */
  radiusMeters?: number
  /** Overall heatmap opacity 0–1. Default: 0.6. */
  opacity?: number
  gradient?: string[]
}

const EARTH_CIRCUMFERENCE_M = 40_075_016.686

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
  const c = document.createElement('canvas')
  c.width = 1
  c.height = 256
  const ctx = c.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  gradient.forEach((color, i) => grad.addColorStop(i / (gradient.length - 1), color))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1, 256)
  return ctx.getImageData(0, 0, 1, 256).data
}

function metersToPixels(meters: number, zoom: number, latDeg: number): number {
  const metersPerPixel =
    (EARTH_CIRCUMFERENCE_M * Math.cos((latDeg * Math.PI) / 180)) / Math.pow(2, zoom + 8)
  return Math.max(4, meters / metersPerPixel)
}

export function createHeatmapOverlay(options: CanvasHeatmapOptions = {}) {
  const radiusMeters = options.radiusMeters ?? 1200
  const opacity = options.opacity ?? 0.6
  const colorRamp = buildColorRamp(options.gradient ?? DEFAULT_GRADIENT)

  class HeatmapOverlay extends google.maps.OverlayView {
    private _points: RawHeatmapPoint[] = []
    private _canvas: HTMLCanvasElement
    private _boundsListener: google.maps.MapsEventListener | null = null
    private _pendingFrame = false

    // Persistent offscreen canvases — allocated once, resized only when the
    // viewport dimensions change.
    private _intensityCanvas: HTMLCanvasElement
    private _colorCanvas: HTMLCanvasElement

    constructor() {
      super()
      this._canvas = document.createElement('canvas')
      this._canvas.style.position = 'absolute'
      this._canvas.style.pointerEvents = 'none'
      this._intensityCanvas = document.createElement('canvas')
      this._colorCanvas = document.createElement('canvas')
    }

    onAdd(): void {
      this.getPanes()?.overlayLayer.appendChild(this._canvas)

      // bounds_changed fires continuously during every pan/zoom animation frame.
      // Scheduling a draw on each event keeps the canvas aligned at all times.
      this._boundsListener = this.getMap()!.addListener('bounds_changed', () => {
        this._scheduleFrame()
      })
    }

    onRemove(): void {
      this._boundsListener?.remove()
      this._boundsListener = null
      this._canvas.parentNode?.removeChild(this._canvas)
    }

    /** Queue a draw on the next display frame, ignoring duplicate requests. */
    private _scheduleFrame(): void {
      if (this._pendingFrame) return
      this._pendingFrame = true
      requestAnimationFrame(() => {
        this._pendingFrame = false
        this.draw()
      })
    }

    draw(): void {
      const projection = this.getProjection()
      const map = this.getMap() as google.maps.Map | null
      if (!projection || !map) return

      const bounds = map.getBounds()
      const zoom = map.getZoom()
      if (!bounds || zoom === undefined) return

      const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest())
      const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast())
      if (!sw || !ne) return

      const left = Math.floor(sw.x)
      const top = Math.floor(ne.y)
      const width = Math.ceil(ne.x - sw.x)
      const height = Math.ceil(sw.y - ne.y)
      if (width <= 0 || height <= 0) return

      // Reposition the visible canvas to cover the current viewport exactly.
      this._canvas.style.left = `${left}px`
      this._canvas.style.top = `${top}px`
      this._canvas.width = width
      this._canvas.height = height

      // Resize offscreen canvases only when the viewport size changes.
      if (this._intensityCanvas.width !== width || this._intensityCanvas.height !== height) {
        this._intensityCanvas.width = width
        this._intensityCanvas.height = height
        this._colorCanvas.width = width
        this._colorCanvas.height = height
      }

      const centerLat = map.getCenter()?.lat() ?? 14.5995
      const r = metersToPixels(radiusMeters, zoom, centerLat)

      // ── Step 1: paint intensity map ────────────────────────────────────────
      const ictx = this._intensityCanvas.getContext('2d')!
      ictx.clearRect(0, 0, width, height)

      for (const pt of this._points) {
        const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(pt.lat, pt.lng))
        if (!pixel) continue

        const x = pixel.x - left
        const y = pixel.y - top
        if (x < -r || x > width + r || y < -r || y > height + r) continue

        const grad = ictx.createRadialGradient(x, y, 0, x, y, r)
        const alpha = Math.min(pt.weight, 0.8)
        grad.addColorStop(0, `rgba(0,0,0,${alpha})`)
        grad.addColorStop(1, 'rgba(0,0,0,0)')

        ictx.beginPath()
        ictx.arc(x, y, r, 0, Math.PI * 2)
        ictx.fillStyle = grad
        ictx.fill()
      }

      // ── Step 2: apply colour ramp via lookup table ─────────────────────────
      const imageData = ictx.getImageData(0, 0, width, height)
      const data = imageData.data

      for (let i = 3; i < data.length; i += 4) {
        const a = data[i] as number
        if (a > 0) {
          const base = a * 4
          data[i - 3] = colorRamp[base] as number
          data[i - 2] = colorRamp[base + 1] as number
          data[i - 1] = colorRamp[base + 2] as number
          data[i] = colorRamp[base + 3] as number
        }
      }

      // ── Step 3: composite onto visible canvas with opacity ─────────────────
      // putImageData ignores globalAlpha so we write to _colorCanvas first,
      // then use drawImage (which does respect globalAlpha) on the visible canvas.
      this._colorCanvas.getContext('2d')!.putImageData(imageData, 0, 0)

      const ctx = this._canvas.getContext('2d')!
      ctx.clearRect(0, 0, width, height)
      ctx.globalAlpha = opacity
      ctx.drawImage(this._colorCanvas, 0, 0)
    }

    setData(points: RawHeatmapPoint[]): void {
      this._points = points
      this._scheduleFrame()
    }

    clearData(): void {
      this._points = []
      this._canvas.getContext('2d')?.clearRect(0, 0, this._canvas.width, this._canvas.height)
    }
  }

  return new HeatmapOverlay()
}

export type HeatmapOverlayInstance = ReturnType<typeof createHeatmapOverlay>
