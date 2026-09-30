import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { LANDMARKS } from './layout'
import { Instances } from './Instanced'
import { FONT, LASER, materials } from './materials'
import { Silk } from './City'

const CYAN = [0.5, 2.6, 3.2]
const GOLD = [3.2, 2.1, 0.6]
const PINK = [3, 0.6, 2.4]

// Glowing outline around a footprint that breathes slowly; bloom turns it into a halo.
function Rim({ w, d, color = CYAN, speed = 1.2, phase = 0 }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), [])
  useFrame(({ clock }) => {
    const k = 0.55 + 0.45 * Math.sin(clock.elapsedTime * speed + phase)
    mat.color.setRGB(color[0] * k, color[1] * k, color[2] * k)
  })
  const t = 0.06
  const items = [
    [0, 0.02, -d / 2, w + t, 0.02, t, 0],
    [0, 0.02, d / 2, w + t, 0.02, t, 0],
    [-w / 2, 0.02, 0, t, 0.02, d, 0],
    [w / 2, 0.02, 0, t, 0.02, d, 0],
  ]
  return <Instances items={items} material={mat} />
}

export function Chip({ position, size = [2, 2], h = 0.35, pins = 'quad', pitch = 0.38, label, sub, labelSize, rim, spreader = false, phase = 0 }) {
  const M = materials()
  const [w, d] = size
  const pinItems = useMemo(() => {
    const out = []
    const axes = pins === 'quad' ? ['x', 'z'] : pins === 'dual' ? ['x'] : []
    for (const axis of axes) {
      const span = axis === 'x' ? w : d
      const n = Math.max(2, Math.floor((span - 0.4) / pitch))
      for (let k = 0; k < n; k++) {
        const t = (k - (n - 1) / 2) * pitch
        for (const s of [-1, 1]) {
          if (axis === 'x') out.push([t, 0.05, s * (d / 2 + 0.16), 0.14, 0.09, 0.36, 0])
          else out.push([s * (w / 2 + 0.16), 0.05, t, 0.36, 0.09, 0.14, 0])
        }
      }
    }
    return out
  }, [w, d, pins, pitch])
  const top = h + (spreader ? 0.09 : 0) + 0.004
  const fs = labelSize || Math.min(w, d) * 0.13

  return (
    <group position={position}>
      <mesh position-y={h / 2} material={M.chip}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      {spreader && (
        <mesh position-y={h + 0.045} material={M.metal}>
          <boxGeometry args={[w * 0.78, 0.09, d * 0.78]} />
        </mesh>
      )}
      <Instances items={pinItems} material={M.pin} />
      <mesh position={[-w / 2 + 0.3, h + 0.003, -d / 2 + 0.3]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#5a605d" />
      </mesh>
      {label && (
        <Text font={FONT} fontSize={fs} color={spreader ? '#3a3f44' : LASER} rotation-x={-Math.PI / 2}
          position={[0, top, sub ? -fs * 0.55 : 0]} anchorX="center" anchorY="middle" maxWidth={w * 0.9} textAlign="center">
          {label}
        </Text>
      )}
      {sub && (
        <Text font={FONT} fontSize={fs * 0.42} color={spreader ? '#4a5056' : LASER} rotation-x={-Math.PI / 2}
          position={[0, top, fs * 0.55]} anchorX="center" anchorY="middle" maxWidth={w * 0.9} textAlign="center">
          {sub}
        </Text>
      )}
      {rim && <Rim w={w + 1.1} d={d + 1.1} color={rim} phase={phase} />}
    </group>
  )
}

function Led({ position, color, rate = 2, phase = 0, size = [0.3, 0.12, 0.2] }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), [])
  useFrame(({ clock }) => {
    const on = Math.sin(clock.elapsedTime * rate + phase) > 0 ? 1 : 0.1
    mat.color.setRGB(color[0] * on, color[1] * on, color[2] * on)
  })
  return (
    <mesh position={position} material={mat}>
      <boxGeometry args={size} />
    </mesh>
  )
}

function ElectroCap({ position, r = 0.8, h = 2 }) {
  const M = materials()
  return (
    <group position={position}>
      <mesh position-y={h / 2} material={M.capSleeve}>
        <cylinderGeometry args={[r, r, h, 32]} />
      </mesh>
      <mesh position-y={h + 0.015} material={M.metal}>
        <cylinderGeometry args={[r * 0.95, r * 0.95, 0.03, 32]} />
      </mesh>
      <mesh position={[0, h + 0.035, 0]} rotation-y={Math.PI / 4} material={M.chip}>
        <boxGeometry args={[r * 1.5, 0.01, 0.05]} />
      </mesh>
      <mesh position={[0, h + 0.035, 0]} rotation-y={-Math.PI / 4} material={M.chip}>
        <boxGeometry args={[r * 1.5, 0.01, 0.05]} />
      </mesh>
      <mesh position={[r * 0.7, h / 2, r * 0.7]} material={M.capStripe}>
        <cylinderGeometry args={[r * 0.3, r * 0.3, h * 0.98, 12]} />
      </mesh>
    </group>
  )
}

function Inductor({ position, size = 1.6, label = '100µH' }) {
  const M = materials()
  return (
    <group position={position}>
      <mesh position-y={0.45} material={M.inductor}>
        <boxGeometry args={[size, 0.9, size]} />
      </mesh>
      <Text font={FONT} fontSize={size * 0.18} color={LASER} rotation-x={-Math.PI / 2} position={[0, 0.905, 0]}>
        {label}
      </Text>
    </group>
  )
}

function About() {
  const [x, z] = LANDMARKS.about
  const caps = []
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    caps.push([x + Math.cos(a) * 5.2, 0.12, z + Math.sin(a) * 5.2, 0.5, 0.24, 0.28, -a])
  }
  return (
    <group>
      <Chip position={[x, 0, z]} size={[6.2, 6.2]} h={0.6} pitch={0.34} spreader label="SpiNNaker2" sub="152 × ARM CORTEX-M4F · 22nm" labelSize={0.72} rim={CYAN} />
      <Instances items={caps} material={materials().ceramic} />
      <Silk position={[x, 0.03, z + 4.6]} size={0.42}>U1 · NEUROMORPHIC PROCESSOR</Silk>
    </group>
  )
}

function SpinnCloud() {
  const [x, z] = LANDMARKS.spinncloud
  const chips = useMemo(() => {
    const out = []
    for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) out.push([x - 6.65 + i * 1.9, z - 4.75 + j * 1.9])
    return out
  }, [x, z])
  const M = materials()
  const bodies = chips.map(([cx, cz]) => [cx, 0.2, cz, 1.35, 0.4, 1.35, 0])
  const lids = chips.map(([cx, cz]) => [cx, 0.43, cz, 1.0, 0.06, 1.0, 0])
  const ledRef = useRef()
  const col = useMemo(() => new THREE.Color(), [])
  useFrame(({ clock }) => {
    const mesh = ledRef.current?.children?.[0]
    if (!mesh) return
    const t = clock.elapsedTime
    chips.forEach(([cx, cz], i) => {
      // A wave of activity sweeps across the 48 chips, like spikes through the machine.
      const k = Math.max(0.05, Math.sin(t * 2.2 - (cx - x) * 0.45 + (cz - z) * 0.3) ** 8 * 1.2)
      col.setRGB(CYAN[0] * k + 0.1, CYAN[1] * k + 0.1, CYAN[2] * k + 0.1)
      mesh.setColorAt(i, col)
    })
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })
  return (
    <group>
      <Instances items={bodies} material={M.chip} />
      <Instances items={lids} material={M.metal} />
      <group ref={ledRef}>
        <Instances items={chips.map(([cx, cz]) => [cx + 0.52, 0.47, cz + 0.52, 0.16, 0.05, 0.16, 0])} material={M.glowBasic} />
      </group>
      <Chip position={[x - 10.4, 0, z]} size={[2.4, 2.4]} h={0.3} label="STM32H7" sub="BOARD CTRL" rim={GOLD} phase={1} />
      <group position={[x, 0, z]}>
        <Rim w={16.4} d={12.4} color={CYAN} speed={0.8} />
        <Silk position={[0, 0.03, -7.1]} size={0.62}>SPINNCLOUD SYSTEMS</Silk>
        <Silk position={[0, 0.03, 7.1]} size={0.4}>48 CHIPS / BOARD · 720 BOARDS · 5M+ CORES</Silk>
      </group>
    </group>
  )
}

function Offenburg() {
  const [x, z] = LANDMARKS.offenburg
  return (
    <group>
      <Chip position={[x, 0, z]} size={[4.6, 4.6]} h={0.35} label="STM32H7" sub="TFLITE MICRO · AUTOENCODER" labelSize={0.62} rim={PINK} />
      <Chip position={[x - 4.4, 0, z + 2.6]} size={[1.3, 1.3]} h={0.25} pins="none" label="ACC" sub="1 kHz" labelSize={0.3} />
      <Led position={[x + 3.6, 0.06, z - 2.6]} color={[0.4, 3, 0.6]} rate={6} />
      <Silk position={[x, 0.03, z + 4]} size={0.42}>U3 · TINYML ANOMALY DETECTION</Silk>
      <Silk position={[x, 0.03, z - 3.9]} size={0.36} color="#e0b45a">97% DETECTION · &lt;2% FALSE POSITIVES</Silk>
    </group>
  )
}

function Cassiopeia() {
  const [x, z] = LANDMARKS.cassiopeia
  return (
    <group>
      <Chip position={[x + 1, 0, z]} size={[3.2, 3.2]} h={0.32} label="STM32F4" sub="FREERTOS · CONTROL" rim={GOLD} labelSize={0.42} phase={2} />
      <ElectroCap position={[x - 3.5, 0, z - 2.5]} r={0.9} h={2.6} />
      <ElectroCap position={[x - 3.7, 0, z + 1]} r={0.75} h={2} />
      <ElectroCap position={[x - 1.4, 0, z + 3.6]} r={0.6} h={1.5} />
      <Inductor position={[x + 4.4, 0, z - 2]} label="BUTTERWORTH" size={1.8} />
      <Inductor position={[x + 4.4, 0, z + 1.2]} label="CHEBYSHEV" size={1.5} />
      <Inductor position={[x + 2.2, 0, z + 3.6]} label="BESSEL" size={1.3} />
      <Silk position={[x, 0.03, z - 4.8]} size={0.46}>QUEEN CASSIOPEIA · CONTROL</Silk>
    </group>
  )
}

function SkillsBus() {
  const labels = [
    ['C · C++ · PYTHON · ARM ASM', -112],
    ['FREERTOS · BARE METAL · DRIVERS', -120],
    ['ETHERNET/UDP · CAN · SPI · I2C · UART', -128],
    ['KALMAN · H∞ · PID · LPV · RLS', -136],
    ['TINYML · TFLITE MICRO · QUANTIZATION', -144],
    ['CMAKE · DOCKER · CI/CD · GOOGLETEST · HIL', -152],
  ]
  return (
    <group>
      {labels.map(([t, z], i) => (
        <Silk key={t} position={[i % 2 ? 2.7 : -2.7, 0.03, z]} size={0.36} rotation={[-Math.PI / 2, 0, i % 2 ? -Math.PI / 2 : Math.PI / 2]}>
          {t}
        </Silk>
      ))}
    </group>
  )
}

function Drone({ position }) {
  const ref = useRef()
  const props = useRef([])
  const M = materials()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 1.6) * 0.25
      ref.current.rotation.y = t * 0.35
      ref.current.rotation.z = Math.sin(t * 1.1) * 0.06
    }
    props.current.forEach((p, i) => p && (p.rotation.y = t * 40 * (i % 2 ? 1 : -1)))
  })
  const arms = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
  return (
    <group ref={ref} position={position}>
      <mesh material={M.chip}>
        <boxGeometry args={[0.9, 0.25, 0.9]} />
      </mesh>
      {arms.map(([a, b], i) => (
        <group key={i}>
          <mesh position={[a * 0.6, 0, b * 0.6]} rotation-y={(a * b > 0 ? -1 : 1) * Math.PI / 4} material={M.chip}>
            <boxGeometry args={[1.5, 0.08, 0.14]} />
          </mesh>
          <mesh position={[a * 1.1, 0.12, b * 1.1]} material={M.metal}>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 12]} />
          </mesh>
          <mesh ref={(m) => (props.current[i] = m)} position={[a * 1.1, 0.24, b * 1.1]}>
            <boxGeometry args={[1.1, 0.02, 0.1]} />
            <meshStandardMaterial color="#cfd6dc" transparent opacity={0.55} />
          </mesh>
        </group>
      ))}
      <Led position={[0, 0.14, 0.46]} color={[3, 0.3, 0.3]} rate={5} size={[0.12, 0.05, 0.05]} />
    </group>
  )
}

function Projects() {
  const [x, z] = LANDMARKS.projects
  const M = materials()
  return (
    <group>
      <Chip position={[x - 2.5, 0, z - 2]} size={[2.6, 2.6]} h={0.3} label="STM32F7" sub="RLS ESTIMATOR" rim={GOLD} labelSize={0.36} />
      <group position={[x - 2.5, 0.9, z + 2.2]} rotation-z={Math.PI / 2}>
        <mesh material={M.metal}>
          <cylinderGeometry args={[0.9, 0.9, 2.4, 32]} />
        </mesh>
        <mesh position-y={1.45} material={M.pin}>
          <cylinderGeometry args={[0.1, 0.1, 0.7, 12]} />
        </mesh>
      </group>
      <Chip position={[x + 3, 0, z]} size={[3, 3]} h={0.3} label="UAV-SIM" sub="PID · LPV" rim={CYAN} labelSize={0.42} phase={1.5} />
      <Drone position={[x + 3, 2.4, z]} />
      <Chip position={[x - 1, 0, z + 5.4]} size={[2.2, 1.6]} h={0.26} pins="dual" label="HEAT PDE" sub="48 CHIPS" labelSize={0.3} />
      <Silk position={[x, 0.03, z - 5.2]} size={0.46}>PROJECTS</Silk>
    </group>
  )
}

function Education() {
  const [x, z] = LANDMARKS.education
  return (
    <group>
      <Chip position={[x - 1.6, 0, z - 1]} size={[3, 3]} h={0.4} spreader label="EPT" sub="M2 · RANK #1" labelSize={0.62} rim={GOLD} />
      <Chip position={[x + 2.6, 0, z + 1.2]} size={[2.6, 2.2]} h={0.3} pins="dual" label="INSAT" sub="ENG. DIPLOMA · TOP 5%" labelSize={0.48} rim={CYAN} phase={2} />
      <group position={[x - 2.5, 0, z + 3.4]}>
        <mesh position-y={0.3} material={materials().metal}>
          <boxGeometry args={[2, 0.6, 0.8]} />
        </mesh>
        <Text font={FONT} fontSize={0.2} color="#3a3f44" rotation-x={-Math.PI / 2} position={[0, 0.61, 0]}>DAAD · KOSPIE</Text>
      </group>
      <Silk position={[x, 0.03, z - 4.4]} size={0.46}>EDUCATION</Silk>
    </group>
  )
}

function Connector() {
  const [x, z] = LANDMARKS.contact
  const M = materials()
  const W = 5, H = 4, D = 4.4
  const front = z + D / 2
  const contacts = useMemo(() => {
    const out = []
    for (let i = 0; i < 8; i++) out.push([x - 1.4 + i * 0.4, H * 0.62, front - 1.2, 0.08, 0.04, 1.8, 0])
    return out
  }, [x, front])
  return (
    <group>
      <mesh position={[x, H / 2, z]} material={M.metal}>
        <boxGeometry args={[W, H, D]} />
      </mesh>
      <mesh position={[x, H * 0.45, front - 1.1]}>
        <boxGeometry args={[3.7, 2.4, 2.25]} />
        <meshBasicMaterial color="#030504" />
      </mesh>
      <mesh position={[x, H * 0.18, front + 0.01]} material={M.metal}>
        <boxGeometry args={[1.5, 0.5, 0.02]} />
      </mesh>
      <Instances items={contacts} material={M.gold} />
      <Led position={[x - 1.9, H - 0.35, front + 0.02]} color={[0.4, 3.2, 0.6]} rate={9} size={[0.6, 0.35, 0.05]} />
      <Led position={[x + 1.9, H - 0.35, front + 0.02]} color={[3.2, 1.8, 0.2]} rate={1.3} size={[0.6, 0.35, 0.05]} />
      <pointLight position={[x + 3, H + 3, front + 5]} intensity={40} distance={16} color="#ffe2b8" />
      <group position={[x, 0, z]}>
        <Rim w={W + 1.5} d={D + 1.5} color={GOLD} speed={1.6} />
      </group>
      <Silk position={[x - 4.4, 0.03, front + 1.2]} size={0.55} color="#e0b45a">ETH0</Silk>
      <Silk position={[x + 5, 0.03, front + 1.2]} size={0.55} color="#e0b45a">SAY HELLO</Silk>
    </group>
  )
}

export function Landmarks() {
  return (
    <group>
      <About />
      <SpinnCloud />
      <Offenburg />
      <Cassiopeia />
      <SkillsBus />
      <Projects />
      <Education />
      <Connector />
    </group>
  )
}
