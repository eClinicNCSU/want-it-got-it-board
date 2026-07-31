import QrCode from './QrCode.jsx'

// Fixed panel on the board (TV/iPad) — students scan it to open the submit form
// on their own phone. Tappable too, for the iPad.
export default function SubmitQr() {
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/submit`
      : '/submit'

  return (
    <a className="submitqr" href="/submit">
      <div className="submitqr__text">
        <span className="submitqr__title">Post a card</span>
        <span className="submitqr__sub">Scan with your phone</span>
      </div>
      <QrCode value={url} size={96} />
    </a>
  )
}
