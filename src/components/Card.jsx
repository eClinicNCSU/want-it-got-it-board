import { Link } from 'react-router-dom'
import Avatar from './Avatar.jsx'
import QrCode from './QrCode.jsx'
import { bucketForTag } from '../lib/buckets.js'
import { timeAgo } from '../lib/time.js'

const BADGE_LABELS = {
  new: 'New',
  deadline: 'Deadline',
  paid: 'Paid',
  claimed: 'Claimed',
}

export default function Card({ card, side }) {
  const claimed = card.status === 'claimed'
  const badge = card.badge

  // Absolute URL so the QR resolves wherever the board is deployed. Tapping the
  // card (on the iPad) and scanning the QR (from a phone) both open the reveal.
  const revealUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/c/${card.id}`
      : `/c/${card.id}`

  return (
    <Link
      to={`/c/${card.id}`}
      className={`card card--${side}` + (claimed ? ' card--claimed' : '')}
    >
      <div className="card__top">
        <h3 className="card__title">{card.title}</h3>
        {badge && (
          <span className={`badge badge--${badge}`}>
            <span className="badge__dot" />
            {BADGE_LABELS[badge] || badge}
          </span>
        )}
      </div>

      <p className="card__desc">{card.description}</p>

      {card.tags?.length > 0 && (
        <div className="card__tags">
          {card.tags.map((t) => (
            <span key={t} className={`tag tag--${bucketForTag(t)}`}>
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="card__footer">
        <Avatar name={card.author_name} />
        <div className="card__author">
          <span className="card__name">{card.author_name}</span>
          <span className="card__affil">
            {[card.author_major, card.author_year].filter(Boolean).join(' ')}
          </span>
        </div>
        <span className="card__time">{timeAgo(card.hoursAgo)}</span>
        <span className="card__qr" title="Scan for contact">
          <QrCode value={revealUrl} size={52} />
        </span>
      </div>
    </Link>
  )
}
