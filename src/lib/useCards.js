import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'
import { dbRowToCard } from './mapCard.js'
import { SAMPLE_CARDS } from './sampleData.js'

// Returns { cards, source } where source is 'sample' | 'live'.
// Falls back to the mockup sample data until Supabase env vars are set.
export function useCards() {
  const [cards, setCards] = useState(() =>
    isSupabaseConfigured ? [] : SAMPLE_CARDS,
  )

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let active = true

    async function load() {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false })
      if (!active) return
      if (error) {
        console.error('[cards] load failed:', error.message)
        return
      }
      setCards(data.map(dbRowToCard))
    }

    load()

    // Any insert/update/delete on cards -> refetch. At ~20 live cards this is
    // trivially cheap and keeps the board perfectly in sync (e.g. when an
    // admin approves a pending card, it appears here instantly).
    const channel = supabase
      .channel('cards-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards' },
        load,
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  return { cards, source: isSupabaseConfigured ? 'live' : 'sample' }
}
