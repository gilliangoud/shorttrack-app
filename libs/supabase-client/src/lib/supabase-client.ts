import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@shorttrack-app/st-app-db';

export function createSupabaseClient(): SupabaseClient<Database> {
  const { supabaseUrl, supabaseKey } = getSupabaseCredsFromEnv();

  const client = createClient<Database>(supabaseUrl, supabaseKey);

  return client;
}

function getSupabaseCredsFromEnv(): {
  supabaseUrl: string;
  supabaseKey: string;
} {
  const { supabaseApiUrl, supabaseApiKey } = (window as any).env;
  if (!supabaseApiUrl || !supabaseApiKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_KEY environment variables'
    );
  }
  return {
    supabaseKey: supabaseApiKey,
    supabaseUrl: supabaseApiUrl,
  };
}
