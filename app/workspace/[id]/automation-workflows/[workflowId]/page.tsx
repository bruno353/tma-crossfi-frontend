'use client'

import AutomationWorkflow from '@/components/AutomationWorkflows/AutomationWorkflow'
import BlockchainApps from '@/components/BlockchainApps'
import BlockchainApp from '@/components/BlockchainApps/BlockchainApp.tsx'
import ChangePasswordRecovery from '@/components/ChangePasswordRecovery'
import ChangePasswordRecoveryFinal from '@/components/ChangePasswordRecovery2'
import Chat from '@/components/Chat'
import Channel from '@/components/Chat/Channel/index'
import ScrollUp from '@/components/Common/ScrollUp'
import LLMApp from '@/components/LLMApps/LLMApp'

// eslint-disable-next-line no-unused-vars

export default function Page({ params }) {
  return (
    <>
      <ScrollUp />
      <div className="max-h-[calc(100vh-10rem)] w-full">
        <AutomationWorkflow workflowId={params.workflowId} id={params.id} />
      </div>
    </>
  )
}
