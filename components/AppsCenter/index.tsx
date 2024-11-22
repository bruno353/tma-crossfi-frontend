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
import { getUserWorkspace } from '@/utils/api'
import { WorkspaceProps } from '@/types/workspace'
import { Logo } from '../Sidebar/Logo'
import { workflowTypeToOptions } from '@/utils/consts'
import { callAxiosBackend } from '@/utils/general-api'

const AppsCenter = () => {
  const [isCreatingNewWorkspace, setIsCreatingNewWorkspace] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [workspaces, setWorkspaces] = useState<WorkspaceProps[]>([])

  const { push } = useRouter()
  const pathname = usePathname()

  const openModal = () => {
    setIsCreatingNewWorkspace(true)
  }

  const closeModal = () => {
    setIsCreatingNewWorkspace(false)
  }

  async function getData() {
    const { userSessionToken } = parseCookies()

    try {
      const res = await callAxiosBackend(
        'post',
        '/telegram/apps',
        userSessionToken,
      )
      //   const res = await getUserWorkspace(userSessionToken)
      setWorkspaces(res)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      push('/')
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

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [])

  return (
    <>
      <section className="relative z-10 overflow-hidden px-[20px] pb-16 text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="container text-[#fff]">
          <div className="flex items-center justify-between gap-x-[20px]">
            <div>Apps</div>
            {/* <div
              onClick={openModal}
              className={`${
                workspaces.length === 0 && 'animate-bounce'
              } cursor-pointer rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]`}
            >
              + New workspace
            </div> */}
          </div>
          <div className="mt-[50px] grid w-full grid-cols-3 gap-x-[30px] gap-y-[30px]">
            {workspaces.map((workspace, index) => (
              <a key={index} href={`/workspace/${workspace.id}`}>
                <div className="relative grid h-40 w-full cursor-pointer rounded-[5px]  border-[0.6px] border-[#c5c4c45e] bg-transparent  p-[20px] text-[#fff] hover:bg-[#13132c]">
                  <div className="flex items-start gap-x-[20px] overflow-hidden ">
                    <Logo
                      name={workspace.name}
                      workspaceUrl={workspace.finalURL}
                      tamanho={'[40px]'}
                    />
                    <div
                      title={workspace.name}
                      className="overflow-hidden truncate text-ellipsis whitespace-nowrap"
                    >
                      {workspace.name}
                    </div>
                  </div>
                  <div className="mt-auto text-[12px] text-[#C5C4C4]">
                    Created at: {workspace.createdAt}
                  </div>
                  <img
                    src={workflowTypeToOptions[workspace?.type]?.imgSource}
                    alt="image"
                    className={`absolute right-2 top-2 ${
                      workflowTypeToOptions[workspace?.type]?.imgStyleTitle
                    }`}
                  />
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
          {workspaces?.length === 0 && !isLoading && (
            <div className="mt-[100px] w-full items-center">
              {NoWorkspaces()}
            </div>
          )}
        </div>
      </section>

      {/* <NewWorkspaceModal isOpen={isCreatingNewWorkspace} onClose={closeModal} /> */}
    </>
  )
}

export default AppsCenter
