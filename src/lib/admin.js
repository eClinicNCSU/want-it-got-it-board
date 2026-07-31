import { supabase, isSupabaseConfigured } from './supabase.js'

async function rpc(fn, args) {
  if (!isSupabaseConfigured) {
    throw new Error('Database not connected. Set VITE_SUPABASE_* in .env.')
  }
  const { data, error } = await supabase.rpc(fn, args)
  if (error) throw new Error(error.message)
  return data
}

// All admin calls pass the shared password; the database verifies it against a
// bcrypt hash and only then performs the action (see supabase/schema.sql).
export const adminVerify = (pw) => rpc('admin_verify', { p_password: pw })

export const adminListCards = (pw) => rpc('admin_list_cards', { p_password: pw })

export const adminSetStatus = (pw, id, status) =>
  rpc('admin_set_status', { p_password: pw, p_card_id: id, p_status: status })

export const adminDeleteCard = (pw, id) =>
  rpc('admin_delete_card', { p_password: pw, p_card_id: id })

export const adminClearBoard = (pw) => rpc('admin_clear_board', { p_password: pw })

export const adminChangePassword = (pw, next) =>
  rpc('admin_change_password', { p_password: pw, p_new_password: next })
