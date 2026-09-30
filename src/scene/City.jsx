import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { BOARD, LOW_POWER, packetRoutes } from './layout'
import { Instances, traceInstances } from './Instanced'
import { FONT, LASER, SILK, materials } from './materials'

export function Board({ board }) {
  const M = materials()
  const w = BOARD.maxX - BOARD.minX
  const d = BOARD.maxZ - BOARD.minZ
  const cx = (BOARD.maxX + BOARD.minX) / 2
  const cz = (BOARD.maxZ + BOARD.minZ) / 2

  useMemo(() => {
    M.board.map.repeat.set(w / 6, d / 6)
  }, [M, w, d])

  const gold = useMemo(() => traceInstances(board.gold, 0.13, 0.012), [board])
  const mask = useMemo(() => traceInstances(board.mask, 0.1, 0.008), [board])
  const vias = useMemo(() => {
    const ring = []
    const hole = []
    board.mask.forEach((pts, i) => {
      if (i % 2) return
      for (const [x, z] of [pts[0], pts[pts.length - 1]]) {
        ring.push([x, 0.012, z, 0.3, 0.02, 0.3, 0])
        hole.push([x, 0.024, z, 0.14, 0.01, 0.14, 0])
      }
    })
    return { ring, hole }
  }, [board])

  const holes = [[BOARD.minX + 3, BOARD.maxZ - 3], [BOARD.maxX - 3, BOARD.maxZ - 3], [BOARD.minX + 3, BOARD.minZ + 3], [BOARD.maxX - 3, BOARD.minZ + 3]]

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0, cz]} material={M.board}>
        <planeGeometry args={[w, d]} />
      </mesh>
      <mesh position={[cx, -0.2, cz]} material={M.boardEdge}>
        <boxGeometry args={[w, 0.39, d]} />
      </mesh>
      <Instances items={mask.segs} material={M.maskTrace} />
      <Instances items={mask.joints} material={M.maskTrace} shape="cylLow" />
      <Instances items={gold.segs} material={M.gold} />
      <Instances items={gold.joints} material={M.gold} shape="cylLow" />
      <Instances items={vias.ring} material={M.gold} shape="cylLow" />
      <Instances items={vias.hole} material={M.viaHole} shape="cylLow" />
      {holes.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position-y={0.01} material={M.gold}>
            <cylinderGeometry args={[1.3, 1.3, 0.02, 40]} />
          </mesh>
          <mesh position-y={0.02} material={M.viaHole}>
            <cylinderGeometry args={[0.8, 0.8, 0.02, 40]} />
          </mesh>
        </group>
      ))}
      <HeroSilkscreen />
    </group>
  )
}

function Silk({ children, size = 0.4, color = SILK, ...props }) {
  return (
    <Text font={FONT} fontSize={size} color={color} rotation-x={-Math.PI / 2} anchorX="center" anchorY="middle" {...props}>
      {children}
    </Text>
  )
}

export { Silk }

function Frame({ x, z, w, d, t = 0.12, y = 0.03, material }) {
  const items = [
    [x, y, z - d / 2, w, 0.01, t, 0],
    [x, y, z + d / 2, w, 0.01, t, 0],
    [x - w / 2, y, z, t, 0.01, d, 0],
    [x + w / 2, y, z, t, 0.01, d, 0],
  ]
  return <Instances items={items} material={material} />
}

const silkMat = new THREE.MeshBasicMaterial({ color: SILK })

function HeroSilkscreen() {
  return (
    <group>
      <Silk position={[0, 0.03, 6.4]} size={2.7} letterSpacing={0.04}>MOHAMED AMINE</Silk>
      <Silk position={[0, 0.03, 9.6]} size={2.7} letterSpacing={0.04}>BAYOUDHA</Silk>
      <Silk position={[0, 0.03, 12.9]} size={0.7} letterSpacing={0.2} color="#e0b45a">EMBEDDED ML · FIRMWARE · CONTROL</Silk>
      <Silk position={[-19.5, 0.03, 2.4]} size={0.45} anchorX="left">REV 2026</Silk>
      <Silk position={[19.5, 0.03, 2.4]} size={0.45} anchorX="right">DRESDEN · DE</Silk>
      <Frame x={0} z={8.4} w={42} d={13} material={silkMat} />
    </group>
  )
}

export function Components({ board }) {
  const M = materials()

  const data = useMemo(() => {
    const bodies = []
    const pins = []
    for (const ic of board.ics) {
      bodies.push([ic.x, ic.h / 2, ic.z, ic.w, ic.h, ic.d, 0])
      const pitch = 0.36
      const sides = ic.quad ? ['x', 'z'] : [ic.alongX ? 'x' : 'z']
      for (const axis of sides) {
        const span = axis === 'x' ? ic.w : ic.d
        const n = Math.max(2, Math.floor((span - 0.3) / pitch))
        for (let k = 0; k < n; k++) {
          const t = (k - (n - 1) / 2) * pitch
          for (const s of [-1, 1]) {
            if (axis === 'x') pins.push([ic.x + t, 0.05, ic.z + s * (ic.d / 2 + 0.12), 0.13, 0.08, 0.3, 0])
            else pins.push([ic.x + s * (ic.w / 2 + 0.12), 0.05, ic.z + t, 0.3, 0.08, 0.13, 0])
          }
        }
      }
    }
    const ceramic = []
    const resistors = []
    const terminals = []
    for (const p of board.passives) {
      const h = 0.16
      const body = [p.x, h / 2, p.z, p.alongX ? p.w * 0.62 : p.d, h, p.alongX ? p.d : p.w * 0.62, 0]
      ;(p.cap ? ceramic : resistors).push(body)
      for (const s of [-1, 1]) {
        const off = s * p.w * 0.4
        terminals.push(p.alongX ? [p.x + off, h / 2, p.z, p.w * 0.2, h + 0.01, p.d, 0] : [p.x, h / 2, p.z + off, p.d, h + 0.01, p.w * 0.2, 0])
      }
    }
    const sleeves = []
    const tops = []
    const stripes = []
    for (const c of board.caps) {
      sleeves.push([c.x, c.h / 2, c.z, c.r * 2, c.h, c.r * 2, 0])
      tops.push([c.x, c.h + 0.01, c.z, c.r * 1.9, 0.03, c.r * 1.9, 0])
      stripes.push([c.x + c.r * 0.72, c.h / 2, c.z + c.r * 0.72, c.r * 0.5, c.h * 0.98, c.r * 0.5, 0])
    }
    return { bodies, pins, ceramic, resistors, terminals, sleeves, tops, stripes }
  }, [board])

  return (
    <group>
      <Instances items={data.bodies} material={M.chip} />
      <Instances items={data.pins} material={M.pin} />
      <Instances items={data.ceramic} material={M.ceramic} />
      <Instances items={data.resistors} material={M.resistor} />
      <Instances items={data.terminals} material={M.pin} />
      <Instances items={data.sleeves} material={M.capSleeve} shape="cyl" />
      <Instances items={data.stripes} material={M.capStripe} shape="cylLow" />
      <Instances items={data.tops} material={M.metal} shape="cyl" />
      {board.refs.map((ic) => (
        <Text key={ic.ref} font={FONT} fontSize={Math.min(0.32, ic.d * 0.35)} color={LASER} rotation-x={-Math.PI / 2}
          position={[ic.x, ic.h + 0.003, ic.z]} anchorX="center" anchorY="middle">
          {ic.ref}
        </Text>
      ))}
      <Leds leds={board.leds} />
    </group>
  )
}

const tmpColor = new THREE.Color()

function Leds({ leds }) {
  const ref = useRef()
  const items = useMemo(() => leds.map((l) => [l.x, l.y, l.z, 0.16, 0.06, 0.12, 0]), [leds])
  const last = useRef(0)
  useFrame(({ clock }) => {
    const mesh = ref.current?.children?.[0]
    const t = clock.elapsedTime
    if (!mesh || t - last.current < 0.08) return
    last.current = t
    leds.forEach((l, i) => {
      const on = Math.sin(t * l.rate + l.phase) > -0.3 ? 1 : 0.08
      tmpColor.setRGB(l.c[0] * on, l.c[1] * on, l.c[2] * on)
      mesh.setColorAt(i, tmpColor)
    })
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })
  return (
    <group ref={ref}>
      <Instances items={items} material={materials().glowBasic} />
    </group>
  )
}

const dummy = new THREE.Object3D()

export function Packets({ board }) {
  const ref = useRef()
  const routes = useMemo(() => packetRoutes(board), [board])
  const goldCount = board.gold.length
  const packets = useMemo(() => {
    const out = []
    const n = LOW_POWER ? 170 : 460
    for (let i = 0; i < n; i++) {
      // Two thirds ride the gold backbone and landmark buses.
      const onGold = i % 3 !== 0
      const ri = onGold ? i % goldCount : goldCount + Math.floor((i * 7919) % (routes.length - goldCount))
      const warm = i % 7 === 0
      out.push({
        r: routes[ri],
        u: (i * 0.618) % 1,
        speed: (onGold ? 7 : 3.5) + ((i * 37) % 10) * 0.45,
        color: warm ? [3.2, 2.1, 0.7] : [0.55, 2.8, 3.3],
      })
    }
    return out
  }, [routes, goldCount])

  const reduce = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  useFrame((_, dt) => {
    const mesh = ref.current
    if (!mesh) return
    const step = Math.min(dt, 0.05) * (reduce ? 0.25 : 1)
    packets.forEach((p, i) => {
      p.u = (p.u + (p.speed * step) / p.r.len) % 1
      const dist = p.u * p.r.len
      const { pts, cum } = p.r
      let k = 1
      while (k < cum.length - 1 && cum[k] < dist) k++
      const f = (dist - cum[k - 1]) / (cum[k] - cum[k - 1] || 1)
      const [x0, z0] = pts[k - 1]
      const [x1, z1] = pts[k]
      dummy.position.set(x0 + (x1 - x0) * f, 0.06, z0 + (z1 - z0) * f)
      dummy.rotation.set(0, Math.atan2(-(z1 - z0), x1 - x0), 0)
      dummy.scale.set(0.5, 0.06, 0.1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  const init = (mesh) => {
    ref.current = mesh
    if (!mesh) return
    packets.forEach((p, i) => mesh.setColorAt(i, tmpColor.setRGB(...p.color)))
    mesh.instanceColor.needsUpdate = true
  }

  return (
    <instancedMesh ref={init} args={[undefined, undefined, packets.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}
