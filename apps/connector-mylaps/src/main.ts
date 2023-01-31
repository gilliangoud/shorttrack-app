import { createClient } from '@supabase/supabase-js';
import { Database } from '@shorttrack-app/st-app-db';
const supabase = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const sub = supabase.channel('public:mylaps').on(
  'postgres_changes',
  {
    event: 'UPDATE',
    schema: 'public',
    table: `races`,
  },
  (payload) => {
    console.log('payload', payload)
  }
);

sub.subscribe();
