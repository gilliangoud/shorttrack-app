import type { ReactElement } from 'react'
import BaseLayout from '../components/layouts/BaseLayout'
import { type NextPageWithLayout } from '../types/nextpage.types'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { type Database } from '../types/database.types'

const Page: NextPageWithLayout = () => {
  const supabaseClient = useSupabaseClient<Database>()
  const user = useUser()
  const [data, setData] = useState<unknown>()

  useEffect(() => {
    async function loadData() {
      const { data } = await supabaseClient.from('test').select('*')
      setData(data)
    }
    // Only run query once user is logged in.
    if (user) loadData()
  }, [user])

  if (!user)
    return (
      <Auth
        redirectTo="http://localhost:3000/"
        appearance={{ theme: ThemeSupa }}
        supabaseClient={supabaseClient}
      />
    )

  return (
    <>
      <button onClick={() => supabaseClient.auth.signOut()}>Sign out</button>
      <p>user:</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <p>client-side data fetching with RLS</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <BaseLayout>
      <div>{page}</div>
    </BaseLayout>
  )
}

export default Page