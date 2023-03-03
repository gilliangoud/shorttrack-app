import { supabase } from "../../../../utils/supabase"
import { notFound } from "next/navigation"
import Realtime from "./realtime"

export const revalidate = 1

async function page({params: {id}}: { params: {id: string}}) {
  const { data: competition } = await supabase.from('competitions').select().match({id}).single()
  const { data: activeRaces } = await supabase.from('races').select().match({competition: id, armed: true})
  const raceIds = activeRaces?.length > 0 ? activeRaces.map((race) => race.id) : [];
  const { data: lanes } = await supabase
    .from('lanes')
    .select()
    .in(
      'raceId',
      raceIds
    );

  if(!competition) {
    notFound()
  }

  return (
    <Realtime serverRaces={activeRaces} serverLanes={lanes} />
  )
}

export default page
