// Compact "time ago" like the mockup: 5h, 2d, 1w. Takes hours-ago as a number.
export function timeAgo(hoursAgo) {
  if (hoursAgo == null) return ''
  if (hoursAgo < 1) return 'now'
  if (hoursAgo < 24) return `${Math.floor(hoursAgo)}h`
  const days = Math.floor(hoursAgo / 24)
  if (days < 7) return `${days}d`
  const weeks = Math.floor(days / 7)
  return `${weeks}w`
}
