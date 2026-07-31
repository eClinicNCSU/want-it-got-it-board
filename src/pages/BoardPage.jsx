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

  const isClaimedView = bucket === 'claimed'

  // "Claimed" is a Want-it concept (a request that got filled), so the Claimed
  // view is a single column of claimed Want-it cards.
  const claimedWanted = useMemo(
    () => cards.filter((c) => c.status === 'claimed' && c.type === 'wanted'),
    [cards],
  )
  const claimedCount = claimedWanted.length

  // Every non-Claimed filter shows the active board (claimed cards hidden)
  // matching the selected tag bucket. Paused/pending/hidden never appear here.
  const visible = useMemo(
    () =>
      cards.filter((c) => c.status === 'approved' && cardInBucket(c, bucket)),
    [cards, bucket],
  )

  const wanted = visible.filter((c) => c.type === 'wanted')
  const gotIt = visible.filter((c) => c.type === 'got_it')

  // Header counts reflect the whole active (approved) board, independent of the
  // current filter.
  const totalWanted = useMemo(
    () => cards.filter((c) => c.status === 'approved' && c.type === 'wanted').length,
    [cards],
  )
  const totalGotIt = useMemo(
    () => cards.filter((c) => c.status === 'approved' && c.type === 'got_it').length,
    [cards],
  )

  return (
    <div className="app">
      <Header now={now} wantedCount={totalWanted} gotItCount={totalGotIt} />
      <FilterBar active={bucket} onChange={setBucket} claimedCount={claimedCount} />
      <main className={'board' + (isClaimedView ? ' board--single' : '')}>
        {isClaimedView ? (
          <Column
            side="wanted"
            title="Claimed"
            subtitle="requests that got filled"
            cards={claimedWanted}
          />
        ) : (
          <>
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
          </>
        )}
      </main>
      <SubmitQr />
    </div>
  )
}
