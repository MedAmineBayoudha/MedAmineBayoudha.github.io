import * as THREE from 'three'
import monoFontUrl from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff?url'

export const FONT = monoFontUrl

function boardTexture() {
  const size = 512
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  g.fillStyle = '#0d3a22'
  g.fillRect(0, 0, size, size)
  // Faint copper-pour hatch under the solder mask.
  g.strokeStyle = 'rgba(40,120,70,0.18)'
  g.lineWidth = 2
  for (let i = -size; i < size * 2; i += 16) {
    g.beginPath()
    g.moveTo(i, 0)
    g.lineTo(i + size, size)
    g.stroke()
  }
  const img = g.getImageData(0, 0, size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10
    img.data[i] += n
    img.data[i + 1] += n
    img.data[i + 2] += n
  }
  g.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

let cache
export function materials() {
  if (cache) return cache
  cache = {
    board: new THREE.MeshStandardMaterial({ map: boardTexture(), roughness: 0.36, metalness: 0.12, envMapIntensity: 0.7 }),
    boardEdge: new THREE.MeshStandardMaterial({ color: '#c8b98a', roughness: 0.8 }),
    maskTrace: new THREE.MeshStandardMaterial({ color: '#1f7045', roughness: 0.32, metalness: 0.25, envMapIntensity: 0.8 }),
    gold: new THREE.MeshStandardMaterial({ color: '#d9ae55', metalness: 1, roughness: 0.28, emissive: '#4a3208', emissiveIntensity: 0.7 }),
    viaHole: new THREE.MeshBasicMaterial({ color: '#020403' }),
    chip: new THREE.MeshStandardMaterial({ color: '#15171a', roughness: 0.55, metalness: 0.2 }),
    pin: new THREE.MeshStandardMaterial({ color: '#d7dbe0', metalness: 1, roughness: 0.22 }),
    metal: new THREE.MeshStandardMaterial({ color: '#b7bec5', metalness: 1, roughness: 0.32 }),
    ceramic: new THREE.MeshStandardMaterial({ color: '#a0825c', roughness: 0.6 }),
    resistor: new THREE.MeshStandardMaterial({ color: '#17191c', roughness: 0.5 }),
    capSleeve: new THREE.MeshStandardMaterial({ color: '#1d2d58', roughness: 0.35, metalness: 0.3 }),
    capStripe: new THREE.MeshStandardMaterial({ color: '#8fa3c9', roughness: 0.4 }),
    inductor: new THREE.MeshStandardMaterial({ color: '#2a2b2e', roughness: 0.7 }),
    glowBasic: new THREE.MeshBasicMaterial({ toneMapped: false }),
  }
  return cache
}

export const SILK = '#e3ece6'
export const LASER = '#8d9491'
