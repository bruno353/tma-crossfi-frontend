'use client'

import ScrollUp from '@/components/Common/ScrollUp'
import Workspace from '@/components/Workspace'

export default function Page({ params }) {
  console.log(params.id)
  return (
    <>
      <ScrollUp />
      <Workspace id={params.id} />
    </>
  )
}
