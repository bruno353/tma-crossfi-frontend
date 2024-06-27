'use client'

import type { Abi, Chain, Account } from 'viem'
import {
  useReadContract,
  useWriteContract,
  useDeployContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import type {
  Config,
  UseReadContractParameters,
  UseWriteContractParameters,
} from 'wagmi'
import { wagmiConfig } from '@/blockchain/config'
import { handleError } from './errors'
import { waitForTransactionReceipt } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'

export function useContractDeploy() {
  const { deployContractAsync, ...rest } = useDeployContract({
    config: wagmiConfig,
    mutation: {
      onError: (error) => {
        handleError(error)
      },
      onSettled: (data) => {
        console.log(data)
      },
    },
  })

  const deploy = async (abi: Abi, bytecode: string) => {
    const result = await deployContractAsync({
      abi,
      bytecode,
    })

    const transaction = await waitForTransactionReceipt(wagmiConfig, {
      hash: result,
    })

    return transaction
  }
  return { deploy }
}
