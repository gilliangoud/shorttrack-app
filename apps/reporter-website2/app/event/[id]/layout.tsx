import { supabase } from '../../../utils/supabase';
import Header from '../../header';

export async function generateStaticParams() {
  const { data: events } = await supabase.from('competitions').select('id');
  return events.map((competition) => ({
    id: competition.id.toString(),
  }));
}

export default function Layout({ children, params: { id } }: { children: React.ReactNode; params: { id: string } }) {
  return (
    <>
      <Header id={id} />
      <main className="container max-w-7xl mx-auto sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}
