import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  adminVerify,
  adminListCards,
  adminSetStatus,
  adminDeleteCard,
  adminClearBoard,
  adminChangePassword,
} from '../lib/admin.js'
import { timeAgo } from '../lib/time.js'

const PW_KEY = 'wgi_admin_pw'
const STATUS_ORDER = ['pending', 'approved', 'claimed', 'hidden']
const STATUS_LABEL = {
  pending: 'Pending',
  approved: 'Approved',
  claimed: 'Claimed',
  hidden: 'Hidden',
}

export default function AdminPage() {
  const [pw, setPw] = useState(() => sessionStorage.getItem(PW_KEY) || '')
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  // Re-verify any stored password on mount (survives refresh).
  useEffect(() => {
    let active = true
    async function check() {
      if (!pw) {
        setChecking(false)
        return
      }
      try {
        const ok = await adminVerify(pw)
        if (active) setAuthed(Boolean(ok))
        if (!ok) sessionStorage.removeItem(PW_KEY)
      } catch {
        if (active) setAuthed(false)
      } finally {
        if (active) setChecking(false)
      }
    }
    check()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onLoggedIn(password) {
    sessionStorage.setItem(PW_KEY, password)
    setPw(password)
    setAuthed(true)
  }

  function logout() {
    sessionStorage.removeItem(PW_KEY)
    setPw('')
    setAuthed(false)
  }

  if (checking) {
    return (
      <div className="admin">
        <p className="admin__muted">Checking…</p>
      </div>
    )
  }

  if (!authed) return <AdminLogin onLoggedIn={onLoggedIn} />

  return <AdminConsole pw={pw} onLogout={logout} />
}

// ---------------- Login ----------------

function AdminLogin({ onLoggedIn }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const ok = await adminVerify(value)
      if (ok) onLoggedIn(value)
      else setError('Wrong password.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin admin--center">
      <form className="admin__login" onSubmit={submit}>
        <h1>Admin</h1>
        <p className="admin__muted">Enter the shared password to moderate the board.</p>
        <input
          type="password"
          className="input"
          placeholder="Password"
          value={value}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
        />
        {error && <p className="admin__error">{error}</p>}
        <button className="btn btn--primary btn--full" disabled={busy || !value}>
          {busy ? 'Checking…' : 'Sign in'}
        </button>
        <Link to="/" className="admin__muted admin__backlink">
          ← Back to board
        </Link>
      </form>
    </div>
  )
}

// ---------------- Console ----------------

function AdminConsole({ pw, onLogout }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await adminListCards(pw)
      setCards(data || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [pw])

  // Load now, then poll every 20s to pick up new submissions (pending cards
  // don't stream over realtime, since the public key can't see them).
  useEffect(() => {
    load()
    const id = setInterval(load, 20_000)
    return () => clearInterval(id)
  }, [load])

  async function act(fn) {
    setBusyId(fn.id)
    try {
      await fn.run()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const pendingCount = cards.filter((c) => c.status === 'pending').length

  return (
    <div className="admin">
      <header className="admin__bar">
        <div>
          <h1>Admin</h1>
          <p className="admin__muted">
            {pendingCount > 0
              ? `${pendingCount} card${pendingCount === 1 ? '' : 's'} awaiting approval`
              : 'Queue clear'}
          </p>
        </div>
        <div className="admin__baractions">
          <button className="btn" onClick={load}>
            Refresh
          </button>
          <Link to="/" className="btn btn--ghost">
            Board
          </Link>
          <button className="btn btn--ghost" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      {error && <p className="admin__error">{error}</p>}
      {loading ? (
        <p className="admin__muted">Loading…</p>
      ) : (
        STATUS_ORDER.map((status) => {
          const group = cards.filter((c) => c.status === status)
          if (group.length === 0) return null
          return (
            <section key={status} className="admin__group">
              <h2 className="admin__grouptitle">
                {STATUS_LABEL[status]}
                <span className="admin__count">{group.length}</span>
              </h2>
              <div className="admin__list">
                {group.map((card) => (
                  <AdminRow
                    key={card.id}
                    card={card}
                    pw={pw}
                    busy={busyId === card.id}
                    act={act}
                  />
                ))}
              </div>
            </section>
          )
        })
      )}

      <DangerZone pw={pw} onChanged={load} />
    </div>
  )
}

function AdminRow({ card, pw, busy, act }) {
  const setStatus = (status) => ({
    id: card.id,
    run: () => adminSetStatus(pw, card.id, status),
  })
  const del = {
    id: card.id,
    run: () => adminDeleteCard(pw, card.id),
  }

  return (
    <div className={'admin__row' + (busy ? ' is-busy' : '')}>
      <div className="admin__rowmain">
        <div className="admin__rowtop">
          <span className={`admin__type admin__type--${card.type}`}>
            {card.type === 'wanted' ? 'Wanted' : 'Got it'}
          </span>
          <strong className="admin__rowtitle">{card.title}</strong>
          {card.is_paid && <span className="admin__flag">paid</span>}
          {card.deadline && <span className="admin__flag">due {card.deadline}</span>}
          <span className="admin__rowtime">{timeAgo(hoursSince(card.created_at))}</span>
        </div>
        <p className="admin__rowdesc">{card.description}</p>
        <div className="admin__rowmeta">
          <span>
            {card.author_name}
            {card.author_major ? ` · ${card.author_major}` : ''}
            {card.author_year ? ` ${card.author_year}` : ''}
          </span>
          {card.tags?.length > 0 && (
            <span className="admin__rowtags">{card.tags.join(', ')}</span>
          )}
        </div>
      </div>

      <div className="admin__rowactions">
        {card.status !== 'approved' && (
          <button className="btn btn--ok" disabled={busy} onClick={() => act(setStatus('approved'))}>
            Approve
          </button>
        )}
        {card.status === 'approved' && (
          <button className="btn" disabled={busy} onClick={() => act(setStatus('claimed'))}>
            Mark claimed
          </button>
        )}
        {card.status !== 'hidden' && (
          <button className="btn" disabled={busy} onClick={() => act(setStatus('hidden'))}>
            Hide
          </button>
        )}
        <button className="btn btn--danger" disabled={busy} onClick={() => act(del)}>
          Delete
        </button>
      </div>
    </div>
  )
}

function DangerZone({ pw, onChanged }) {
  const [open, setOpen] = useState(false)
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [msg, setMsg] = useState('')
  const [confirmClear, setConfirmClear] = useState('')

  async function changePw(e) {
    e.preventDefault()
    setMsg('')
    try {
      await adminChangePassword(pw, newPw)
      setMsg('Password changed. Use the new one next time you sign in.')
      setOldPw('')
      setNewPw('')
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function clearBoard() {
    if (confirmClear !== 'CLEAR') {
      setMsg('Type CLEAR to confirm.')
      return
    }
    try {
      await adminClearBoard(pw)
      setConfirmClear('')
      setMsg('Board cleared.')
      onChanged()
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <section className="admin__danger">
      <button className="admin__dangertoggle" onClick={() => setOpen((o) => !o)}>
        {open ? '▾' : '▸'} Settings
      </button>
      {open && (
        <div className="admin__dangerbody">
          <form className="admin__pwform" onSubmit={changePw}>
            <h3>Change password</h3>
            <input
              type="password"
              className="input"
              placeholder="New password (min 6 chars)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
            <button className="btn" disabled={newPw.length < 6}>
              Update password
            </button>
          </form>

          <div className="admin__clear">
            <h3>Clear the board</h3>
            <p className="admin__muted">
              Permanently deletes every card. Type <code>CLEAR</code> to confirm.
            </p>
            <div className="admin__clearrow">
              <input
                className="input"
                placeholder="CLEAR"
                value={confirmClear}
                onChange={(e) => setConfirmClear(e.target.value)}
              />
              <button className="btn btn--danger" onClick={clearBoard}>
                Clear board
              </button>
            </div>
          </div>

          {msg && <p className="admin__msg">{msg}</p>}
        </div>
      )}
    </section>
  )
}

function hoursSince(ts) {
  return ts ? (Date.now() - new Date(ts).getTime()) / 3_600_000 : null
}
