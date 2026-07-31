function formatClock(date) {
  let h = date.getHours()
  const m = date.getMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return { time: `${h}:${m}`, ampm }
}

export default function Header({ now, wantedCount, gotItCount }) {
  const { time, ampm } = formatClock(now)
  return (
    <header className="header">
      <div className="header__title">
        <h1>Wanted &amp; Got It</h1>
        <p>NC State Entrepreneurship Garage</p>
      </div>
      <div className="header__meta">
        <div className="stat stat--wanted">
          <span className="stat__num">{wantedCount}</span>
          <span className="stat__label">Wanted</span>
        </div>
        <div className="stat stat--gotit">
          <span className="stat__num">{gotItCount}</span>
          <span className="stat__label">Got It</span>
        </div>
        <div className="clock">
          {time} <span className="clock__ampm">{ampm}</span>
        </div>
      </div>
    </header>
  )
}
