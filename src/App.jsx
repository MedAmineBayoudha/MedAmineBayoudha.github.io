import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { initScroll, scrollToSection } from './scroll'
import { LOW_POWER, STOPS } from './scene/layout'
import { about, certifications, education, experience, languages, profile, projects, skills } from './content'
import portrait from './assets/profile.jpg'

const Scene = lazy(() => import('./scene/Scene'))

const RAIL = ['Start', 'About', 'SpiNNcloud', 'Offenburg', 'Cassiopeia', 'Skills', 'Projects', 'Education', 'Contact']

export default function App() {
  const [active, setActive] = useState(0)
  // Index of the card on screen, or -1 while the camera is flying between stops.
  const [card, setCard] = useState(0)
  const [ready, setReady] = useState(false)
  const [dpr, setDpr] = useState(LOW_POWER ? 1 : 1.5)
  const markReady = useCallback(() => setTimeout(() => setReady(true), 250), [])

  useEffect(() => initScroll(setActive, setCard), [])

  const cards = [
    <Hero key="hero" />,
    <About key="about" />,
    ...experience.map((job) => <Job key={job.id} job={job} />),
    <Skills key="skills" />,
    <Projects key="projects" />,
    <Education key="education" />,
    <Contact key="contact" />,
  ]

  return (
    <>
      <div className="stage" aria-hidden="true">
        <Canvas dpr={dpr} camera={{ fov: 45, near: 0.1, far: 160, position: STOPS[0].pos }}
          gl={{ antialias: false, powerPreference: 'high-performance' }}>
          <PerformanceMonitor onDecline={() => setDpr(1)} />
          <Suspense fallback={null}>
            <Scene onReady={markReady} />
          </Suspense>
        </Canvas>
      </div>

      <div className={`scrim ${card > 0 ? 'on' : ''}`} aria-hidden="true" />

      <Loader done={ready} />
      <Header />
      <Rail active={active} />

      <div className="deck">
        {cards.map((c, i) => (
          <div key={STOPS[i].id} className={`slot ${i === 0 ? 'slot-hero' : ''} ${i === card ? 'show' : ''}`} inert={i !== card}>
            {c}
          </div>
        ))}
      </div>

      <div className={`scroll-hint ${card === 0 ? 'show' : ''}`} aria-hidden="true">
        <span>SCROLL TO FOLLOW THE DATA</span>
        <i />
      </div>

      {/* Empty sections give the page its scroll length and anchor each camera stop. */}
      <main>
        {STOPS.map((s) => (
          <section key={s.id} id={s.id} data-stop className="stop" />
        ))}
      </main>
    </>
  )
}

function Loader({ done }) {
  const [gone, setGone] = useState(false)
  const [lines, setLines] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setLines((n) => Math.min(n + 1, 4)), 260)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setGone(true), 900)
    return () => clearTimeout(t)
  }, [done])
  if (gone) return null
  const boot = ['> reset vector 0x08000000', '> clocks: PLL locked @ 480 MHz', '> init UART · SPI · I2C · DMA', '> starting scheduler…']
  return (
    <div className={`loader ${done ? 'out' : ''}`} role="status" aria-label="Loading">
      <div className="loader-box">
        <div className="ref">BOOT · FW v2026.1</div>
        <pre>{boot.slice(0, lines).join('\n')}</pre>
        <div className="bar"><span className={done ? 'full' : ''} /></div>
      </div>
    </div>
  )
}

function Header() {
  const go = (id) => (e) => {
    e.preventDefault()
    scrollToSection(id)
  }
  return (
    <header className="top">
      <a href="#hero" className="brand" onClick={go('hero')}>
        <span className="chip-logo" aria-hidden="true">MA</span>
        <span className="brand-name">{profile.first} {profile.last}</span>
      </a>
      <nav>
        <a href="#spinncloud" onClick={go('spinncloud')}>Experience</a>
        <a href="#skills" onClick={go('skills')}>Skills</a>
        <a href="#projects" onClick={go('projects')}>Projects</a>
        <a href="#contact" className="nav-cta" onClick={go('contact')}>Contact</a>
      </nav>
    </header>
  )
}

function Rail({ active }) {
  return (
    <nav className="rail" aria-label="Sections">
      {STOPS.map((s, i) => (
        <button key={s.id} className={i === active ? 'on' : i < active ? 'past' : ''} onClick={() => scrollToSection(s.id)}
          aria-label={RAIL[i]} aria-current={i === active ? 'true' : undefined}>
          <span className="tp">TP{i + 1}</span>
          <span className="lbl">{RAIL[i]}</span>
        </button>
      ))}
    </nav>
  )
}

function Panel({ className = '', children }) {
  return (
    <article className={`panel ${className}`} data-lenis-prevent>
      {children}
    </article>
  )
}

function Tags({ items }) {
  return (
    <ul className="tags">
      {items.map((t) => <li key={t}>{t}</li>)}
    </ul>
  )
}

function Hero() {
  return (
    <div className="hero">
      <div className="portrait">
        <img src={portrait} alt={`Portrait of ${profile.first} ${profile.last}`} width="800" height="800" />
      </div>
      <div className="ref">{profile.location.toUpperCase()} · REV 2026</div>
      <h1 className="sr-only">{profile.first} {profile.last}</h1>
      <p className="role">{profile.title}</p>
      <p className="tagline">{profile.tagline}</p>
      <div className="actions">
        <a className="btn" href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about') }}>Power on</a>
        <a className="btn ghost" href={`mailto:${profile.email}`}>Get in touch</a>
      </div>
    </div>
  )
}

function About() {
  return (
    <Panel>
      <div className="ref">U1 · ABOUT</div>
      <h2>Firmware at the edge of the silicon</h2>
      <p>{about.text}</p>
      <div className="stats">
        {about.stats.map((s) => (
          <div key={s.label}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function Job({ job }) {
  return (
    <Panel>
      <div className="ref">{job.ref} · {job.company.toUpperCase()}</div>
      <h2>{job.role}</h2>
      <p className="meta">{job.company} · {job.place}<br />{job.dates}</p>
      <ul className="points">
        {job.points.map((p) => <li key={p}>{p}</li>)}
      </ul>
      <Tags items={job.tags} />
    </Panel>
  )
}

function Skills() {
  return (
    <Panel>
      <div className="ref">BUS · SKILLS</div>
      <h2>What travels on the bus</h2>
      <div className="skill-grid">
        {skills.map((g) => (
          <div key={g.group}>
            <h3>{g.group}</h3>
            <Tags items={g.items} />
          </div>
        ))}
      </div>
    </Panel>
  )
}

function Projects() {
  return (
    <Panel>
      <div className="ref">U5 · PROJECTS</div>
      <h2>Side projects and research</h2>
      <div className="project-list">
        {projects.map((p) => (
          <section key={p.name}>
            <h3>{p.name}</h3>
            <p>{p.text}</p>
            <Tags items={p.tags} />
          </section>
        ))}
      </div>
    </Panel>
  )
}

function Education() {
  return (
    <Panel>
      <div className="ref">U6 · EDUCATION</div>
      <h2>Education</h2>
      <div className="edu">
        {education.map((e) => (
          <section key={e.degree}>
            <div className="edu-date">{e.date}</div>
            <div>
              <h3>{e.degree}</h3>
              <p className="meta">{e.school}</p>
              <p className="note">{e.note}</p>
            </div>
          </section>
        ))}
      </div>
      <h3 className="sub">Certifications</h3>
      <ul className="points compact">
        {certifications.map((c) => <li key={c}>{c}</li>)}
      </ul>
      <h3 className="sub">Languages</h3>
      <ul className="langs">
        {languages.map((l) => <li key={l.name}><b>{l.name}</b> {l.level}</li>)}
      </ul>
    </Panel>
  )
}

function Contact() {
  return (
    <Panel>
      <div className="ref">ETH0 · CONTACT</div>
      <h2>Send a packet</h2>
      <p>Want to talk firmware, control systems or edge ML? My inbox is open.</p>
      <div className="actions">
        <a className="btn" href={`mailto:${profile.email}`}>{profile.email}</a>
        <a className="btn ghost" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
      <p className="foot">{profile.location} · © {new Date().getFullYear()} {profile.first} {profile.last}</p>
    </Panel>
  )
}
