import { useEffect, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faFacebookF, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faCompactDisc, faGuitar, faHeadphones, faMusic } from '@fortawesome/free-solid-svg-icons'
import riseLogo from '../img/rise-logo-header.png'
import { defaultProjectCards, resolveProjectImage, subscribeToProjectCards } from './projectCards'
import type { ProjectCard } from './projectCards'

const phone = '5491162621279'

const services = [
  ['01 / DISTRIBUCIÓN OFICIAL', 'Distribución musical mediante RouteNote', 'Preparamos y gestionamos tu lanzamiento para distribuirlo oficialmente en Spotify, Apple Music, YouTube Music, Amazon Music, Deezer y otras plataformas seleccionadas.', 'Distribuir mi música', 'distribuir oficialmente mi música mediante RouteNote'],
  ['02 / DIFUSIÓN', 'Difusión de lanzamientos', 'Comunicamos singles, discos, videoclips, entrevistas, noticias y fechas para ampliar el alcance de tu proyecto.', 'Difundir mi lanzamiento', 'difundir un lanzamiento'],
  ['03 / LETRAS', 'Transcripción y publicación de letras', 'Organizamos y publicamos tus letras para que tu obra tenga información completa y presencia más allá de las redes sociales.', 'Publicar mis letras', 'publicar las letras de mis canciones'],
  ['04 / WEB', 'Páginas web para bandas', 'Creamos un espacio propio con biografía, música, videos, agenda, prensa y contacto, preparado para celulares y buscadores.', 'Quiero mi web', 'crear una página web para mi banda'],
  ['05 / IDENTIDAD DIGITAL', 'Presencia digital para artistas', 'Ordenamos la información del proyecto para que pueda encontrarse, entenderse y compartirse con claridad.', 'Mejorar mi presencia', 'mejorar la presencia digital de mi proyecto'],
] as const

const channelGroups = [
  {
    number: '01',
    title: 'Streaming musical',
    description: 'Tu catálogo preparado para llegar a las principales plataformas de escucha.',
    channels: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer', 'TIDAL'],
  },
  {
    number: '02',
    title: 'Redes y descubrimiento',
    description: 'Música disponible en canales donde el público descubre, comparte y crea contenido.',
    channels: ['TikTok', 'Instagram', 'Facebook', 'SoundCloud', 'Shazam'],
  },
  {
    number: '03',
    title: 'Identidad del lanzamiento',
    description: 'Acompañamos el orden del audio, portada, créditos, metadatos y fecha de publicación.',
    channels: ['Single', 'EP', 'Álbum', 'Videoclip', 'Letras', 'Perfil artístico'],
  },
]

const whatsappHref = (topic: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(`Hola Rise, vi la web y quiero consultar por ${topic}.`)}`

type MusicParticle = {
  id: string
  icon: IconDefinition
  x: number
  y: number
  rotation: number
  size: number
  duration: number
  delay: number
  color: string
}

type ParticleStyle = CSSProperties & {
  '--particle-x': string
  '--particle-y': string
  '--particle-rotation': string
  '--particle-duration': string
  '--particle-delay': string
}

const particleIcons = [faMusic, faCompactDisc, faHeadphones, faGuitar]
const particleColors = ['#9d5cff', '#49dcff', '#ff4faa', '#f5f3f8', '#25d366']

function App() {
  const [musicParticles, setMusicParticles] = useState<MusicParticle[]>([])
  const [projects, setProjects] = useState<ProjectCard[]>(defaultProjectCards)

  useEffect(() => subscribeToProjectCards(cards => {
    setProjects(cards.filter(card => card.visible))
  }), [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cycleTimer = 0
    const removalTimers: number[] = []

    const emitMusic = () => {
      const stamp = Date.now()
      const amount = 7 + Math.floor(Math.random() * 5)
      const spreadX = Math.max(150, window.innerWidth - 45)
      const spreadY = Math.max(260, window.innerHeight * 0.82)
      const batch = Array.from({ length: amount }, (_, index): MusicParticle => ({
        id: `${stamp}-${index}`,
        icon: particleIcons[Math.floor(Math.random() * particleIcons.length)],
        x: -(45 + Math.random() * spreadX),
        y: -(55 + Math.random() * spreadY),
        rotation: -240 + Math.random() * 720,
        size: 11 + Math.random() * 15,
        duration: 1750 + Math.random() * 1500,
        delay: Math.random() * 260,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
      }))

      setMusicParticles(previous => [...previous, ...batch])
      const ids = new Set(batch.map(particle => particle.id))
      removalTimers.push(window.setTimeout(() => {
        setMusicParticles(previous => previous.filter(particle => !ids.has(particle.id)))
      }, 3600))
    }

    const startTimer = window.setTimeout(() => {
      emitMusic()
      cycleTimer = window.setInterval(emitMusic, 14000)
    }, 11700)

    return () => {
      window.clearTimeout(startTimer)
      window.clearInterval(cycleTimer)
      removalTimers.forEach(timer => window.clearTimeout(timer))
    }
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const service = String(data.get('service') ?? '')
    const link = String(data.get('link') ?? '').trim() || 'No adjunté enlace'
    const message = String(data.get('message') ?? '').trim() || 'Quiero recibir más información.'
    const text = `Hola Rise, vi la web y quiero hacer una consulta.\n\nNombre / banda: ${name}\nServicio: ${service}\nEnlace: ${link}\nConsulta: ${message}`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <a className="skip" href="#contenido">Ir al contenido</a>
      <header className="topbar">
        <nav className="wrap" aria-label="Navegación principal">
          <a className="brand" href="#inicio" aria-label="Rise Distribución Musical, inicio">
            <img className="brand-logo" src={riseLogo} width="880" height="272" alt="Rise Distribución Musical" />
          </a>
          <div className="menu"><a href="#servicios">Servicios</a><a href="#plataformas">Plataformas</a><a href="#proyectos">Proyectos</a><a href="#preguntas">Preguntas</a></div>
          <a className="nav-cta" href={whatsappHref('una consulta')} target="_blank" rel="noreferrer">Hablemos</a>
        </nav>
      </header>

      <main id="contenido">
        <section className="hero" id="inicio">
          <div className="wrap">
            <span className="eyebrow"><span className="dot" />Rise Difusión musical · Argentina</span>
            <h1>Rise Difusión impulsa tu música.<br /><span className="glow-text">Publicarla es solo el comienzo.</span></h1>
            <p className="lead">Rise Difusión gestiona distribución musical mediante RouteNote, difusión en redes, transcripción de letras y presencia digital para artistas independientes.</p>
            <div className="actions">
              <a className="btn btn-primary" href={whatsappHref('impulsar mi proyecto musical')} target="_blank" rel="noreferrer">Impulsar mi proyecto</a>
              <a className="btn" href="#servicios">Ver servicios</a>
            </div>
            <p className="hero-note">Rise Difusión · Argentina · Trabajamos con artistas independientes</p>
          </div>
          <div className="orb" />
        </section>

        <section id="servicios"><div className="wrap">
          <header className="section-head"><span className="eyebrow">Servicios de Rise para artistas</span><h2>Distribución, difusión y presencia para tu música.</h2><p className="muted">Un acompañamiento concreto para que cada lanzamiento tenga distribución musical, promoción, letras, identidad y un canal directo con su público.</p></header>
          <div className="grid services">{services.map(([number, title, description, label, topic]) => (
            <article className="glass service" key={number}><div><span className="service-no">{number}</span><h3>{title}</h3><p>{description}</p></div><a className="text-link" href={whatsappHref(topic)} target="_blank" rel="noreferrer">{label} →</a></article>
          ))}</div>
        </div></section>

        <section className="channels-section" id="plataformas"><div className="wrap">
          <header className="section-head channels-head">
            <span className="eyebrow">Distribución musical y canales digitales</span>
            <h2>Distribución musical gestionada por Rise para plataformas digitales.</h2>
            <p className="muted">Rise acompaña la preparación y gestión de cada lanzamiento mediante <a className="inline-link" href="https://www.routenote.com/" target="_blank" rel="noreferrer">RouteNote</a>, compañía de distribución musical que envía el material aprobado a las tiendas y servicios seleccionados.</p>
            <div className="official-badge"><span className="dot" />Distribución oficial de lanzamientos mediante RouteNote</div>
          </header>
          <div className="grid channel-grid">
            {channelGroups.map(group => (
              <article className="glass channel-card" key={group.number}>
                <span className="service-no">{group.number} / CANALES</span>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                <ul className="channel-list" aria-label={`Canales de ${group.title}`}>
                  {group.channels.map(channel => <li key={channel}>{channel}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <p className="distribution-note">La publicación está sujeta a la revisión de RouteNote y a las condiciones, disponibilidad y tiempos de cada plataforma. Rise te acompaña para presentar el lanzamiento correctamente.</p>
        </div></section>

        <section><div className="wrap statement"><p>Si tu música está en Instagram, pero tus letras y tu proyecto todavía no tienen presencia en la web, <strong>te estás quedando atrás.</strong></p></div></section>

        <section id="proyectos"><div className="wrap">
          <header className="section-head"><span className="eyebrow">Trabajos y difusión</span><h2>Artistas y proyectos que pasaron por Rise.</h2></header>
          <div className="grid projects">{projects.map(project => (
            <article className="glass project" key={project.id}>
              <img src={resolveProjectImage(project.image)} alt={`Arte de ${project.title}`} loading="lazy" />
              <div className="project-shade" />
              <div className="project-info"><small>{project.type}{project.genre ? ` · ${project.genre}` : ''}</small><h3>{project.title}</h3></div>
            </article>
          ))}</div>
        </div></section>

        <section><div className="wrap"><header className="section-head"><span className="eyebrow">Cómo trabajamos</span><h2>Un recorrido simple.</h2></header><div className="process">
          <article className="step"><div><h3>Contanos sobre tu proyecto</h3><p>Compartí tu música, tus redes y el objetivo que querés alcanzar.</p></div></article>
          <article className="step"><div><h3>Definimos el servicio</h3><p>Revisamos el material y elegimos una propuesta acorde al momento del lanzamiento.</p></div></article>
          <article className="step"><div><h3>Activamos la presencia</h3><p>Distribuimos, publicamos o desarrollamos las piezas digitales acordadas.</p></div></article>
        </div></div></section>

        <section id="contacto"><div className="wrap contact">
          <div className="contact-copy"><span className="eyebrow">Empezá ahora</span><h2>Tu música ya está creada. Hagamos que llegue más lejos.</h2><p>Completá los datos y la consulta se abrirá directamente en WhatsApp.</p><div className="tags"><span className="tag">Distribución</span><span className="tag">Difusión</span><span className="tag">Letras</span><span className="tag">Webs para bandas</span></div></div>
          <form className="glass form" id="rise-form" onSubmit={handleSubmit}>
            <div className="field"><label htmlFor="name">Nombre o banda</label><input id="name" name="name" autoComplete="name" required placeholder="¿Cómo se llama tu proyecto?" /></div>
            <div className="field"><label htmlFor="service">Servicio que te interesa</label><select id="service" name="service" required defaultValue=""><option value="">Elegí una opción</option><option>Distribución musical mediante RouteNote</option><option>Difusión de un lanzamiento</option><option>Transcripción y publicación de letras</option><option>Página web para banda o artista</option><option>Presencia digital</option><option>Otro / Quiero asesoramiento</option></select></div>
            <div className="field"><label htmlFor="link">Enlace a tu música o red</label><input id="link" name="link" type="url" inputMode="url" placeholder="https://" /></div>
            <div className="field"><label htmlFor="message">Contanos qué necesitás</label><textarea id="message" name="message" placeholder="Lanzamiento, fecha estimada y objetivo..." /></div>
            <button className="btn btn-primary submit" type="submit">Enviar consulta por WhatsApp</button>
            <p className="privacy">No guardamos tus datos. Al enviar, se abrirá WhatsApp con el mensaje preparado.</p>
          </form>
        </div></section>

        <section className="faq" id="preguntas"><div className="wrap"><header className="section-head"><span className="eyebrow">Preguntas frecuentes</span><h2>Rise, distribución musical y letras.</h2></header>
          <details><summary>¿Qué servicios ofrece Rise Difusión?</summary><p>Rise Difusión reúne distribución musical mediante RouteNote, difusión en redes, transcripción y publicación de letras, y presencia digital para artistas y proyectos independientes.</p></details>
          <details><summary>¿Rise trabaja solamente con bandas de rock?</summary><p>No. Rise acompaña a artistas y proyectos independientes de diferentes estilos que necesiten distribución, difusión o presencia digital.</p></details>
          <details><summary>¿Pueden distribuir mi música en Spotify?</summary><p>Rise gestiona distribución musical mediante RouteNote, que permite enviar lanzamientos a Spotify y otras plataformas digitales. La disponibilidad final depende de la revisión y las condiciones de cada plataforma.</p></details>
          <details><summary>¿En qué plataformas puede publicarse mi lanzamiento?</summary><p>Según los canales disponibles y seleccionados en RouteNote, puede distribuirse a servicios como Spotify, Apple Music, YouTube Music, Amazon Music, Deezer, TIDAL, TikTok, Instagram/Facebook, SoundCloud y Shazam.</p></details>
          <details><summary>¿Rise es distribuidor musical oficial?</summary><p>Rise gestiona la distribución oficial de tus lanzamientos mediante RouteNote. RouteNote es la compañía de distribución que revisa el material aprobado y lo entrega a las tiendas seleccionadas; Rise te acompaña en la preparación, carga y seguimiento.</p></details>
          <details><summary>¿Rise realiza transcripción de letras de canciones?</summary><p>Sí. Rise ofrece transcripción, organización y publicación de letras para que las canciones tengan información clara y una presencia digital más completa.</p></details>
          <details><summary>¿Por qué una banda necesita una página web?</summary><p>Porque reúne música, historia, agenda, videos, prensa y contacto en un espacio propio, fácil de compartir y preparado para aparecer en buscadores.</p></details>
          <details><summary>¿Cómo solicito una propuesta?</summary><p>Completá el formulario o escribí por WhatsApp. Contanos qué querés lanzar, compartí un enlace y te respondemos con los próximos pasos.</p></details>
        </div></section>
      </main>

      <footer>
        <div className="wrap foot">
          <span>© {new Date().getFullYear()} Rise Difusión</span>
          <div className="social-links" aria-label="Redes sociales de Rise Difusión">
            <a href="https://www.instagram.com/rise.difusion/" target="_blank" rel="noreferrer" aria-label="Rise Difusión en Instagram" title="Instagram @rise.difusion"><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="https://www.facebook.com/rise.difusion" target="_blank" rel="noreferrer" aria-label="Rise Difusión en Facebook" title="Facebook @rise.difusion"><FontAwesomeIcon icon={faFacebookF} /></a>
          </div>
          <span>Distribución musical · Difusión · Presencia digital</span>
        </div>
        <div className="wrap tech-credit" aria-label="Crédito de desarrollo">
          <h2><a href="https://www.instagram.com/tellounder/" target="_blank" rel="noreferrer" aria-label="Tellounder en Instagram">Tellounder</a> <span>· Desarrollo informático, diseño web y soluciones digitales</span></h2>
        </div>
      </footer>
      <div className="music-particles" aria-hidden="true">
        {musicParticles.map(particle => {
          const style: ParticleStyle = {
            '--particle-x': `${particle.x}px`,
            '--particle-y': `${particle.y}px`,
            '--particle-rotation': `${particle.rotation}deg`,
            '--particle-duration': `${particle.duration}ms`,
            '--particle-delay': `${particle.delay}ms`,
            color: particle.color,
            fontSize: `${particle.size}px`,
          }
          return <span className="music-particle" style={style} key={particle.id}><FontAwesomeIcon icon={particle.icon} /></span>
        })}
      </div>
      <a className="whatsapp" href={whatsappHref('conocer los servicios de Rise')} target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp">
        <span className="wa-disc" aria-hidden="true"><FontAwesomeIcon icon={faWhatsapp} /></span>
        <span className="wa-label">WhatsApp</span>
      </a>
    </>
  )
}

export default App
