import { createSupabaseClient } from '@shorttrack-app/supabase-client';
const supabase = createSupabaseClient();

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
