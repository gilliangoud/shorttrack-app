import type { ReactElement } from 'react'
import BaseLayout from '../components/layouts/BaseLayout'
import { type NextPageWithLayout } from '../types/nextpage.types'

const Schedule: NextPageWithLayout = () => {
  return <p>hello world</p>
}

Schedule.getLayout = function getLayout(page: ReactElement) {
  return (
    <BaseLayout>
      <div>{page}</div>
    </BaseLayout>
  )
}

export default Schedule