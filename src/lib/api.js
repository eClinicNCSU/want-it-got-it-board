import { supabase, isSupabaseConfigured } from './supabase.js'

// Submits a card via the SECURITY DEFINER `submit_card` RPC.
// The card lands as `pending` (awaiting admin approval); contact goes to the
// private table. Returns the poster's secret manage token (uuid).
export async function submitCard(form) {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Database not connected yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
    )
  }

  const { data, error } = await supabase.rpc('submit_card', {
    p_type: form.type,
    p_title: form.title.trim(),
    p_description: form.description.trim(),
    p_tags: form.tags,
    p_author_name: form.author_name.trim(),
    p_author_major: form.author_major.trim() || null,
    p_author_year: form.author_year.trim() || null,
    p_is_paid: form.is_paid,
    p_deadline: form.deadline || null,
    p_contact: form.contact.trim(),
  })

  if (error) throw new Error(error.message)
  return data
}

// Public read of a single card (RLS returns it only if approved/claimed).
export async function fetchCard(cardId) {
  if (!isSupabaseConfigured) throw new Error('Database not connected.')
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

// Reveal a poster's contact (returns null unless the card is approved).
export async function revealContact(cardId) {
  if (!isSupabaseConfigured) throw new Error('Database not connected.')
  const { data, error } = await supabase.rpc('reveal_contact', {
    p_card_id: cardId,
  })
  if (error) throw new Error(error.message)
  return data
}

// Manage (poster, via secret token).
export async function manageGet(token) {
  if (!isSupabaseConfigured) throw new Error('Database not connected.')
  const { data, error } = await supabase.rpc('manage_get', { p_token: token })
  if (error) throw new Error(error.message)
  return data
}

export async function manageSetStatus(token, status) {
  if (!isSupabaseConfigured) throw new Error('Database not connected.')
  const { error } = await supabase.rpc('manage_set_status', {
    p_token: token,
    p_status: status,
  })
  if (error) throw new Error(error.message)
}

export async function manageDeleteCard(token) {
  if (!isSupabaseConfigured) throw new Error('Database not connected.')
  const { error } = await supabase.rpc('manage_delete_card', { p_token: token })
  if (error) throw new Error(error.message)
}
