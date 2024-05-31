'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import { getCurrentUser } from '@/utils/api'
import { usePathname, useRouter } from 'next/navigation'
import { UserProps } from '@/types/user'
import { UserWorkspaceProps } from '@/types/workspace'
import { BlockchainContractDeploymentHistoryProps } from '@/types/blockchain-app'
import { transformString } from '@/utils/functions'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export interface MenuI {
  ideContractDeploymentHistories: BlockchainContractDeploymentHistoryProps
}

const CntDeploymentHistoryModal = ({
  ideContractDeploymentHistories,
}: MenuI) => {
  const roleToValue = {
    normal: 'Member',
    admin: 'Admin',
  }
  return (
    <>
      <div className="h-full min-w-[300px] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[12px] font-normal text-[#c5c4c4]">
        <div className="grid gap-y-[10px]">
          <div className="flex gap-x-[10px]">
            <img
              alt="ethereum avatar"
              src={
                ideContractDeploymentHistories.userWorkspace.user.profilePicture
              }
              className="w-[25px] rounded-full"
            ></img>
            <div>
              {roleToValue[ideContractDeploymentHistories.userWorkspace.role]}
            </div>
          </div>
          <div>
            {ideContractDeploymentHistories.userWorkspace.user.name ??
              ideContractDeploymentHistories.userWorkspace.user.email}{' '}
            deployed the contract at {ideContractDeploymentHistories.chain}
          </div>
          <div>
            Address:{' '}
            <span
              className="cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(
                  ideContractDeploymentHistories.contractAddress,
                )
                toast.success('Address copied')
              }}
            >
              {' '}
              {transformString(
                ideContractDeploymentHistories.contractAddress,
                8,
              )}
            </span>
          </div>
          <div>Created at {ideContractDeploymentHistories.createdAt}</div>
        </div>
      </div>
    </>
  )
}

export default CntDeploymentHistoryModal
