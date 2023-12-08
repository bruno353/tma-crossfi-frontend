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

const Menu = ({ user }: { user: UserProps }) => {
  return (
    <>
      <div className="h-full w-[300px] rounded-[10px]  border-[1px] border-[#5f5f5f] bg-[#060621] p-[15px] text-[12px] font-medium text-[#fff]">
        <div>
          <img
            alt="ethereum avatar"
            src={user.profilePicture}
            className="w-[40px] rounded-full"
          ></img>
          <div>{user.name}</div>
        </div>
        <div className="h-[1px] w-full bg-[#13111C]"></div>

        <div className="flex w-fit cursor-pointer items-center gap-x-[5px] rounded-[5px] p-[5px] hover:bg-[#c5c5c510]">
          <div className="text-[#cc5563]">Sign out</div>
          <img
            alt="ethereum avatar"
            src="/images/header/logout.svg"
            className="w-[20px] rounded-full"
          ></img>
        </div>
      </div>
    </>
  )
}

export default Menu
