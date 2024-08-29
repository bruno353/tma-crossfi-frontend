'use client'

import type { Abi, Chain, Account } from 'viem'
import { useReadContract, useWriteContract } from 'wagmi'
import type {
  Config,
  UseReadContractParameters,
  UseWriteContractParameters,
} from 'wagmi'
import { wagmiConfig } from '@/blockchain/config'
import { handleError } from './errors'
import { waitForTransactionReceipt } from '@wagmi/core'

export function useContractWrite() {
  const { writeContractAsync, writeContract, ...rest } = useWriteContract({
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

  const write = async (
    functionName: string,
    args: Array<any> = [],
    contractABI: Abi,
    chain: Chain,
    account: `0x${string}` | Account,
    contract: any,
    value?: string,
  ) => {
    const result = await writeContractAsync({
      abi: contractABI,
      address: contract,
      args,
      functionName,
      chain,
      account,
      value: value ?? '0',
    })
    const transaction = await waitForTransactionReceipt(wagmiConfig, {
      hash: result,
    })

    return transaction
  }
  return { write, ...rest }
}
