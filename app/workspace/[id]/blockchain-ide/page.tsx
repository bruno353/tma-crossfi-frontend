'use client'

import BlockchainApps from '@/components/BlockchainApps'
import BlockchainWallets from '@/components/BlockchainWallets'
import ChangePasswordRecovery from '@/components/ChangePasswordRecovery'
import ChangePasswordRecoveryFinal from '@/components/ChangePasswordRecovery2'
import Chat from '@/components/Chat'
import Channel from '@/components/Chat/Channel/index'
import ScrollUp from '@/components/Common/ScrollUp'
import IDE from '@/components/IDE'

// eslint-disable-next-line no-unused-vars

export default function Page({ params }) {
  return (
    <>
      <ScrollUp />
      <div className="max-h-[calc(100vh-10rem)] w-full">
        <IDE id={params.id} />
      </div>
    </>
  )
}
