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

export interface MenuI {
  user: UserProps
  onSignOut(): void
}

const Menu = ({ user, onSignOut }: MenuI) => {
  return (
    <>
      <div className="h-full w-[300px] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[14px] font-normal text-[#c5c4c4]">
        <div className="grid gap-y-[20px]">
          <img
            alt="ethereum avatar"
            src={user.profilePicture}
            className="w-[40px] rounded-full"
          ></img>
          <div>{user.name}</div>
        </div>
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
        <Link href={'/settings'}>
          <div className="mt-[10px] flex cursor-pointer items-center gap-x-[12px] rounded-[5px] p-[5px] hover:bg-[#c5c5c510]">
            <img
              alt="ethereum avatar"
              src="/images/header/settings.svg"
              className="w-[16px] rounded-full"
            ></img>
            <div className="text-[#c5c4c4]">Settings</div>
          </div>
        </Link>
        <Link href={'mailto:contact@accelar.io'}>
          <div className="mt-[10px] flex cursor-pointer items-center gap-x-[12px] rounded-[5px] p-[5px] hover:bg-[#c5c5c510]">
            <img
              alt="ethereum avatar"
              src="/images/header/help.svg"
              className="w-[17px] rounded-full"
            ></img>
            <div className="text-[#c5c4c4]">Help</div>
          </div>
        </Link>
        <div className="my-[20px] h-[0.5px] w-full bg-[#33323e]"></div>
        <div
          onClick={() => {
            onSignOut()
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

export default Menu
