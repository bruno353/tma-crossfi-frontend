'use client'

import AppInfo from '@/components/AppInfo'
import ScrollUp from '@/components/Common/ScrollUp'

export default function Page({ params }) {
  console.log(params.id)
  return (
    <>
      <ScrollUp />
      <AppInfo id={params.id} />
    </>
  )
}
