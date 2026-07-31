import { BUCKETS } from '../lib/buckets.js'

export default function FilterBar({ active, onChange, claimedCount = 0 }) {
  return (
    <nav className="filterbar" aria-label="Filter cards by category">
      <span className="filterbar__label">Filter</span>
      {BUCKETS.map((b) => (
        <button
          key={b.id}
          type="button"
          className={
            'chip filterbar__chip' + (active === b.id ? ' chip--active' : '')
          }
          aria-pressed={active === b.id}
          onClick={() => onChange(b.id)}
        >
          {b.label}
        </button>
      ))}

      {/* Claimed is a status, not a tag bucket — set it apart. */}
      <span className="filterbar__divider" aria-hidden="true" />
      <button
        type="button"
        className={
          'chip filterbar__chip filterbar__chip--claimed' +
          (active === 'claimed' ? ' chip--active' : '')
        }
        aria-pressed={active === 'claimed'}
        onClick={() => onChange('claimed')}
      >
        Claimed{claimedCount > 0 ? ` · ${claimedCount}` : ''}
      </button>
    </nav>
  )
}
