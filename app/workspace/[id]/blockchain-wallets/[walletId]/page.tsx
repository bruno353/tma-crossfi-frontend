'use client'

import BlockchainWallet from '@/components/BlockchainWallets/BlockchainWallet.tsx'
import ScrollUp from '@/components/Common/ScrollUp'

// eslint-disable-next-line no-unused-vars

export default function Page({ params }) {
  return (
    <>
      <ScrollUp />
      <div className="max-h-[calc(100vh-10rem)] w-full">
        <BlockchainWallet walletId={params.walletId} id={params.id} />
      </div>
    </>
  )
}
