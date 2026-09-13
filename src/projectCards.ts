import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from './firebase'
import todosSomosNadie from '../img/TodosSnadie.png'
import marrus from '../img/Marrus.png'
import elAsunto from '../img/elasunto.png'
import risasRock from '../img/risasRock.png'
import antonioGilRock from '../img/antoniogilRock.jpg'

export type ProjectCard = {
  id: string
  title: string
  type: string
  genre: string
  image: string
  order: number
  visible: boolean
}

export const PROJECT_CARDS_COLLECTION = 'projectCards'
export const MAX_PROJECT_CARDS = 15

const bundledImages: Record<string, string> = {
  'asset:todos-somos-nadie': todosSomosNadie,
  'asset:marrus': marrus,
  'asset:el-asunto': elAsunto,
  'asset:risas-rock': risasRock,
  'asset:antonio-gil-rock': antonioGilRock,
}

export const defaultProjectCards: ProjectCard[] = [
  { id: 'todos-somos-nadie', title: 'Todos Somos Nadie', type: 'Artista / banda', genre: 'Rock', image: 'asset:todos-somos-nadie', order: 0, visible: true },
  { id: 'marrus', title: 'Marrus', type: 'Artista / banda', genre: 'Rock', image: 'asset:marrus', order: 1, visible: true },
  { id: 'el-asunto', title: 'El Asunto', type: 'Artista / banda', genre: 'Rock', image: 'asset:el-asunto', order: 2, visible: true },
  { id: 'risas-rock', title: 'Risas Rock', type: 'Proyecto musical', genre: 'Rock', image: 'asset:risas-rock', order: 3, visible: true },
  { id: 'antonio-gil-rock', title: 'Antonio Gil Rock', type: 'Artista / banda', genre: 'Rock', image: 'asset:antonio-gil-rock', order: 4, visible: true },
]

export const resolveProjectImage = (image: string) => bundledImages[image] ?? image

const isProjectCard = (value: unknown): value is ProjectCard => {
  if (!value || typeof value !== 'object') return false
  const card = value as Partial<ProjectCard>
  return typeof card.title === 'string'
    && typeof card.type === 'string'
    && typeof card.genre === 'string'
    && typeof card.image === 'string'
    && typeof card.order === 'number'
    && typeof card.visible === 'boolean'
}

export function subscribeToProjectCards(
  onCards: (cards: ProjectCard[], fromFirestore: boolean) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const cardsQuery = query(collection(db, PROJECT_CARDS_COLLECTION), orderBy('order', 'asc'))

  return onSnapshot(cardsQuery, snapshot => {
    const cards = snapshot.docs
      .map(document => ({ id: document.id, ...document.data() }))
      .filter(isProjectCard)
    onCards(cards.length ? cards : defaultProjectCards, cards.length > 0)
  }, error => {
    onCards(defaultProjectCards, false)
    onError?.(error)
  })
}
