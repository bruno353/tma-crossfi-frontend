'use client'

import ChangePasswordRecovery from '@/components/ChangePasswordRecovery'
import ChangePasswordRecoveryFinal from '@/components/ChangePasswordRecovery2'
import Chat from '@/components/Chat'
import Start from '@/components/Chat/Start'
import ScrollUp from '@/components/Common/ScrollUp'

export default function Page({ params }) {
  console.log(params.id)
  return (

      <div className="flex h-full">
          <Chat id={params.id} />
        <Start />
      </div>
  )
}
