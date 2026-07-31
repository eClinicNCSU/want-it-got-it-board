// Maps a Supabase `cards` row to the shape the Card component expects,
// and derives the single status badge shown in the corner.

function hoursSince(ts) {
  return (Date.now() - new Date(ts).getTime()) / 3_600_000
}

// One badge per card, in priority order:
// claimed (overrides all) > deadline (time-sensitive) > paid > new (< 24h old).
export function deriveBadge(row) {
  if (row.status === 'claimed') return 'claimed'
  if (row.deadline) return 'deadline'
  if (row.is_paid) return 'paid'
  if (row.created_at && hoursSince(row.created_at) < 24) return 'new'
  return null
}

export function dbRowToCard(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    tags: row.tags || [],
    author_name: row.author_name,
    author_major: row.author_major || '',
    author_year: row.author_year || '',
    status: row.status,
    hoursAgo: row.created_at ? hoursSince(row.created_at) : null,
    badge: deriveBadge(row),
  }
}
