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
import nookies, { parseCookies, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
import Link from 'next/link'
import NewWorkspaceModal from './NewWorkspace'
import { getUserWorkspace } from '@/utils/api'
import { WorkspaceProps } from '@/types/workspace'

const Dashboard = () => {
  const [isCreatingNewWorkspace, setIsCreatingNewWorkspace] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [workspaces, setWorkspaces] = useState<WorkspaceProps[]>([])

  const openModal = () => {
    setIsCreatingNewWorkspace(true)
  }

  const closeModal = () => {
    setIsCreatingNewWorkspace(false)
  }

  async function getData() {
    const { userSessionToken } = parseCookies()

    try {
      const res = await getUserWorkspace(userSessionToken)
      setWorkspaces(res)
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
        <span>No workspaces found</span>
      </div>
    )
  }

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [])

  return (
    <>
      <section className="relative z-10 overflow-hidden pb-16 pt-36 text-[16px] md:pb-20 lg:pb-28 lg:pt-[180px]">
        <div className="container text-[#fff]">
          <div className="flex items-center justify-between gap-x-[20px]">
            <div>Dashboard</div>
            <div
              onClick={openModal}
              className="cursor-pointer rounded-[5px] border-[1px] border-[#642EE7] p-[2px] px-[10px] text-[14px] text-[#642EE7] hover:bg-[#8e68e829]"
            >
              + New workspace
            </div>
          </div>
          <div className="mt-[50px] flex w-full justify-between gap-x-[30px]">
            {workspaces.map((workspace, index) => (
              <div
                key={index}
                className="grid h-40 w-1/3 cursor-pointer rounded-[5px]  bg-[#504E5E]  p-[20px] text-[#fff] hover:bg-[#777584]"
              >
                <div className="flex items-start gap-x-[20px]">
                  <img
                    src={workspace.logoURL}
                    alt="image"
                    className="w-[90px] rounded-full"
                  />
                  <div>{workspace.name}</div>
                </div>
                <div className="mt-auto text-[12px] text-[#C5C4C4]">
                  Created at: {workspace.createdAt}
                </div>
              </div>
            ))}
          </div>
          {isLoading && (
            <div className="flex w-full justify-between gap-x-[30px]">
              <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#dfdfdf]"></div>
              <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#dfdfdf]"></div>
              <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#dfdfdf]"></div>
            </div>
          )}
          {workspaces.length === 0 && !isLoading && (
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
