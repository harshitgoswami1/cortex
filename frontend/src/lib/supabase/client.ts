import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    "https://yuollauwffzrakmhsgky.supabase.co",
    "sb_publishable_HBAauIDvlqkTiprf27um0Q_CWLtaMjS"
  );
}