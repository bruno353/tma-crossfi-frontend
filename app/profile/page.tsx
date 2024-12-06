'use client'

import ScrollUp from '@/components/Common/ScrollUp'
import Profile from '@/components/Profile'

export default function Page({ params }) {
  console.log(params.id)
  return (
    <>
      <ScrollUp />
      <Profile />
    </>
  )
}
