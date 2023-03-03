import { supabase } from '../../../utils/supabase';
import Header from '../../header';

export async function generateStaticParams() {
  const { data: events } = await supabase.from('competitions').select('id');
  return events.map((competition) => ({
    id: competition.id.toString(),
  }));
}

export default function layout ({ children }) { return children }
