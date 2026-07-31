import Card from './Card.jsx'

export default function Column({ side, title, subtitle, cards }) {
  return (
    <section className={`column column--${side}`}>
      <div className="column__head">
        <span className="column__dot" />
        <h2 className="column__title">{title}</h2>
        <span className="column__subtitle">{subtitle}</span>
      </div>
      <div className="column__cards">
        {cards.length === 0 ? (
          <p className="column__empty">Nothing here yet.</p>
        ) : (
          cards.map((card) => <Card key={card.id} card={card} side={side} />)
        )}
      </div>
    </section>
  )
}
