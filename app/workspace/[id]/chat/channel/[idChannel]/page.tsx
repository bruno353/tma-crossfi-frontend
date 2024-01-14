'use client'

import ChangePasswordRecovery from '@/components/ChangePasswordRecovery'
import ChangePasswordRecoveryFinal from '@/components/ChangePasswordRecovery2'
import Chat from '@/components/Chat'
import Channel from '@/components/Chat/Channel/index'
import ScrollUp from '@/components/Common/ScrollUp'

// eslint-disable-next-line no-unused-vars

export default function Page({ params }) {
  console.log(params.idChannel)
  return (
    <>
      <ScrollUp />
      <div className="flex h-full w-full">
        <div className="h-full flex-shrink-0">
          <Chat id={params.id} />
        </div>
        <div className="h-[calc(100vh-6rem)] w-full">
          <Channel id={params.idChannel} />
        </div>
      </div>
    </>
  )
}
