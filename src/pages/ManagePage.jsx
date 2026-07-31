import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { manageGet, manageSetStatus, manageDeleteCard } from '../lib/api.js'

const STATUS_COPY = {
  pending: {
    label: 'Waiting for approval',
    note: 'A garage admin needs to approve this before it shows on the board.',
  },
  approved: { label: 'Live on the board', note: '' },
  claimed: { label: 'Claimed', note: 'It shows on the board dimmed.' },
  hidden: {
    label: 'Hidden',
    note: 'An admin has hidden this card, so it isn’t on the board.',
  },
}

export default function ManagePage() {
  const { token } = useParams()
  const [card, setCard] = useState(undefined) // undefined=loading, null=not found
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [deleted, setDeleted] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await manageGet(token)
      setCard(data || null)
      setError('')
    } catch (err) {
      setError(err.message)
      setCard(null)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  async function setStatus(status) {
    setBusy(true)
    setError('')
    try {
      await manageSetStatus(token, status)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function takeDown() {
    setBusy(true)
    setError('')
    try {
      await manageDeleteCard(token)
      setDeleted(true)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="submit">
      <div className="submit__card sheet">
        {deleted ? (
          <>
            <h1 className="sheet__title">Taken down</h1>
            <p className="sheet__desc">Your card has been removed from the board.</p>
          </>
        ) : card === undefined ? (
          <p className="admin__muted">Loading…</p>
        ) : card === null ? (
          <>
            <h1 className="sheet__title">Card not found</h1>
            <p className="sheet__desc">
              This manage link doesn’t match a card. Check that you used the full
              link from when you posted.
            </p>
          </>
        ) : (
          <>
            <div className="sheet__statusline">
              <span className={`badge badge--${statusBadge(card.status)}`}>
                <span className="badge__dot" />
                {STATUS_COPY[card.status]?.label || card.status}
              </span>
            </div>

            <span className={`sheet__type sheet__type--${card.type}`}>
              {card.type === 'wanted' ? 'Wanted' : 'Got it'}
            </span>
            <h1 className="sheet__title">{card.title}</h1>
            <p className="sheet__desc">{card.description}</p>
            {STATUS_COPY[card.status]?.note && (
              <p className="admin__muted">{STATUS_COPY[card.status].note}</p>
            )}

            {error && <p className="admin__error">{error}</p>}

            <div className="sheet__actions">
              {card.status === 'approved' && (
                <button className="btn btn--primary" disabled={busy} onClick={() => setStatus('claimed')}>
                  Mark as claimed
                </button>
              )}
              {card.status === 'claimed' && (
                <button className="btn btn--ok" disabled={busy} onClick={() => setStatus('approved')}>
                  Reopen
                </button>
              )}

              {!confirmDelete ? (
                <button className="btn btn--danger" disabled={busy} onClick={() => setConfirmDelete(true)}>
                  Take it down
                </button>
              ) : (
                <div className="sheet__confirm">
                  <span>Remove this card for good?</span>
                  <div className="sheet__confirmrow">
                    <button className="btn btn--danger" disabled={busy} onClick={takeDown}>
                      Yes, remove it
                    </button>
                    <button className="btn btn--ghost" disabled={busy} onClick={() => setConfirmDelete(false)}>
                      Keep it
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <Link to="/" className="submit__back sheet__back">
          ← Board
        </Link>
      </div>
    </div>
  )
}

function statusBadge(status) {
  if (status === 'claimed') return 'claimed'
  if (status === 'approved') return 'new'
  if (status === 'hidden') return 'deadline'
  return 'paid' // pending
}
