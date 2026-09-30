import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

// Shared scroll state. `s` is a continuous section index: 0 at the top of the
// first section, 1 at the top of the second, and so on. The 3D camera reads it
// every frame; React only hears about changes to the active section.
export const scroll = { s: 0, lenis: null }

// Fraction of each section, on either side of a stop, where the camera stays
// parked so the text can be read.
export const HOLD = 0.22

export function initScroll(onActive, onCard) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lenis = new Lenis({ lerp: reduce ? 1 : 0.085, smoothWheel: !reduce })
  scroll.lenis = lenis

  let tops = []
  let active = -1
  let card = -2
  const measure = () => {
    tops = [...document.querySelectorAll('[data-stop]')].map((el) => el.getBoundingClientRect().top + window.scrollY)
    update()
  }
  const update = () => {
    if (!tops.length) return
    const y = window.scrollY
    const max = document.documentElement.scrollHeight - window.innerHeight
    const last = tops.length - 1
    let s = 0
    if (y >= max - 2) s = last
    else if (y > tops[0]) {
      let i = 0
      while (i < last && y >= tops[i + 1]) i++
      if (i === last) s = last
      else {
        // The last section may not be able to reach the top of the viewport.
        const end = i + 1 === last ? Math.min(tops[last], max) : tops[i + 1]
        s = i + Math.min(1, (y - tops[i]) / Math.max(1, end - tops[i]))
      }
    }
    scroll.s = s
    const a = Math.round(s)
    if (a !== active) {
      active = a
      onActive?.(a)
    }
    // Show a card only while the camera is parked (with a little margin).
    const c = Math.abs(s - a) < HOLD + 0.08 ? a : -1
    if (c !== card) {
      card = c
      onCard?.(c)
    }
  }

  lenis.on('scroll', update)
  window.addEventListener('resize', measure)
  const ro = new ResizeObserver(measure)
  ro.observe(document.body)
  measure()

  let raf = 0
  const loop = (t) => {
    lenis.raf(t)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    window.removeEventListener('resize', measure)
    lenis.destroy()
    scroll.lenis = null
  }
}

export function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (scroll.lenis) scroll.lenis.scrollTo(el, { duration: 2.2 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
