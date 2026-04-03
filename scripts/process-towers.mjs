/**
 * One-time data processing script.
 *
 * Reads public/515.csv.gz (OpenCelliD full Philippines database, MCC 515),
 * filters to NCR bounding box + the three MNCs we care about, assigns signal
 * strength from the tower's radio technology, and writes a compact JSON file
 * to public/ncr-towers.json.
 *
 * Run:
 *   node scripts/process-towers.mjs
 *
 * The bulk CSV has no averageSignal data (every row is 0), so we proxy signal
 * strength from the radio generation — a direct measure of coverage quality:
 *
 *   NR  (5G)  → 0.90
 *   LTE (4G)  → 0.75
 *   UMTS(3G)  → 0.55
 *   GSM (2G)  → 0.40
 *
 * CSV column layout (no header row in the bulk download):
 *   0:radio  1:mcc  2:net  3:area  4:cell  5:unit
 *   6:lon    7:lat  8:range  9:samples  10:changeable
 *   11:created  12:updated  13:averageSignal
 */

import { createReadStream, createWriteStream } from 'node:fs'
import { createGunzip } from 'node:zlib'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const INPUT  = resolve(__dirname, '../public/515.csv.gz')
const OUTPUT = resolve(__dirname, '../public/ncr-towers.json')

// NCR bounding box
const LAT_MIN = 14.39, LAT_MAX = 14.79
const LNG_MIN = 120.91, LNG_MAX = 121.13

// MNC → network label
const MNC_NETWORK = { 2: 'globe', 3: 'smart', 5: 'smart', 66: 'dito' }

// Radio type → 0–1 strength proxy
const RADIO_STRENGTH = { NR: 0.90, LTE: 0.75, UMTS: 0.55, GSM: 0.40 }

const result = { globe: [], smart: [], dito: [] }
let totalRows = 0, keptRows = 0

let buffer = ''
const gunzip = createGunzip()
createReadStream(INPUT).pipe(gunzip)

gunzip.on('data', (chunk) => {
  buffer += chunk.toString('utf8')
  const lines = buffer.split('\n')
  buffer = lines.pop() // hold incomplete trailing line

  for (const line of lines) {
    if (!line.trim()) continue
    const c = line.split(',')
    if (c.length < 14) continue
    totalRows++

    const mnc = parseInt(c[2], 10)
    const network = MNC_NETWORK[mnc]
    if (!network) continue

    const lat = parseFloat(c[7])
    const lng = parseFloat(c[6])
    if (lat < LAT_MIN || lat > LAT_MAX || lng < LNG_MIN || lng > LNG_MAX) continue

    const samples = parseInt(c[9], 10)
    if (samples < 2) continue

    const strength = RADIO_STRENGTH[c[0]] ?? 0
    if (strength === 0) continue

    // Store as compact [lat, lng, strength] tuple
    result[network].push([
      parseFloat(lat.toFixed(5)),
      parseFloat(lng.toFixed(5)),
      strength,
    ])
    keptRows++
  }
})

gunzip.on('end', () => {
  const today = new Date().toISOString().split('T')[0]
  const output = {
    generated: today,
    source: 'OpenCelliD · MCC 515 · Philippines',
    globe: result.globe,
    smart: result.smart,
    dito: result.dito,
  }

  const json = JSON.stringify(output)
  const ws = createWriteStream(OUTPUT)
  ws.write(json)
  ws.end(() => {
    const kb = (json.length / 1024).toFixed(0)
    console.log(`✓ Processed ${totalRows.toLocaleString()} rows → kept ${keptRows.toLocaleString()} NCR towers`)
    console.log(`  Globe: ${result.globe.length.toLocaleString()}`)
    console.log(`  Smart: ${result.smart.length.toLocaleString()}`)
    console.log(`  DITO:  ${result.dito.length.toLocaleString()}`)
    console.log(`  Output: ${OUTPUT} (${kb} KB)`)
  })
})

gunzip.on('error', (err) => {
  console.error('Failed to decompress:', err.message)
  process.exit(1)
})
