// Best-effort turn a free-text contact into an actionable link.
// Contact is free-form (email, phone, LinkedIn URL, @handle…), so we sniff it.
export function contactLink(raw) {
  const c = (raw || '').trim()
  if (!c) return null

  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) {
    return { href: `mailto:${c}`, kind: 'email' }
  }
  // URL
  if (/^https?:\/\//i.test(c)) {
    return { href: c, kind: 'link' }
  }
  if (/^[\w-]+\.(com|org|net|io|edu)(\/\S*)?$/i.test(c)) {
    return { href: `https://${c}`, kind: 'link' }
  }
  // Phone (mostly digits, allows + ( ) - spaces)
  const digits = c.replace(/[^\d]/g, '')
  if (/^[+()\d\s-]+$/.test(c) && digits.length >= 7) {
    return { href: `tel:${c.replace(/[^\d+]/g, '')}`, kind: 'phone' }
  }
  // Otherwise it's a handle or plain text — no link.
  return null
}
