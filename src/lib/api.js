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
