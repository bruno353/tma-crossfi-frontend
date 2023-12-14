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

const Sidebar = (id: any) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [sidebarOption, setSidebarOption] = useState<string>('')

  const { push } = useRouter()
  const pathname = usePathname()

  const sidebarOptions = [
    {
      name: 'Home',
      option: '/home',
      imgSource: '/images/workspace/home.svg',
    },
    {
      name: 'Chat',
      option: '/chat',
      imgSource: '/images/workspace/chat.svg',
    },
    {
      name: 'Notes',
      option: '/notes',
      imgSource: '/images/workspace/note.svg',
    },
    {
      name: 'Deploy',
      option: '/deploy',
      imgSource: '/images/workspace/rocket.svg',
    },
    {
      name: 'Tasks',
      option: '/tasks',
      imgSource: '/images/workspace/tasks.svg',
    },
  ]

  async function getData(id: any) {
    const { userSessionToken } = parseCookies()
    console.log('getting data')
    console.log(id)
    console.log(userSessionToken)

    const data = {
      id,
    }

    let dado
    try {
      dado = await getWorkspace(data, userSessionToken)
    } catch (err) {
      toast.error(`Not a valid workspace`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      push('/dashboard')
    }

    return dado
  }

  const handleSidebarClick = (name, option) => {
    const newPath = pathname.endsWith(option)
      ? pathname
      : `${pathname}${option}`

    push(newPath)

    setSidebarOption(name)
  }

  useEffect(() => {
    console.log('workspace entrado')
    console.log('verificando se existe id')
    console.log(id)
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (id) {
      console.log(id)
      console.log(id.id)
      getData(id.id)
    } else {
      push('/dashboard')
    }
  }, [id])

  useEffect(() => {
    for (let i = 0; i < sidebarOptions.length; i++) {
      const pathFinal = pathname.endsWith(sidebarOptions[i].option)

      if (pathFinal) {
        setSidebarOption(sidebarOptions[i].name)
        break
      }
    }
  }, [pathname])

  return (
    <>
      <div
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
        className="relative z-10 flex h-screen w-fit overflow-hidden bg-[#040015] bg-opacity-60 pb-16 pt-36 text-[16px] md:pb-20 lg:pb-28 lg:pt-[140px]"
      >
        <div className="text-[#fff]">
          {sidebarOptions.map((option, index) => (
            <div
              onClick={() => {
                handleSidebarClick(option.name, option.option)
              }}
              key={index}
            >
              <div
                className={`mb-[5px] cursor-pointer px-[20px] py-[20px] hover:bg-[#dbdbdb1e] ${
                  sidebarOption === option.name && 'bg-[#dbdbdb1e]'
                }`}
              >
                <img
                  src={option.imgSource}
                  alt="image"
                  className="mx-auto w-[22px] rounded-full"
                />
                {isSidebarOpen && (
                  <div className="text-center text-[12px] font-light">
                    {option.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Sidebar
