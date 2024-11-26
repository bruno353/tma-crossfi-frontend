/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Eye, EyeSlash, SmileySad } from 'phosphor-react'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css' // import styles
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { parseCookies } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
import Link from 'next/link'
import NewWorkspaceModal from './NewWorkspace'
import { getUserWorkspace } from '@/utils/api'
import { WorkspaceProps } from '@/types/workspace'
import { Logo } from '../Sidebar/Logo'
import { workflowTypeToOptions } from '@/utils/consts'
import { callAxiosBackend } from '@/utils/general-api'
import { TelegramAppProps, TelegramAppType } from '@/types/telegram'

const Dashboard = () => {
  const [isCreatingNewWorkspace, setIsCreatingNewWorkspace] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [apps, setApps] = useState<TelegramAppProps[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [queryInput, setQueryInput] = useState<string>()

  const { push } = useRouter()
  const pathname = usePathname()

  const openModal = () => {
    setIsCreatingNewWorkspace(true)
  }

  const closeModal = () => {
    setIsCreatingNewWorkspace(false)
  }

  const categoryToList = {
    Web3: TelegramAppType.WEB3,
    Games: TelegramAppType.GAME,
    Utilities: TelegramAppType.UTILITY,
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    getData(category)
  }

  async function getData(category: string | null = null) {
    const { userSessionToken } = parseCookies()

    try {
      const res = await callAxiosBackend(
        'get',
        `/telegram/apps?chain=CROSSFI${
          category ? `&category=${category}` : ''
        }`,
        userSessionToken,
      )
      setApps(res)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }

  function NoWorkspaces() {
    return (
      <div className="mx-auto w-fit items-center justify-center">
        <SmileySad size={32} className="text-blue-500 mx-auto  mb-2" />
        <span>No Apps found</span>
      </div>
    )
  }

  const handleInputChange = (e) => {
    if (!isLoading) {
      setQueryInput(e.target.value)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [])

  return (
    <>
      <section className="relative z-10 overflow-hidden px-[5px] pb-16 text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="container text-[#fff]">
          <div className="mb-4 flex gap-4">
            {Object.keys(categoryToList).map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(categoryToList[category])}
                className={`rounded px-1 py-2 ${
                  selectedCategory === categoryToList[category]
                    ? 'bg-blue-500'
                    : 'bg-gray-700'
                } text-white`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="">
            <input
              type="text"
              id="workspaceName"
              name="workspaceName"
              maxLength={100}
              placeholder="Search apps"
              value={queryInput}
              onChange={handleInputChange}
              className="w-[300px] rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp md:w-[400px]"
            />
          </div>
          <div className="mb-3 mt-[50px] font-semibold">Community choices</div>
          <div className=" overflow-x-auto whitespace-nowrap">
            {apps.map((app, index) => (
              <a key={index} href={app.telegramUrl} className="inline-block">
                <div className="relative inline-block cursor-pointer rounded-[5px] px-3  text-center text-xs text-[#fff] hover:bg-[#13132c]">
                  <img
                    src={app.logoUrl}
                    alt="image"
                    className={`h-[60px] w-[60px] rounded-lg`}
                  />
                  <div
                    title={app.name}
                    className="mt-1 max-w-[60px] overflow-hidden truncate text-ellipsis whitespace-nowrap"
                  >
                    {app.name}
                  </div>
                </div>
              </a>
            ))}
          </div>
          {isLoading && (
            <div className="flex w-full justify-between gap-x-[30px]">
              <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
              <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
              <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
            </div>
          )}
          {apps?.length === 0 && !isLoading && (
            <div className="mt-[100px] w-full items-center">
              {NoWorkspaces()}
            </div>
          )}
        </div>
      </section>

      <NewWorkspaceModal isOpen={isCreatingNewWorkspace} onClose={closeModal} />
    </>
  )
}

export default Dashboard
