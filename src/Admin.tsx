import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faArrowLeft, faArrowUp, faEye, faEyeSlash, faPlus, faSave, faTrash } from '@fortawesome/free-solid-svg-icons'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'
import { defaultProjectCards, MAX_PROJECT_CARDS, PROJECT_CARDS_COLLECTION, resolveProjectImage, subscribeToProjectCards } from './projectCards'
import type { ProjectCard } from './projectCards'

const ADMIN_EMAILS = new Set([
  'mariano.risero@gmail.com',
  'emmatello008@gmail.com',
])

const MAX_IMAGE_BYTES = 620_000

function isAdmin(user: User | null) {
  return Boolean(user?.email && ADMIN_EMAILS.has(user.email.toLowerCase()))
}

function imageToWebp(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Elegí un archivo de imagen.'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('La imagen no tiene un formato válido.'))
      image.onload = () => {
        const maxSide = 1200
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('El navegador no pudo procesar la imagen.'))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)

        let quality = 0.82
        let result = canvas.toDataURL('image/webp', quality)
        while (result.length > MAX_IMAGE_BYTES && quality > 0.42) {
          quality -= 0.08
          result = canvas.toDataURL('image/webp', quality)
        }

        if (result.length > MAX_IMAGE_BYTES) {
          reject(new Error('La imagen sigue siendo demasiado pesada. Probá con una foto más pequeña.'))
          return
        }
        resolve(result)
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

function newCard(): ProjectCard {
  return {
    id: `proyecto-${Date.now()}`,
    title: 'Nuevo proyecto',
    type: 'Artista / banda',
    genre: 'Rock',
    image: '',
    order: 0,
    visible: true,
  }
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [cards, setCards] = useState<ProjectCard[]>(defaultProjectCards)
  const [loadedFromFirestore, setLoadedFromFirestore] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    const previousTitle = document.title
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const previousRobots = robots?.content
    document.title = 'Administración | Rise Difusión'
    if (robots) robots.content = 'noindex, nofollow'
    return () => {
      document.title = previousTitle
      if (robots && previousRobots) robots.content = previousRobots
    }
  }, [])

  useEffect(() => onAuthStateChanged(auth, currentUser => {
    setUser(currentUser)
    setAuthReady(true)
  }), [])

  useEffect(() => {
    if (!isAdmin(user)) return
    return subscribeToProjectCards((nextCards, fromFirestore) => {
      setCards(nextCards.map(card => ({ ...card })))
      setLoadedFromFirestore(fromFirestore)
    }, firestoreError => setError(`No se pudo leer Firestore: ${firestoreError.message}`))
  }, [user])

  const visibleCount = useMemo(() => cards.filter(card => card.visible).length, [cards])

  const login = async () => {
    setError('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (!isAdmin(result.user)) {
        await signOut(auth)
        setError('Esta cuenta no está autorizada para administrar Rise.')
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'No se pudo iniciar sesión.')
    }
  }

  const updateCard = (id: string, values: Partial<ProjectCard>) => {
    setCards(current => current.map(card => card.id === id ? { ...card, ...values } : card))
    setNotice('Cambios sin publicar')
  }

  const addCard = () => {
    if (cards.length >= MAX_PROJECT_CARDS) {
      setError(`Alcanzaste el máximo de ${MAX_PROJECT_CARDS} cards.`)
      return
    }
    const card = { ...newCard(), order: cards.length }
    setCards(current => [...current, card])
    setError('')
    setNotice('Nueva card sin publicar')
  }

  const removeCard = (id: string) => {
    if (!window.confirm('¿Eliminar esta card del listado?')) return
    setCards(current => current.filter(card => card.id !== id).map((card, order) => ({ ...card, order })))
    setNotice('Eliminación sin publicar')
  }

  const moveCard = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= cards.length) return
    const reordered = [...cards]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setCards(reordered.map((card, order) => ({ ...card, order })))
    setNotice('Orden sin publicar')
  }

  const changeImage = async (card: ProjectCard, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    setNotice('Comprimiendo imagen…')
    try {
      const image = await imageToWebp(file)
      updateCard(card.id, { image })
      setNotice('Imagen optimizada; falta publicar')
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : 'No se pudo procesar la imagen.')
    }
  }

  const publish = async () => {
    if (!isAdmin(user)) return
    if (cards.length > MAX_PROJECT_CARDS) {
      setError(`No se pueden publicar más de ${MAX_PROJECT_CARDS} cards.`)
      return
    }
    if (cards.some(card => !card.title.trim() || !card.type.trim() || !card.image)) {
      setError('Todas las cards necesitan foto, título y tipo destacado.')
      return
    }

    setBusy(true)
    setError('')
    setNotice('Publicando…')
    try {
      const currentSnapshot = await getDocs(collection(db, PROJECT_CARDS_COLLECTION))
      const batch = writeBatch(db)
      currentSnapshot.docs.forEach(existing => batch.delete(existing.ref))
      cards.forEach((card, order) => {
        const { id, ...data } = card
        batch.set(doc(db, PROJECT_CARDS_COLLECTION, id), {
          ...data,
          title: data.title.trim(),
          type: data.type.trim(),
          genre: data.genre.trim(),
          order,
        })
      })
      await batch.commit()
      setLoadedFromFirestore(true)
      setNotice('Cambios publicados')
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'No se pudieron publicar los cambios.')
      setNotice('')
    } finally {
      setBusy(false)
    }
  }

  if (!authReady) return <main className="admin-shell"><div className="admin-login">Verificando acceso…</div></main>

  if (!isAdmin(user)) {
    return (
      <main className="admin-shell">
        <section className="admin-login glass">
          <span className="eyebrow">Rise · Administración</span>
          <h1>Editor de artistas y proyectos.</h1>
          <p>Ingresá con una cuenta de Google autorizada para administrar las cards públicas.</p>
          <button className="btn btn-primary" type="button" onClick={login}>Ingresar con Google</button>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <a className="admin-back" href="/"><FontAwesomeIcon icon={faArrowLeft} /> Volver a Rise</a>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="eyebrow">Rise · Administración</span>
          <h1>Artistas y proyectos</h1>
          <p>{visibleCount} visibles · {cards.length} de {MAX_PROJECT_CARDS} en total · {loadedFromFirestore ? 'conectado con Firestore' : 'contenido inicial'}</p>
        </div>
        <div className="admin-header-actions">
          <a className="btn" href="/" target="_blank" rel="noreferrer">Ver landing</a>
          <button className="btn" type="button" onClick={() => signOut(auth)}>Salir</button>
        </div>
      </header>

      <section className="admin-toolbar">
        <div>
          <strong>{user?.email}</strong>
          {notice && <span className="admin-notice">{notice}</span>}
        </div>
        <div className="admin-header-actions">
          <button className="btn" type="button" onClick={addCard} disabled={cards.length >= MAX_PROJECT_CARDS} title={cards.length >= MAX_PROJECT_CARDS ? `Máximo de ${MAX_PROJECT_CARDS} cards alcanzado` : 'Crear una card'}><FontAwesomeIcon icon={faPlus} /> {cards.length} / {MAX_PROJECT_CARDS} · Nueva card</button>
          <button className="btn btn-primary" type="button" onClick={publish} disabled={busy}><FontAwesomeIcon icon={faSave} /> {busy ? 'Publicando…' : 'Guardar y publicar'}</button>
        </div>
      </section>

      {error && <p className="admin-error admin-wide-error" role="alert">{error}</p>}

      <section className="admin-grid" aria-label="Editor de cards">
        {cards.map((card, index) => (
          <article className="admin-card glass" key={card.id}>
            <div className="admin-preview project">
              {card.image ? <img src={resolveProjectImage(card.image)} alt="" /> : <div className="admin-image-empty">Sin foto</div>}
              <div className="project-shade" />
              <div className="project-info">
                <small>{card.type || 'Tipo de proyecto'}{card.genre ? ` · ${card.genre}` : ''}</small>
                <h3>{card.title || 'Título'}</h3>
              </div>
            </div>

            <div className="admin-fields">
              <label>Foto
                <input ref={element => { fileInputs.current[card.id] = element }} type="file" accept="image/*" onChange={event => changeImage(card, event)} />
              </label>
              <button className="admin-image-button" type="button" onClick={() => fileInputs.current[card.id]?.click()}>Elegir y optimizar imagen</button>
              <label>Título<input value={card.title} maxLength={80} onChange={event => updateCard(card.id, { title: event.target.value })} /></label>
              <label>Tipo destacado<input value={card.type} maxLength={50} placeholder="Artista / banda / Proyecto musical" onChange={event => updateCard(card.id, { type: event.target.value })} /></label>
              <label>Género o motivo<input value={card.genre} maxLength={50} placeholder="Rock, difusión, lanzamiento…" onChange={event => updateCard(card.id, { genre: event.target.value })} /></label>
            </div>

            <div className="admin-card-actions">
              <button type="button" title="Subir" disabled={index === 0} onClick={() => moveCard(index, -1)}><FontAwesomeIcon icon={faArrowUp} /></button>
              <button type="button" title="Bajar" disabled={index === cards.length - 1} onClick={() => moveCard(index, 1)}><FontAwesomeIcon icon={faArrowDown} /></button>
              <button type="button" title={card.visible ? 'Ocultar' : 'Mostrar'} onClick={() => updateCard(card.id, { visible: !card.visible })}><FontAwesomeIcon icon={card.visible ? faEye : faEyeSlash} /></button>
              <button className="danger" type="button" title="Eliminar" onClick={() => removeCard(card.id)}><FontAwesomeIcon icon={faTrash} /></button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
