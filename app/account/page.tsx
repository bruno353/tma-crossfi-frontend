'use client'

import Account from '@/components/Account'
import ScrollUp from '@/components/Common/ScrollUp'
import Workspace from '@/components/Workspace'

export default function Page({ params }) {
  console.log(params.id)
  return (
    <>
      <ScrollUp />
      <Account />
    </>
  )
}
