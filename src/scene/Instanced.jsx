import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const BOX = new THREE.BoxGeometry(1, 1, 1)
const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 20)
const CYL_LOW = new THREE.CylinderGeometry(0.5, 0.5, 1, 10)
export const GEOMETRY = { box: BOX, cyl: CYL, cylLow: CYL_LOW }

const dummy = new THREE.Object3D()

// Renders many copies of one shape in a single draw call.
// Each item is [x, y, z, sx, sy, sz, rotationY]; y is the centre of the shape.
export function Instances({ items, material, shape = 'box', castShadow = false }) {
  const ref = useRef()
  const geometry = GEOMETRY[shape]
  const count = items.length

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    items.forEach(([x, y, z, sx, sy, sz, ry = 0], i) => {
      dummy.position.set(x, y, z)
      dummy.rotation.set(0, ry, 0)
      dummy.scale.set(sx, sy, sz)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [items])

  // Key by count so the buffer is reallocated if the number of items changes.
  return useMemo(
    () => count > 0 && (
      <instancedMesh key={count} ref={ref} args={[geometry, material, count]} castShadow={castShadow} frustumCulled={false} />
    ),
    [count, geometry, material, castShadow],
  )
}

// Converts polylines into flat segments plus round joints, like real PCB traces.
export function traceInstances(polylines, width, y) {
  const segs = []
  const joints = []
  for (const pts of polylines) {
    for (let i = 0; i < pts.length; i++) {
      joints.push([pts[i][0], y, pts[i][1], width, 0.02, width, 0])
      if (i === 0) continue
      const [x0, z0] = pts[i - 1]
      const [x1, z1] = pts[i]
      const dx = x1 - x0, dz = z1 - z0
      const len = Math.hypot(dx, dz)
      if (len < 0.001) continue
      segs.push([(x0 + x1) / 2, y, (z0 + z1) / 2, len, 0.02, width, Math.atan2(-dz, dx)])
    }
  }
  return { segs, joints }
}
