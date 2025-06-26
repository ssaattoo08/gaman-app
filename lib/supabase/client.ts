import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// グローバルなsupabaseインスタンスをやめ、毎回新規生成する
export const createClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
