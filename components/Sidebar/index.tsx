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
import Workspace from '@/components/Workspace'
import { AccountContext } from '../../contexts/AccountContext'

const Sidebar = (id: any) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
  const [sidebarOption, setSidebarOption] = useState<string>('')
  const { workspace, setWorkspace } = useContext(AccountContext)

  const { push } = useRouter()
  const pathname = usePathname()

  const sidebarOptions = [
    {
      name: 'Home',
      option: `/${id.id}`,
      imgSource: '/images/workspace/home.svg',
    },
    {
      name: 'Chat',
      option: `/${id.id}/chat`,
      imgSource: '/images/workspace/chat.svg',
    },
    {
      name: 'Notes',
      option: `/${id.id}/notes`,
      imgSource: '/images/workspace/note.svg',
    },
    {
      name: 'Deploy',
      option: `/${id.id}/deploy`,
      imgSource: '/images/workspace/rocket.svg',
    },
    {
      name: 'Tasks',
      option: `/${id.id}/tasks`,
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
      if (dado) {
        setWorkspace(dado)
      }
    } catch (err) {
      toast.error(`Not a valid workspace`)
      toast.error(`Error: ${err}`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      push('/dashboard')
    }

    return dado
  }

  const handleSidebarClick = (name, option) => {
    const basePath = pathname.split('/')[1]
    const newPath = `/${basePath}${option}` // Constrói o novo caminho

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
    for (let i = 0; i < sidebarOptions?.length; i++) {
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
        // onMouseEnter={() => setIsSidebarOpen(true)}
        // onMouseLeave={() => setIsSidebarOpen(false)}
        className="z-[999] ml-[15px]  mt-[40px]  flex w-fit overflow-hidden rounded-[10px] bg-[#1D2144] px-[10px]  py-36 text-[16px] lg:py-[60px]"
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
                className={`mb-[5px] flex cursor-pointer  items-center gap-x-[10px] rounded-[7px] px-[10px] py-[5px] hover:bg-[#dbdbdb1e] ${
                  sidebarOption === option.name && 'bg-[#dbdbdb1e]'
                }`}
              >
                <img
                  src={option.imgSource}
                  alt="image"
                  className="mx-auto w-[20px] rounded-full"
                />
                {isSidebarOpen && (
                  <div className="text-center text-[13px] font-light">
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
