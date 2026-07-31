import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header.jsx'
import FilterBar from '../components/FilterBar.jsx'
import Column from '../components/Column.jsx'
import SubmitQr from '../components/SubmitQr.jsx'
import { cardInBucket } from '../lib/buckets.js'
import { useCards } from '../lib/useCards.js'

export default function BoardPage() {
  const [bucket, setBucket] = useState('all')

  // Live clock for the header (updates every 30s).
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  // Live cards from Supabase (approved + claimed, realtime). Falls back to the
  // mockup sample data until Supabase env vars are configured.
  const { cards } = useCards()

  const claimedCount = useMemo(
    () => cards.filter((c) => c.status === 'claimed').length,
    [cards],
  )

  // The "Claimed" filter shows only claimed cards; every other filter shows the
  // active board (claimed cards hidden) matching the selected tag bucket.
  const visible = useMemo(() => {
    if (bucket === 'claimed') return cards.filter((c) => c.status === 'claimed')
    return cards.filter(
      (c) => c.status !== 'claimed' && cardInBucket(c, bucket),
    )
  }, [cards, bucket])

  const wanted = visible.filter((c) => c.type === 'wanted')
  const gotIt = visible.filter((c) => c.type === 'got_it')

  // Header counts reflect the active (non-claimed) board.
  const activeCards = cards.filter((c) => c.status !== 'claimed')
  const totalWanted = activeCards.filter((c) => c.type === 'wanted').length
  const totalGotIt = activeCards.filter((c) => c.type === 'got_it').length

  return (
    <div className="app">
      <Header now={now} wantedCount={totalWanted} gotItCount={totalGotIt} />
      <FilterBar active={bucket} onChange={setBucket} claimedCount={claimedCount} />
      <main className="board">
        <Column
          side="wanted"
          title="Want it"
          subtitle="what people are looking for"
          cards={wanted}
        />
        <Column
          side="got_it"
          title="Got it"
          subtitle="what people can do"
          cards={gotIt}
        />
      </main>
      <SubmitQr />
    </div>
  )
}
