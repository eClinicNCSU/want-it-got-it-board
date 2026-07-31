import { QRCodeSVG } from 'qrcode.react'

// A QR rendered on a white tile so it stays scannable against the dark UI.
export default function QrCode({ value, size = 72, className = '' }) {
  return (
    <span className={'qr ' + className}>
      <QRCodeSVG value={value} size={size} bgColor="#ffffff" fgColor="#0b0a10" level="M" />
    </span>
  )
}
