'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
import { getCurrentUser } from '@/utils/api'
import { usePathname, useRouter } from 'next/navigation'
import { UserProps } from '@/types/user'
import { UserWorkspaceProps } from '@/types/workspace'

export interface MenuI {
  userWorkspace: UserWorkspaceProps
}

const UserWorkspaceInfoModal = ({ userWorkspace }: MenuI) => {
  const roleToValue = {
    normal: 'Member',
    admin: 'Admin',
  }
  return (
    <>
      <div className="h-full w-[300px] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[12px] font-normal text-[#c5c4c4]">
        <div className="grid gap-y-[10px]">
          <div className="flex gap-x-[10px]">
            <img
              alt="ethereum avatar"
              src={userWorkspace.user.profilePicture}
              className="w-[25px] rounded-full"
            ></img>
            <div>{roleToValue[userWorkspace.role]}</div>
          </div>
          <div>{userWorkspace.user.name}</div>
          <div>{userWorkspace.user.email}</div>
          <div>Joined at {userWorkspace.user.createdAt}</div>
        </div>
      </div>
    </>
  )
}

export default UserWorkspaceInfoModal
