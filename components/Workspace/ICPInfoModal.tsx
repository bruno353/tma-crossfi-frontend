'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import { AccountContext } from '../../contexts/AccountContext'
import { getCurrentUser } from '@/utils/api'
import { usePathname, useRouter } from 'next/navigation'
import { UserProps } from '@/types/user'
import { UserWorkspaceProps, WorkspaceProps } from '@/types/workspace'

export interface MenuI {
  workspace: WorkspaceProps
}

const ICPInfoModal = ({ workspace }: MenuI) => {
  return (
    <>
      <div className="h-full  rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[12px] font-normal text-[#c5c4c4]">
        <div className="grid gap-y-[10px]">
          <div className="flex gap-x-[10px]">
            <img
              alt="ethereum avatar"
              src="/images/workspace/icp.png"
              className="w-[25px] rounded-full"
            ></img>
            <div>Internet Computer Protocol</div>
          </div>
          <div>{workspace?.icpWalletPubKId}</div>
          <div>{workspace?.icpWalletPubKPrincipal}</div>
          <div>Balance: 0 ICP</div>
        </div>
      </div>
    </>
  )
}

export default ICPInfoModal
