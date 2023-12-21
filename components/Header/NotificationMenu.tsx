'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import ThemeToggler from './ThemeToggler'
import menuData from './menuData'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
import { getCurrentUser } from '@/utils/api'
import { usePathname, useRouter } from 'next/navigation'
import { UserProps } from '@/types/user'
import { WorkspaceInviteProps } from '@/types/workspace'

export interface MenuI {
  user: UserProps
  workspaceInvites: WorkspaceInviteProps[]
  onSignOut(): void
}

const NotificationMenu = ({ user, onSignOut, workspaceInvites }: MenuI) => {
  const handleClickInvite = (id: string) => {
    console.log(id)
  }

  return (
    <>
      <div className="h-full w-[300px] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[14px] font-normal text-[#c5c4c4]">
        <div className="my-[20px] h-[1px] w-full bg-[#33323e]"></div>
        {workspaceInvites?.map((workspace, index) => (
          <div
            onClick={() => {
              handleClickInvite(workspace.id)
            }}
            key={index}
            className="flex cursor-pointer items-center gap-x-[12px] rounded-[5px] p-[5px] hover:bg-[#c5c5c510]"
          >
            <div
              className={`h-[10px] w-[10px] rounded-full  ${
                workspace.viewed ? 'bg-[#c5c4c4]' : 'bg-[#3415fa]'
              }`}
            ></div>
            <div className="text-[#c5c4c4]">
              <div>
                You have been invited to join {workspace?.workspace?.name}
              </div>
              <div>{workspace.createdAt}</div>
            </div>
          </div>
        ))}
        <div className="my-[20px] h-[0.5px] w-full bg-[#33323e]"></div>
      </div>
    </>
  )
}

export default NotificationMenu
