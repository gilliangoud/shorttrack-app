import { createClient } from "@supabase/supabase-js";
import { type Database } from '../types/database.types'
import { env } from "../env/client.mjs";

export default createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: { 'x-goud': 'shorttrack-app' },
    },
  }
);