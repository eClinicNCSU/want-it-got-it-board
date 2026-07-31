// The 5 friendly filter buckets shown on the filter bar (plus "Everything").
// Each granular card tag rolls up into exactly one bucket. Unknown/custom tags
// fall through to "else" until an admin re-buckets them.

export const BUCKETS = [
  { id: 'all', label: 'Everything' },
  { id: 'code', label: 'Code' },
  { id: 'design', label: 'Design' },
  { id: 'build', label: 'Build' },
  { id: 'business', label: 'Business' },
  { id: 'else', label: 'Everything else' },
]

// tag (lowercase) -> bucket id
const TAG_TO_BUCKET = {
  // Code
  software: 'code', engineering: 'code', web: 'code', react: 'code',
  supabase: 'code', backend: 'code', mobile: 'code', data: 'code', ai: 'code',
  // Design
  design: 'design', ux: 'design', ui: 'design', illustration: 'design',
  branding: 'design',
  // Build
  hardware: 'build', prototyping: 'build', fabrication: 'build',
  welding: 'build', manufacturing: 'build',
  // Business
  business: 'business', strategy: 'business', finance: 'business',
  fundraising: 'business', grants: 'business', sales: 'business',
  bizdev: 'business', marketing: 'business', legal: 'business',
  ip: 'business', pitch: 'business',
  // Everything else
  science: 'else', bio: 'else', chemistry: 'else', process: 'else',
  operations: 'else', video: 'else', testing: 'else', feedback: 'else',
  cofounder: 'else',
}

export function bucketForTag(tag) {
  return TAG_TO_BUCKET[String(tag).toLowerCase()] || 'else'
}

// Curated tags offered in the submit form's picker, grouped by bucket.
// Students may also add a free-text "Other" tag (falls into "Everything else").
export const TAG_OPTIONS = [
  { bucket: 'code', label: 'Code', tags: ['software', 'web', 'react', 'data', 'ai', 'backend', 'mobile'] },
  { bucket: 'design', label: 'Design', tags: ['design', 'ux', 'ui', 'illustration', 'branding'] },
  { bucket: 'build', label: 'Build', tags: ['hardware', 'prototyping', 'fabrication', 'welding', 'manufacturing'] },
  { bucket: 'business', label: 'Business', tags: ['business', 'strategy', 'finance', 'fundraising', 'grants', 'sales', 'marketing', 'legal', 'pitch'] },
  { bucket: 'else', label: 'Everything else', tags: ['science', 'chemistry', 'process', 'operations', 'video', 'testing', 'feedback', 'cofounder'] },
]

// A card matches a bucket if any of its tags roll up into that bucket.
export function cardInBucket(card, bucketId) {
  if (bucketId === 'all') return true
  return (card.tags || []).some((t) => bucketForTag(t) === bucketId)
}
