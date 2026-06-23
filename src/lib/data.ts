'use client'

import { supabase } from './supabase'
import { Comic, WishlistItem, Goal, Evento, Collection } from '@/types'

// ─── Comics ──────────────────────────────────────────────────────
export async function getComics(): Promise<Comic[]> {
  const { data } = await supabase.from('comics').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Comic[]
}

export async function getComicsForUser(user: 'marcelo' | 'walter'): Promise<Comic[]> {
  const { data } = await supabase
    .from('comics').select('*')
    .in('owner', [user, 'ambos'])
    .order('created_at', { ascending: false })
  return (data ?? []) as Comic[]
}

export async function addComic(comic: Omit<Comic, 'id' | 'created_at'>): Promise<Comic> {
  const { data, error } = await supabase.from('comics').insert(comic).select().single()
  if (error) throw error
  return data as Comic
}

export async function updateComic(id: string, updates: Partial<Comic>): Promise<void> {
  const { error } = await supabase.from('comics').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteComic(id: string): Promise<void> {
  const { error } = await supabase.from('comics').delete().eq('id', id)
  if (error) throw error
}

// ─── Wishlist ─────────────────────────────────────────────────────
export async function getWishlist(): Promise<WishlistItem[]> {
  const { data } = await supabase.from('wishlist_items').select('*').order('created_at', { ascending: false })
  return (data ?? []) as WishlistItem[]
}

export async function addWishlistItem(item: Omit<WishlistItem, 'id' | 'created_at'>): Promise<WishlistItem> {
  const { data, error } = await supabase.from('wishlist_items').insert(item).select().single()
  if (error) throw error
  return data as WishlistItem
}

export async function deleteWishlistItem(id: string): Promise<void> {
  const { error } = await supabase.from('wishlist_items').delete().eq('id', id)
  if (error) throw error
}

export async function acquireWishlistItem(id: string): Promise<void> {
  const { data: item } = await supabase.from('wishlist_items').select('*').eq('id', id).single()
  if (!item) return
  await addComic({
    title: item.title, series: item.series,
    issue_number: item.issue_number, volume: item.volume,
    publisher: item.publisher, year: null, condition: null,
    purchase_price: item.estimated_price, current_value: item.estimated_price,
    owner: item.owner, cover_url: null, notes: item.notes, read: false, omnibus: false, language: 'pt',
  })
  await deleteWishlistItem(id)
}

// ─── Goals ───────────────────────────────────────────────────────
export async function getGoals(): Promise<Goal[]> {
  const { data } = await supabase.from('goals').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Goal[]
}

export async function addGoal(goal: Omit<Goal, 'id' | 'created_at'>): Promise<Goal> {
  const { data, error } = await supabase.from('goals').insert(goal).select().single()
  if (error) throw error
  return data as Goal
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
  const { error } = await supabase.from('goals').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) throw error
}

// ─── Eventos ─────────────────────────────────────────────────────
export async function getEventos(): Promise<Evento[]> {
  const { data } = await supabase.from('eventos').select('*').order('data', { ascending: true })
  return (data ?? []) as Evento[]
}

export async function addEvento(evento: Omit<Evento, 'id'>): Promise<Evento> {
  const { data, error } = await supabase.from('eventos').insert(evento).select().single()
  if (error) throw error
  return data as Evento
}

export async function deleteEvento(id: string): Promise<void> {
  const { error } = await supabase.from('eventos').delete().eq('id', id)
  if (error) throw error
}

// ─── Collections ─────────────────────────────────────────────────
export async function getCollections(): Promise<Collection[]> {
  const { data } = await supabase.from('collections').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Collection[]
}

export async function addCollection(col: Omit<Collection, 'id' | 'created_at'>): Promise<Collection> {
  const { data, error } = await supabase.from('collections').insert(col).select().single()
  if (error) throw error
  return data as Collection
}

export async function updateCollection(id: string, updates: Partial<Collection>): Promise<void> {
  const { error } = await supabase.from('collections').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteCollection(id: string): Promise<void> {
  const { error } = await supabase.from('collections').delete().eq('id', id)
  if (error) throw error
}

// ─── App settings (chave/valor) ──────────────────────────────────
export async function getSetting(key: string): Promise<string | null> {
  const { data } = await supabase.from('app_settings').select('value').eq('key', key).maybeSingle()
  return data?.value ?? null
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw error
}

// ─── Banner (por usuário) ────────────────────────────────────────
type User = 'marcelo' | 'walter'
const bannerKey = (user: User) => `banner_url_${user}`

export async function getBannerUrl(user: User): Promise<string | null> {
  return getSetting(bannerKey(user))
}

export async function uploadBanner(user: User, file: File): Promise<string> {
  const ext  = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `banner-${user}-${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('assets')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  const { data } = supabase.storage.from('assets').getPublicUrl(path)
  await setSetting(bannerKey(user), data.publicUrl)
  return data.publicUrl
}
