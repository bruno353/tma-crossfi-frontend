'use client'

import ScrollUp from '@/components/Common/ScrollUp'
import EmailConfirmation from '@/components/EmailConfirmation'

export default function UserPage({ params }) {
  console.log(params.id)
  return (
    <>
      <ScrollUp />
      <EmailConfirmation id={params.id} />
    </>
  )
}
