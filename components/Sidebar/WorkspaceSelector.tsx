'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
import { getCurrentUser } from '@/utils/api'
import { usePathname, useRouter } from 'next/navigation'
import { UserProps } from '@/types/user'

export interface MenuI {
  workspaces: UserProps
}

const WorkspaceSelector = ({ workspaces }: MenuI) => {
  return (
    <>
      <div className="h-full w-[300px] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[14px] font-normal text-[#c5c4c4]">
        <div className="grid gap-y-[20px]">My workspaces</div>
        <div className="my-[20px] h-[1px] w-full bg-[#33323e]"></div>
        <Link href={'/dashboard'}>
          <div className="flex cursor-pointer items-center gap-x-[12px] rounded-[5px] p-[5px] hover:bg-[#c5c5c510]">
            <img
              alt="ethereum avatar"
              src="/images/header/home.svg"
              className="w-[17px] rounded-full"
            ></img>
            <div className="text-[#c5c4c4]">Dashboard</div>
          </div>
        </Link>
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
