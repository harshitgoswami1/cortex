import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const createSupabaseClient = createClient(
    "https://yuollauwffzrakmhsgky.supabase.co",
    "sb_publishable_HBAauIDvlqkTiprf27um0Q_CWLtaMjS"
)

export default createSupabaseClient;