'use client'

import React, { ReactNode } from 'react'
import { wagmiConfig, projectId } from '@/blockchain/config'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { State, WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

if (!projectId) throw new Error('Project ID is not defined')

createWeb3Modal({
  wagmiConfig,
  projectId,
  themeVariables: {
    '--w3m-font-size-master': '7px',
    '--w3m-accent': '#273687',
  },
})

export function Web3Modal({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: State
}) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
