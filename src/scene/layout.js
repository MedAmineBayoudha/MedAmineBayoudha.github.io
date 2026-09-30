// Procedural layout of the circuit board "city". Everything is seeded, so the
// board looks the same on every visit. Units are roughly centimetres of a
// giant PCB: x is left/right, z runs from the hero (+z) to the Ethernet port (-z).

export const LOW_POWER =
  typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 760px)').matches || (navigator.hardwareConcurrency || 8) <= 4)

export const BOARD = { minX: -56, maxX: 56, minZ: -216, maxZ: 44 }

// One camera stop per page section, in page order.
// side: +1 frames the landmark on the right of the screen, clear of the text panel on the left.
// lift: pushes the landmark up the screen (used when the panel sits at the bottom).
export const STOPS = [
  { id: 'hero', pos: [0, 27, 38], look: [0, 0, 15], side: 0, lift: 0 },
  { id: 'about', pos: [-4, 6.5, -5], look: [7, 1.2, -18], side: 1, lift: 0 },
  { id: 'spinncloud', pos: [4, 9.5, -33], look: [-9, 0.4, -46], side: 1, lift: 0 },
  { id: 'offenburg', pos: [-3, 5.5, -61], look: [8, 0.6, -72], side: 1, lift: 0 },
  { id: 'cassiopeia', pos: [3, 5.2, -86], look: [-8, 1.2, -98], side: 1, lift: 0 },
  { id: 'skills', pos: [0, 2.6, -108], look: [0, 0.2, -130], side: 0.8, lift: 0 },
  { id: 'projects', pos: [-4, 8.5, -148], look: [9, 0.8, -163], side: 1, lift: 0 },
  { id: 'education', pos: [3, 5.2, -173], look: [-8, 0.8, -185], side: 1, lift: 0 },
  { id: 'contact', pos: [-3, 3, -196], look: [0, 1.8, -211], side: 0.7, lift: 0.2 },
]

export const LANDMARKS = {
  about: [7, -18],
  spinncloud: [-9, -46],
  offenburg: [8, -72],
  cassiopeia: [-8, -98],
  projects: [9, -163],
  education: [-8, -185],
  contact: [0, -212],
}

const EXCLUDE = [
  { x: 7, z: -18, r: 7.5 },
  { x: -9, z: -46, r: 11 },
  { x: 8, z: -72, r: 7 },
  { x: -8, z: -98, r: 7.5 },
  { x: 9, z: -163, r: 8 },
  { x: -8, z: -185, r: 7.5 },
]

export function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function inLandmark(x, z, pad = 0) {
  for (const e of EXCLUDE) if (Math.hypot(x - e.x, z - e.z) < e.r + pad) return true
  return false
}

// Areas where no components may stand: landmarks, the backbone bus,
// the skills bus, the connector plaza and the silkscreen name.
function blocked(x, z, pad = 0) {
  if (inLandmark(x, z, pad)) return true
  if (Math.abs(x) < 2.4 + pad) return true
  if (z < -103 && z > -157 && Math.abs(x) < 4.2 + pad) return true
  if (z < -193 && Math.abs(x) < 10 + pad) return true
  if (z > 0 && z < 17 && Math.abs(x) < 25 + pad) return true
  if (x < BOARD.minX + 2 || x > BOARD.maxX - 2 || z < BOARD.minZ + 2 || z > BOARD.maxZ - 2) return true
  return false
}

// Offset a polyline sideways with mitred corners, for parallel bus lanes.
export function offsetPolyline(pts, d) {
  const out = []
  for (let i = 0; i < pts.length; i++) {
    const prev = pts[Math.max(0, i - 1)]
    const next = pts[Math.min(pts.length - 1, i + 1)]
    const a = i > 0 ? norm(pts[i][0] - prev[0], pts[i][1] - prev[1]) : null
    const b = i < pts.length - 1 ? norm(next[0] - pts[i][0], next[1] - pts[i][1]) : null
    const na = a && [-a[1], a[0]]
    const nb = b && [-b[1], b[0]]
    let n = na && nb ? norm(na[0] + nb[0], na[1] + nb[1]) : na || nb
    const ref = nb || na
    const m = 1 / Math.max(0.3, n[0] * ref[0] + n[1] * ref[1])
    out.push([pts[i][0] + n[0] * d * m, pts[i][1] + n[1] * d * m])
  }
  return out
}

function norm(x, z) {
  const l = Math.hypot(x, z) || 1
  return [x / l, z / l]
}

function bus(center, lanes, spacing) {
  const res = []
  for (let i = 0; i < lanes; i++) res.push(offsetPolyline(center, (i - (lanes - 1) / 2) * spacing))
  return res
}

const DIRS = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
].map(([x, z]) => norm(x, z))

const snap = (v, s = 0.5) => Math.round(v / s) * s

function randomRoute(r) {
  let x = snap(BOARD.minX + 3 + r() * (BOARD.maxX - BOARD.minX - 6))
  let z = snap(BOARD.minZ + 3 + r() * (BOARD.maxZ - BOARD.minZ - 6))
  let dir = Math.floor(r() * 4) * 2
  const pts = [[x, z]]
  const segs = 2 + Math.floor(r() * 3)
  for (let s = 0; s < segs; s++) {
    const diag = dir % 2 === 1
    const len = diag ? 0.7 + r() * 2 : 2 + r() * 9
    x += DIRS[dir][0] * len
    z += DIRS[dir][1] * len
    pts.push([x, z])
    dir = (dir + (r() < 0.5 ? 1 : -1) + 8) % 8
  }
  return pts
}

function routeOk(pts) {
  return pts.every(([x, z]) => !inLandmark(x, z, 0.5) && !(z > 0 && z < 17 && Math.abs(x) < 25) &&
    x > BOARD.minX + 1 && x < BOARD.maxX - 1 && z > BOARD.minZ + 1 && z < BOARD.maxZ - 1)
}

export function generateBoard() {
  const r = rng(20240301)
  const lowScale = LOW_POWER ? 0.55 : 1

  // --- Gold traces: the backbone that carries data toward the Ethernet port.
  const gold = []
  const backbone = bus([[0, 42], [0, -209.5]], 8, 0.26)
  gold.push(...backbone)
  // Skills section widens the bus to 16 lanes.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const x = s * (1.3 + i * 0.26)
      gold.push([[x + s * 2.3, -101.5], [x, -103.8], [x, -154.2], [x + s * 2.3, -156.5]])
    }
  }
  // Branches from the backbone to each landmark.
  // [chip edge x, lane z] for each landmark chip that the backbone feeds.
  const branches = [[3.9, -17], [5.7, -71], [-5.4, -97.5], [5.2, -165], [-4.1, -183.8]]
  for (const [ex, zt] of branches) {
    const s = Math.sign(ex)
    const center = [[s * 1.4, zt + 4], [s * 3.1, zt + 2.3], [s * 3.1, zt], [ex, zt]]
    gold.push(...bus(center, 4, 0.26))
  }

  // --- Green traces under the solder mask.
  const mask = []
  const routeCount = Math.round(900 * lowScale)
  for (let i = 0; i < routeCount; i++) {
    const p = randomRoute(r)
    if (routeOk(p)) mask.push(p)
  }
  for (let i = 0; i < 26 * lowScale; i++) {
    const c = randomRoute(r)
    if (routeOk(c)) mask.push(...bus(c, 3 + Math.floor(r() * 6), 0.24))
  }

  // --- Components placed with a coarse occupancy grid.
  const occ = new Set()
  const cells = (x, z, w, d) => {
    const out = []
    for (let i = Math.floor(x - w / 2 - 0.4); i <= Math.ceil(x + w / 2 + 0.4); i++)
      for (let j = Math.floor(z - d / 2 - 0.4); j <= Math.ceil(z + d / 2 + 0.4); j++) out.push(i + ',' + j)
    return out
  }
  const tryPlace = (x, z, w, d) => {
    if (blocked(x - w / 2, z - d / 2) || blocked(x + w / 2, z + d / 2) || blocked(x, z) ||
      blocked(x - w / 2, z + d / 2) || blocked(x + w / 2, z - d / 2)) return false
    const c = cells(x, z, w, d)
    if (c.some((k) => occ.has(k))) return false
    c.forEach((k) => occ.add(k))
    return true
  }
  const rx = () => BOARD.minX + r() * (BOARD.maxX - BOARD.minX)
  const rz = () => BOARD.minZ + r() * (BOARD.maxZ - BOARD.minZ)

  const caps = []
  for (let i = 0; i < 260 * lowScale; i++) {
    const rad = 0.3 + r() * 0.45
    const x = rx(), z = rz()
    if (Math.abs(x) < 5) continue
    if (tryPlace(x, z, rad * 2, rad * 2)) caps.push({ x, z, r: rad, h: 0.6 + r() * 1.4 })
  }

  const ics = []
  let u = 5
  for (let i = 0; i < 2600 * lowScale; i++) {
    const quad = r() < 0.35
    const w = quad ? 1.2 + r() * 2.2 : 0.8 + r() * 2.8
    const d = quad ? w : 0.6 + r() * 1.1
    const flip = r() < 0.5
    const W = flip ? d : w, D = flip ? w : d
    const x = snap(rx(), 0.25), z = snap(rz(), 0.25)
    if (tryPlace(x, z, W + 0.6, D + 0.6)) {
      ics.push({ x, z, w: W, d: D, h: 0.18 + r() * 0.3, quad, alongX: !flip, ref: 'U' + u++ })
    }
  }

  const passives = []
  for (let i = 0; i < 9000 * lowScale; i++) {
    const x = snap(rx(), 0.25), z = snap(rz(), 0.25)
    const alongX = r() < 0.5
    const big = r() < 0.2
    const w = big ? 0.7 : 0.45, d = big ? 0.38 : 0.24
    if (tryPlace(x, z, alongX ? w : d, alongX ? d : w)) passives.push({ x, z, w, d, alongX, cap: r() < 0.55 })
  }

  // Blinking status LEDs on a share of the chips give the city its night lights.
  const LED_COLORS = [[0.4, 3, 0.6], [3, 1.6, 0.2], [0.4, 2.2, 3.2], [3, 0.35, 0.3]]
  const leds = []
  for (const ic of ics) {
    if (r() < 0.22) leds.push({ x: ic.x + ic.w / 2 - 0.18, y: ic.h + 0.03, z: ic.z + ic.d / 2 - 0.18, c: LED_COLORS[Math.floor(r() * 4)], rate: 0.5 + r() * 3, phase: r() * 10 })
  }

  // Silkscreen reference designators close to the flight path.
  const refs = ics.filter((ic) => Math.abs(ic.x) < 16 && ic.w > 1.4).slice(0, LOW_POWER ? 25 : 60)

  return { gold, mask, caps, ics, passives, leds, refs }
}

// Polylines that carry glowing data packets, with cumulative lengths precomputed.
export function packetRoutes(board) {
  const lanes = [...board.gold, ...board.mask.filter((_, i) => i % 3 === 0)]
  return lanes.map((pts) => {
    const cum = [0]
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
    return { pts, cum, len: cum[cum.length - 1] }
  }).filter((r) => r.len > 3)
}
