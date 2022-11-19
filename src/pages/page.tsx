import type { ReactElement } from 'react'
import BaseLayout from '../components/layouts/BaseLayout'
import { type NextPageWithLayout } from '../types/nextpage.types'

const Page: NextPageWithLayout = () => {
  return <p>hello world</p>
}

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <BaseLayout>
      <div>{page}</div>
    </BaseLayout>
  )
}

export default Page