import type { Database } from '@shorttrack-app/st-app-db';
import {createClient} from '@supabase/supabase-js'

export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY,
)
