import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchCard, revealContact } from '../lib/api.js'
import { contactLink } from '../lib/contact.js'

export default function RevealPage() {
  const { id } = useParams()
  const [state, setState] = useState({ loading: true })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [card, contact] = await Promise.all([
          fetchCard(id),
          revealContact(id),
        ])
        if (active) setState({ loading: false, card, contact })
      } catch (err) {
        if (active) setState({ loading: false, error: err.message })
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  const { loading, card, contact, error } = state

  return (
    <div className="submit">
      <div className="submit__card sheet">
        {loading ? (
          <p className="admin__muted">Loading…</p>
        ) : error ? (
          <Unavailable message={error} />
        ) : !card ? (
          <Unavailable message="This card isn't available — it may have expired or been removed." />
        ) : (
          <>
            <span className={`sheet__type sheet__type--${card.type}`}>
              {card.type === 'wanted' ? 'Wanted' : 'Got it'}
            </span>
            <h1 className="sheet__title">{card.title}</h1>
            <p className="sheet__desc">{card.description}</p>
            <p className="sheet__author">
              {card.author_name}
              {card.author_major ? ` · ${card.author_major}` : ''}
              {card.author_year ? ` ${card.author_year}` : ''}
            </p>

            {contact ? (
              <div className="sheet__contactbox">
                <span className="sheet__contactlabel">Reach out to them</span>
                <ContactValue contact={contact} />
                <div className="sheet__contactactions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      navigator.clipboard?.writeText(contact)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="sheet__contactbox sheet__contactbox--muted">
                {card.status === 'claimed'
                  ? "This one's been claimed — contact is no longer shown."
                  : 'Contact for this card isn’t available.'}
              </div>
            )}
          </>
        )}
        <Link to="/" className="submit__back sheet__back">
          ← Board
        </Link>
      </div>
    </div>
  )
}

function ContactValue({ contact }) {
  const link = contactLink(contact)
  if (link) {
    return (
      <a className="sheet__contact" href={link.href}>
        {contact}
      </a>
    )
  }
  return <span className="sheet__contact">{contact}</span>
}

function Unavailable({ message }) {
  return (
    <>
      <h1 className="sheet__title">Not available</h1>
      <p className="sheet__desc">{message}</p>
    </>
  )
}
