import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import FilterBar from './components/FilterBar.jsx'
import Column from './components/Column.jsx'
import { cardInBucket } from './lib/buckets.js'
import { useCards } from './lib/useCards.js'

export default function App() {
  const [bucket, setBucket] = useState('all')

  // Live clock for the header (updates every 30s).
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  // Live cards from Supabase (approved only, realtime). Falls back to the
  // mockup sample data until Supabase env vars are configured.
  const { cards } = useCards()

  const visible = useMemo(
    () => cards.filter((c) => cardInBucket(c, bucket)),
    [cards, bucket],
  )

  const wanted = visible.filter((c) => c.type === 'wanted')
  const gotIt = visible.filter((c) => c.type === 'got_it')

  // Header counts reflect all approved cards, not the current filter.
  const totalWanted = cards.filter((c) => c.type === 'wanted').length
  const totalGotIt = cards.filter((c) => c.type === 'got_it').length

  return (
    <div className="app">
      <Header
        now={now}
        wantedCount={totalWanted}
        gotItCount={totalGotIt}
      />
      <FilterBar active={bucket} onChange={setBucket} />
      <main className="board">
        <Column
          side="wanted"
          title="Wanted"
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
    </div>
  )
}
