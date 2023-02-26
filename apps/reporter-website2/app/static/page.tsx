import { supabase } from "../../utils/supabase"

async function page() {
  const { data } = await supabase.from('competitors').select()
  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )
}

export default page
