'use client'

import AutomationWorkflows from '@/components/AutomationWorkflows'
import ScrollUp from '@/components/Common/ScrollUp'
import LLMApps from '@/components/LLMApps'

// eslint-disable-next-line no-unused-vars

export default function Page({ params }) {
  return (
    <>
      <ScrollUp />
      <div className="max-h-[calc(100vh-10rem)] w-full">
        <AutomationWorkflows id={params.id} />
      </div>
    </>
  )
}
