'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
import { getCurrentUser } from '@/utils/api'
import { usePathname, useRouter } from 'next/navigation'
import { UserProps } from '@/types/user'
import { WorkspaceProps } from '@/types/workspace'

export interface MenuI {
  user: UserProps
}

const WorkspaceSelector = ({ user }: MenuI) => {
  const finalWorkspaces: WorkspaceProps[] = user.UserWorkspaces.map(
    (workspace) => workspace.workspace,
  )

  return (
    <>
      <div className="h-full w-[300px] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[14px] font-normal text-[#c5c4c4]">
        <div className="grid gap-y-[20px]">My workspaces</div>
        <div className="my-[7px] h-[1px] w-full bg-[#33323e]"></div>
        <div className="max-h-[100px] overflow-y-auto">
          {finalWorkspaces.map((workspace, index) => (
            <Link key={index} href={`/workspace/${workspace.id}`}>
              <div className="flex cursor-pointer items-center gap-x-[12px] rounded-[5px] p-[5px] hover:bg-[#c5c5c510]">
                <img
                  alt="ethereum avatar"
                  src={
                    workspace.finalURL
                      ? workspace.finalURL
                      : '/images/dashboard/work.webp'
                  }
                  className="w-[25px] rounded-full"
                ></img>
                <div className="overflow-hidden truncate text-ellipsis whitespace-nowrap text-[#c5c4c4]">
                  {workspace.name}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="my-[20px] h-[0.5px] w-full bg-[#33323e]"></div>
        <div
          onClick={() => {
            // onSignOut()
          }}
          className="flex w-fit cursor-pointer items-center gap-x-[12px] rounded-[5px] p-[5px] hover:bg-[#c5c5c510]"
        >
          <div className="text-[#cc5563]">Sign out</div>
          <img
            alt="ethereum avatar"
            src="/images/header/logout.svg"
            className="w-[18px] rounded-full"
          ></img>
        </div>
      </div>
    </>
  )
}

export default WorkspaceSelector
