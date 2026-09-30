import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { HOLD, scroll } from '../scroll'
import { LOW_POWER, STOPS, generateBoard } from './layout'
import { Board, Components, Packets } from './City'
import { Landmarks } from './Landmarks'

const BG = '#020805'
const smooth = (x) => x * x * (3 - 2 * x)

function CameraRig() {
  const { camera, scene, size } = useThree()
  const posCurve = useMemo(() => new THREE.CatmullRomCurve3(STOPS.map((s) => new THREE.Vector3(...s.pos)), false, 'centripetal'), [])
  const lookCurve = useMemo(() => new THREE.CatmullRomCurve3(STOPS.map((s) => new THREE.Vector3(...s.look)), false, 'centripetal'), [])
  const state = useRef({ s: scroll.s, px: 0, py: 0 })
  const v = useMemo(() => ({ p: new THREE.Vector3(), l: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), fwd: new THREE.Vector3() }), [])

  useFrame(({ pointer }, dt) => {
    const st = state.current
    const d = Math.min(dt, 0.05)
    st.s = THREE.MathUtils.damp(st.s, scroll.s, 3.2, d)
    st.px = THREE.MathUtils.damp(st.px, pointer.x, 2, d)
    st.py = THREE.MathUtils.damp(st.py, pointer.y, 2, d)

    // Park at each stop for the HOLD zone on either side, then fly to the next.
    const n = STOPS.length - 1
    const i = Math.min(n - 1, Math.floor(st.s))
    const f = Math.min(1, Math.max(0, st.s - i))
    const e = smooth(Math.min(1, Math.max(0, (f - HOLD) / (1 - 2 * HOLD))))
    const t = (i + e) / n
    posCurve.getPoint(t, v.p)
    lookCurve.getPoint(t, v.l)

    const a = STOPS[i], b = STOPS[i + 1]
    const portrait = size.width / size.height < 0.85
    const side = portrait ? 0 : THREE.MathUtils.lerp(a.side, b.side, e)
    const lift = portrait ? 0.75 : THREE.MathUtils.lerp(a.lift, b.lift, e)

    // Frame the landmark away from the text panel by nudging where we look.
    v.fwd.subVectors(v.l, v.p)
    const dist = v.fwd.length()
    v.fwd.normalize()
    v.right.crossVectors(v.fwd, camera.up).normalize()
    v.up.crossVectors(v.right, v.fwd).normalize()
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist
    const halfW = halfH * camera.aspect
    v.l.addScaledVector(v.right, -side * halfW * 0.46)
    v.l.addScaledVector(v.up, -lift * halfH * 0.38)

    v.p.x += st.px * 0.5
    v.p.y += st.py * 0.25
    camera.position.copy(v.p)
    camera.lookAt(v.l)

    // Fog follows altitude: clear from high up, moody down in the streets.
    const y = camera.position.y
    scene.fog.near = 6 + y * 0.9
    scene.fog.far = 42 + y * 2.2
  })
  return null
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <hemisphereLight args={['#9fd8ff', '#0a2014', 0.5]} />
      <directionalLight position={[20, 30, 10]} intensity={1.5} color="#ffe2b8" />
      <directionalLight position={[-20, 12, -30]} intensity={0.7} color="#6fd6ff" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffd9a0" position={[0, 8, 6]} scale={[14, 3, 1]} rotation-x={Math.PI / 2.4} />
        <Lightformer form="rect" intensity={2} color="#62d8ff" position={[-10, 4, -6]} scale={[10, 2, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[10, 5, -2]} scale={[8, 2, 1]} rotation-y={-Math.PI / 2} />
      </Environment>
    </>
  )
}

export default function Scene({ onReady }) {
  const board = useMemo(() => generateBoard(), [])
  useEffect(() => {
    onReady?.()
  }, [onReady])

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 20, 80]} />
      <CameraRig />
      <Lights />
      <Board board={board} />
      <Components board={board} />
      <Landmarks />
      <Packets board={board} />
      <EffectComposer multisampling={LOW_POWER ? 0 : 4} enableNormalPass={false}>
        <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={LOW_POWER ? 0.9 : 1.15} radius={0.72} />
        <Vignette offset={0.25} darkness={0.75} />
        {!LOW_POWER && <Noise opacity={0.035} premultiply />}
      </EffectComposer>
    </>
  )
}
