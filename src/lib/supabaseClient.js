import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL_FALLBACK = 'https://djxpibdvnsfejwoqndqd.supabase.co'
const SUPABASE_ANON_KEY_FALLBACK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqeHBpYmR2bnNmZWp3b3FuZHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3Mjk2MzgsImV4cCI6MjA5NzMwNTYzOH0.AqKvMQNdCg10EXH3kgRHJ7B0RoiBcwXUbiR5kEJ3HiA'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL_FALLBACK
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY_FALLBACK

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Credenciais do Supabase não configuradas.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)