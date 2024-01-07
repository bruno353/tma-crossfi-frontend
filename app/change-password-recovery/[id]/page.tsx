'use client'

import ChangePasswordRecoveryFinal from '@/components/ChangePasswordRecovery2'
import ScrollUp from '@/components/Common/ScrollUp'

export default function UserPage({ params }) {
  console.log(params.id)
  return (
    <>
      <ScrollUp />
      <ChangePasswordRecoveryFinal id={params.id} />
    </>
  )
}
