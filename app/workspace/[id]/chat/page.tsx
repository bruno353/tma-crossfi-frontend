'use client'

import ChangePasswordRecovery from '@/components/ChangePasswordRecovery'
import ChangePasswordRecoveryFinal from '@/components/ChangePasswordRecovery2'
import ScrollUp from '@/components/Common/ScrollUp'
import Dashboard from '@/components/Dashboard'
import Workspace from '@/components/Workspace'
import { Inter } from '@next/font/google'

// eslint-disable-next-line no-unused-vars
const inter = Inter({ subsets: ['latin'] })

export default function Page({ params }) {
  console.log(params.id)
  return (
    <>
      <ScrollUp />
      <Workspace id={params.id} />
    </>
  )
}
