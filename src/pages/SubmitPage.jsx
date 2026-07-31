import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TAG_OPTIONS } from '../lib/buckets.js'
import { submitCard } from '../lib/api.js'

const TITLE_MAX = 80
const DESC_MAX = 400

const EMPTY = {
  type: '',
  title: '',
  description: '',
  tags: [],
  author_name: '',
  author_major: '',
  author_year: '',
  is_paid: false,
  deadline: '',
  contact: '',
}

export default function SubmitPage() {
  const [form, setForm] = useState(EMPTY)
  const [customTag, setCustomTag] = useState('')
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [manageToken, setManageToken] = useState(null)
  const [copied, setCopied] = useState(false)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleTag(tag) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }))
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase()
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }))
    }
    setCustomTag('')
  }

  function validate() {
    const e = []
    if (!form.type) e.push('Pick Wanted or Got It.')
    if (!form.title.trim()) e.push('Add a title.')
    if (!form.description.trim()) e.push('Add a description.')
    if (form.tags.length === 0) e.push('Pick at least one tag.')
    if (!form.author_name.trim()) e.push('Add your name.')
    if (!form.contact.trim()) e.push('Add a way to reach you.')
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (e.length > 0) return

    setSubmitting(true)
    try {
      const token = await submitCard(form)
      setManageToken(token)
    } catch (err) {
      setErrors([err.message])
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Success screen ----
  if (manageToken) {
    const manageUrl = `${window.location.origin}/m/${manageToken}`
    return (
      <div className="submit">
        <div className="submit__card submit__done">
          <div className="submit__check">✓</div>
          <h1>You're in!</h1>
          <p className="submit__lead">
            Your card is waiting for approval. Once a garage admin approves it,
            it'll show up on the board.
          </p>
          <div className="submit__managebox">
            <p className="submit__managelabel">
              Save this private link to mark your card claimed or edit it later —
              it's the only way back to it:
            </p>
            <div className="submit__managerow">
              <code className="submit__manageurl">{manageUrl}</code>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  navigator.clipboard?.writeText(manageUrl)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                }}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setForm(EMPTY)
              setManageToken(null)
              setErrors([])
            }}
          >
            Post another card
          </button>
        </div>
      </div>
    )
  }

  // ---- Form ----
  return (
    <div className="submit">
      <form className="submit__card" onSubmit={handleSubmit} noValidate>
        <div className="submit__top">
          <h1>Post a card</h1>
          <Link to="/" className="submit__back">
            ← Board
          </Link>
        </div>

        {/* Type */}
        <div className="field">
          <label className="field__label">I'm posting a…</label>
          <div className="typetoggle">
            <button
              type="button"
              className={
                'typetoggle__btn typetoggle__btn--wanted' +
                (form.type === 'wanted' ? ' is-on' : '')
              }
              onClick={() => set('type', 'wanted')}
            >
              <strong>Want it</strong>
              <span>something I'm looking for</span>
            </button>
            <button
              type="button"
              className={
                'typetoggle__btn typetoggle__btn--gotit' +
                (form.type === 'got_it' ? ' is-on' : '')
              }
              onClick={() => set('type', 'got_it')}
            >
              <strong>Got it</strong>
              <span>something I can do</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="field">
          <label className="field__label" htmlFor="title">
            Title
            <span className="field__count">
              {form.title.length}/{TITLE_MAX}
            </span>
          </label>
          <input
            id="title"
            className="input"
            maxLength={TITLE_MAX}
            placeholder="Front-end developer"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="field">
          <label className="field__label" htmlFor="desc">
            Description
            <span className="field__count">
              {form.description.length}/{DESC_MAX}
            </span>
          </label>
          <textarea
            id="desc"
            className="input input--area"
            maxLength={DESC_MAX}
            rows={3}
            placeholder="A sentence or two. What exactly do you need, or what can you do?"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        {/* Tags */}
        <div className="field">
          <label className="field__label">Tags</label>
          {TAG_OPTIONS.map((group) => (
            <div key={group.bucket} className="tagpick">
              <span className="tagpick__group">{group.label}</span>
              <div className="tagpick__chips">
                {group.tags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    className={
                      `tag tag--${group.bucket} tagpick__chip` +
                      (form.tags.includes(tag) ? ' is-on' : '')
                    }
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Custom tags */}
          <div className="tagpick__customrow">
            <input
              className="input"
              placeholder="Other… (add your own)"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomTag()
                }
              }}
            />
            <button type="button" className="btn btn--ghost" onClick={addCustomTag}>
              Add
            </button>
          </div>
          {form.tags.filter((t) => !isKnown(t)).length > 0 && (
            <div className="tagpick__chips">
              {form.tags
                .filter((t) => !isKnown(t))
                .map((t) => (
                  <button
                    type="button"
                    key={t}
                    className="tag tag--else tagpick__chip is-on"
                    onClick={() => toggleTag(t)}
                    title="Click to remove"
                  >
                    {t} ✕
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Your info */}
        <div className="field">
          <label className="field__label">About you</label>
          <div className="field__row">
            <input
              className="input"
              placeholder="Name"
              maxLength={60}
              value={form.author_name}
              onChange={(e) => set('author_name', e.target.value)}
            />
          </div>
          <div className="field__row field__row--split">
            <input
              className="input"
              placeholder="Major (optional)"
              value={form.author_major}
              onChange={(e) => set('author_major', e.target.value)}
            />
            <input
              className="input input--small"
              placeholder="Year (e.g. '27)"
              value={form.author_year}
              onChange={(e) => set('author_year', e.target.value)}
            />
          </div>
        </div>

        {/* Options */}
        <div className="field">
          <label className="field__label">Options</label>
          <label className="check">
            <input
              type="checkbox"
              checked={form.is_paid}
              onChange={(e) => set('is_paid', e.target.checked)}
            />
            <span>This is paid</span>
          </label>
          <div className="field__row">
            <label className="field__sublabel" htmlFor="deadline">
              Deadline (optional)
            </label>
            <input
              id="deadline"
              type="date"
              className="input"
              value={form.deadline}
              onChange={(e) => set('deadline', e.target.value)}
            />
          </div>
        </div>

        {/* Contact */}
        <div className="field">
          <label className="field__label" htmlFor="contact">
            How can people reach you?
          </label>
          <input
            id="contact"
            className="input"
            placeholder="email, phone, LinkedIn, @insta…"
            value={form.contact}
            onChange={(e) => set('contact', e.target.value)}
          />
          <p className="field__hint">
            🔒 Private. Never shown on the TV — only revealed when someone scans
            your card.
          </p>
        </div>

        {errors.length > 0 && (
          <ul className="submit__errors">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}

        <button className="btn btn--primary btn--full" disabled={submitting}>
          {submitting ? 'Posting…' : 'Post to the board'}
        </button>
      </form>
    </div>
  )
}

// A tag is "known" if it appears in any picker group (so custom tags render
// separately as removable chips).
function isKnown(tag) {
  return TAG_OPTIONS.some((g) => g.tags.includes(tag))
}
