/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Eye, EyeSlash } from 'phosphor-react'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { getWorkspace } from '@/utils/api'
import nookies, { parseCookies, setCookie } from 'nookies'

const ChatSidebar = (id: any) => {
  const [sidebarOption, setSidebarOption] = useState<any>({
    TEXT: true,
    AUDIO: true,
    VIDEO: true,
  })

  const channelOption = [
    {
      name: 'TEXT CHATS',
      type: 'TEXT',
    },
    {
      name: 'AUDIO CHATS',
      type: 'AUDIO',
    },
    {
      name: 'VIDEO CHATS',
      type: 'VIDEO',
    },
  ]

  const handleSidebarClick = (type) => {
    const newSideBar = sidebarOption
    newSideBar[type] = !sidebarOption[type]

    console.log('newSidebar')
    console.log(newSideBar)
    setSidebarOption(newSideBar)
  }

  return (
    <>
      <div className="relative z-10 flex h-screen w-fit overflow-hidden bg-[#33323E] px-[10px] pb-16 pt-5 text-[16px] md:pb-20 lg:mt-[100px] lg:pb-28">
        <div className="text-[11px] font-medium text-[#C5C4C4]">
          {channelOption.map((option, index) => (
            <div key={index} className="mb-[30px]">
              <div
                onClick={() => {
                  handleSidebarClick(option.type)
                }}
                className={`flex cursor-pointer gap-x-[5px] hover:text-[#fff]`}
              >
                <img
                  src="/images/chat/arrow-down.svg"
                  alt="image"
                  className={`w-[8px]  ${
                    !sidebarOption[option.type] && '-rotate-90'
                  }`}
                />
                <div>{option.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default ChatSidebar
