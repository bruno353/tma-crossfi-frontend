/* eslint-disable no-unused-vars */
'use client'

import L3AContributors from '@/components/About/L3AContributors'
import ScrollUp from '@/components/Common/ScrollUp'
import Hero from '@/components/Hero'
import SuccessStories from '@/components/SuccessStories'
import { Inter } from '@next/font/google'
import { useRef, useEffect } from 'react'
import { RevealWrapper } from 'next-reveal'
import Login from '@/components/Login'
import { usePathname, useRouter } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const pricingRef = useRef(null)
  const contributorsRef = useRef(null)
  const tallyFormsRef = useRef(null)
  const { push } = useRouter()

  useEffect(() => {
    push('/signin')
  }, [])

  return (
    <>
      <ScrollUp />
      <Login />
      {/* <SuccessStories /> */}
    </>
  )
}
