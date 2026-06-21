'use client'

import { Comic, WishlistItem, Goal, Evento } from '@/types'
import { mockComics, mockWishlist, mockGoals, mockEventos } from './mock-data'

const STORAGE_KEYS = {
  comics: 'revistinhas_comics',
  wishlist: 'revistinhas_wishlist',
  goals: 'revistinhas_goals',
  eventos: 'revistinhas_eventos',
}

function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T[]
  } catch {
    return fallback
  }
}

function save<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export function getComics(): Comic[] {
  return load<Comic>(STORAGE_KEYS.comics, mockComics)
}

export function saveComics(comics: Comic[]): void {
  save(STORAGE_KEYS.comics, comics)
}

export function addComic(comic: Omit<Comic, 'id' | 'created_at'>): Comic {
  const comics = getComics()
  const newComic: Comic = {
    ...comic,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  saveComics([...comics, newComic])
  return newComic
}

export function updateComic(id: string, data: Partial<Comic>): void {
  const comics = getComics()
  const updated = comics.map((c) => (c.id === id ? { ...c, ...data } : c))
  saveComics(updated)
}

export function deleteComic(id: string): void {
  const comics = getComics()
  saveComics(comics.filter((c) => c.id !== id))
}

export function getWishlist(): WishlistItem[] {
  return load<WishlistItem>(STORAGE_KEYS.wishlist, mockWishlist)
}

export function saveWishlist(wishlist: WishlistItem[]): void {
  save(STORAGE_KEYS.wishlist, wishlist)
}

export function addWishlistItem(
  item: Omit<WishlistItem, 'id' | 'created_at'>
): WishlistItem {
  const wishlist = getWishlist()
  const newItem: WishlistItem = {
    ...item,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  saveWishlist([...wishlist, newItem])
  return newItem
}

export function deleteWishlistItem(id: string): void {
  const wishlist = getWishlist()
  saveWishlist(wishlist.filter((w) => w.id !== id))
}

export function acquireWishlistItem(id: string): void {
  const wishlist = getWishlist()
  const item = wishlist.find((w) => w.id === id)
  if (!item) return

  addComic({
    title: item.title,
    series: item.series,
    issue_number: item.issue_number,
    volume: item.volume,
    publisher: item.publisher,
    year: null,
    condition: null,
    purchase_price: item.estimated_price,
    current_value: item.estimated_price,
    owner: item.owner,
    cover_url: null,
    notes: item.notes,
    read: false,
    language: 'pt',
  })

  deleteWishlistItem(id)
}

export function getGoals(): Goal[] {
  return load<Goal>(STORAGE_KEYS.goals, mockGoals)
}

export function saveGoals(goals: Goal[]): void {
  save(STORAGE_KEYS.goals, goals)
}

export function addGoal(goal: Omit<Goal, 'id' | 'created_at'>): Goal {
  const goals = getGoals()
  const newGoal: Goal = {
    ...goal,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  saveGoals([...goals, newGoal])
  return newGoal
}

export function updateGoal(id: string, data: Partial<Goal>): void {
  const goals = getGoals()
  const updated = goals.map((g) => (g.id === id ? { ...g, ...data } : g))
  saveGoals(updated)
}

export function deleteGoal(id: string): void {
  const goals = getGoals()
  saveGoals(goals.filter((g) => g.id !== id))
}

export function getEventos(): Evento[] {
  return load<Evento>(STORAGE_KEYS.eventos, mockEventos)
}

export function saveEventos(eventos: Evento[]): void {
  save(STORAGE_KEYS.eventos, eventos)
}

export function addEvento(evento: Omit<Evento, 'id'>): Evento {
  const eventos = getEventos()
  const newEvento: Evento = { ...evento, id: crypto.randomUUID() }
  saveEventos([...eventos, newEvento])
  return newEvento
}

export function deleteEvento(id: string): void {
  saveEventos(getEventos().filter((e) => e.id !== id))
}
