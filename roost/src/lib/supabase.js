import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// createClient throws on a missing URL, which used to take the whole app down
// with a blank page — including the public landing, which needs no auth at all.
// Without config the client is simply absent and the auth screens say so.
export const supabase = url && anonKey ? createClient(url, anonKey) : null
export const authConfigured = Boolean(supabase)
