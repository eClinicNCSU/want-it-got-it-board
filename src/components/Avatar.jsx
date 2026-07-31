// Deterministic avatar: initials from the name, hue picked from a small palette
// so the same person keeps the same color without storing anything.
const HUES = [
  '#e0537d', '#e0873b', '#3ba7e0', '#7c5ce0',
  '#3bc99a', '#c94f8f', '#5c8ae0', '#e0b23b',
]

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function hueFor(name = '') {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return HUES[sum % HUES.length]
}

export default function Avatar({ name }) {
  return (
    <span className="avatar" style={{ background: hueFor(name) }}>
      {initials(name)}
    </span>
  )
}
