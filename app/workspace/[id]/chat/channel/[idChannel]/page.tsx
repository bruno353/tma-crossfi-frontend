'use client'

import ChangePasswordRecovery from '@/components/ChangePasswordRecovery'
import ChangePasswordRecoveryFinal from '@/components/ChangePasswordRecovery2'
import Chat from '@/components/Chat'
import Channel from '@/components/Chat/Channel'
import ScrollUp from '@/components/Common/ScrollUp'
import Dashboard from '@/components/Dashboard'
import Workspace from '@/components/Workspace'
import { Inter } from '@next/font/google'

// eslint-disable-next-line no-unused-vars
const inter = Inter({ subsets: ['latin'] })

export default function Page({ params }) {
  console.log(params.idChannel)
  return (
    <>
      <ScrollUp />
      <div className="flex h-full w-full">
        <div className="h-full flex-shrink-0">
          <Chat id={params.id} />
        </div>
        <div className="h-full w-full bg-yellow">
          <Channel id={params.idChannel} />
        </div>
      </div>
    </>
  )
}
