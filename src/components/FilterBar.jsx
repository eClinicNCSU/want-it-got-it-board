import { BUCKETS } from '../lib/buckets.js'

export default function FilterBar({ active, onChange }) {
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
    </nav>
  )
}
