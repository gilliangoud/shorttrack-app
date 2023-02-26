import { supabase } from "../../../utils/supabase"
import { notFound } from "next/navigation"
import RaceWithUpdates from "./RaceWithUpdates"

export const revalidate = 30


export async function generateStaticParams() {
  const { data: events } = await supabase.from('competitions').select('id')
  return events.map((competition) => ({
      id: competition.id.toString()
  }))
}

async function page({params: {id}}: { params: {id: string}}) {
  const { data } = await supabase.from('competitions').select().match({id}).single()

  if(!data) {
    notFound()
  }

  return (
    <RaceWithUpdates serverRace={data} />
  )
}

export default page
