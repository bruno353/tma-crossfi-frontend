'use client'

import ScrollUp from '@/components/Common/ScrollUp'
import DePin from '@/components/DePin'

// eslint-disable-next-line no-unused-vars

export default function Page({ params }) {
  return (
    <>
      <ScrollUp />
      <div className="max-h-[calc(100vh-10rem)] w-full">
        <DePin id={params.id} />
      </div>
    </>
  )
}
