import type { Signal, Network } from '@/types/signal'

// Metro Manila (NCR) approximate bounding box:
// Lat: 14.40 to 14.76
// Lng: 120.93 to 121.12

function generatePoints(
  network: Network,
  count: number,
  startId: number,
  centers: Array<{ lat: number; lng: number; spread: number; strength: number }>,
): Signal[] {
  const points: Signal[] = []
  let id = startId

  for (const center of centers) {
    const perCenter = Math.floor(count / centers.length)
    for (let i = 0; i < perCenter; i++) {
      const lat = center.lat + (Math.random() - 0.5) * center.spread
      const lng = center.lng + (Math.random() - 0.5) * center.spread
      const strengthVariance = (Math.random() - 0.5) * 0.2
      const strength = Math.min(1, Math.max(0.05, center.strength + strengthVariance))
      points.push({ id: id++, lat, lng, network, strength: parseFloat(strength.toFixed(2)) })
    }
  }

  return points
}

// NCR key area centers
const manilaCenter = { lat: 14.5995, lng: 120.9842 }
const bgcCenter = { lat: 14.5547, lng: 121.0509 }
const makatiCenter = { lat: 14.5547, lng: 121.0244 }
const quezoncityCenter = { lat: 14.676, lng: 121.0437 }
const caloocanCenter = { lat: 14.7504, lng: 120.9676 }
const pasigCenter = { lat: 14.5764, lng: 121.0851 }
const paranaque = { lat: 14.479, lng: 120.9998 }
const laspinaCenter = { lat: 14.449, lng: 120.9936 }
const valoenzuela = { lat: 14.7011, lng: 120.9827 }
const marikina = { lat: 14.6507, lng: 121.1029 }
const malabon = { lat: 14.6686, lng: 120.9568 }

const globeCenters = [
  { ...bgcCenter, spread: 0.04, strength: 0.95 },
  { ...makatiCenter, spread: 0.03, strength: 0.9 },
  { ...manilaCenter, spread: 0.04, strength: 0.85 },
  { ...quezoncityCenter, spread: 0.06, strength: 0.8 },
  { ...pasigCenter, spread: 0.04, strength: 0.88 },
  { ...paranaque, spread: 0.03, strength: 0.75 },
  { ...marikina, spread: 0.03, strength: 0.82 },
  { ...caloocanCenter, spread: 0.04, strength: 0.72 },
]

const smartCenters = [
  { ...manilaCenter, spread: 0.05, strength: 0.92 },
  { ...quezoncityCenter, spread: 0.07, strength: 0.88 },
  { ...caloocanCenter, spread: 0.05, strength: 0.8 },
  { ...valoenzuela, spread: 0.04, strength: 0.76 },
  { ...makatiCenter, spread: 0.03, strength: 0.85 },
  { ...laspinaCenter, spread: 0.03, strength: 0.78 },
  { ...malabon, spread: 0.03, strength: 0.74 },
  { ...pasigCenter, spread: 0.04, strength: 0.8 },
]

const ditoCenters = [
  { ...bgcCenter, spread: 0.05, strength: 0.7 },
  { ...manilaCenter, spread: 0.04, strength: 0.65 },
  { ...quezoncityCenter, spread: 0.06, strength: 0.72 },
  { ...makatiCenter, spread: 0.04, strength: 0.68 },
  { ...pasigCenter, spread: 0.04, strength: 0.6 },
  { ...paranaque, spread: 0.04, strength: 0.58 },
  { ...valoenzuela, spread: 0.04, strength: 0.55 },
]

const gomoCenters = [
  { ...bgcCenter, spread: 0.06, strength: 0.75 },
  { ...makatiCenter, spread: 0.04, strength: 0.78 },
  { ...quezoncityCenter, spread: 0.06, strength: 0.7 },
  { ...manilaCenter, spread: 0.04, strength: 0.65 },
  { ...marikina, spread: 0.04, strength: 0.6 },
  { lat: 14.52, lng: 121.03, spread: 0.04, strength: 0.62 },
]

const tmCenters = [
  { ...manilaCenter, spread: 0.05, strength: 0.78 },
  { ...caloocanCenter, spread: 0.05, strength: 0.72 },
  { ...malabon, spread: 0.04, strength: 0.68 },
  { ...valoenzuela, spread: 0.05, strength: 0.7 },
  { ...quezoncityCenter, spread: 0.06, strength: 0.65 },
  { ...laspinaCenter, spread: 0.04, strength: 0.6 },
]

const tntCenters = [
  { ...quezoncityCenter, spread: 0.07, strength: 0.8 },
  { ...manilaCenter, spread: 0.05, strength: 0.75 },
  { ...caloocanCenter, spread: 0.05, strength: 0.7 },
  { ...pasigCenter, spread: 0.04, strength: 0.68 },
  { ...marikina, spread: 0.04, strength: 0.65 },
  { ...makatiCenter, spread: 0.03, strength: 0.72 },
]

export const mockSignals: Signal[] = [
  ...generatePoints('globe', 80, 1, globeCenters),
  ...generatePoints('smart', 80, 1001, smartCenters),
  ...generatePoints('dito', 70, 2001, ditoCenters),
  ...generatePoints('gomo', 60, 3001, gomoCenters),
  ...generatePoints('tm', 60, 4001, tmCenters),
  ...generatePoints('tnt', 60, 5001, tntCenters),
]
