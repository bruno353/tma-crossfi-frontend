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
import { getUserWorkspace } from '@/utils/api'
import { WorkspaceProps } from '@/types/workspace'

const Account = () => {
  const [isCreatingNewWorkspace, setIsCreatingNewWorkspace] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settingsNavBarSelected, setSettingsNavBarSelected] =
    useState('General')
  const { user } = useContext(AccountContext)

  const openModal = () => {
    setIsCreatingNewWorkspace(true)
  }

  const closeModal = () => {
    setIsCreatingNewWorkspace(false)
  }

  //   async function getData() {
  //     const { userSessionToken } = parseCookies()

  //     try {
  //       const res = await getUserWorkspace(userSessionToken)
  //       setWorkspaces(res)
  //       setIsLoading(false)
  //     } catch (err) {
  //       console.log(err)
  //       toast.error(`Error: ${err.response.data.message}`)
  //       setIsLoading(false)
  //     }
  //   }

  //   function NoWorkspaces() {
  //     return (
  //       <div className="mx-auto w-fit items-center justify-center">
  //         <SmileySad size={32} className="text-blue-500 mx-auto  mb-2" />
  //         <span>No workspaces found</span>
  //       </div>
  //     )
  //   }

  useEffect(() => {
    // setIsLoading(true)
    // getData()
  }, [])

  if (user) {
    return (
      <>
        <section className="relative z-10 overflow-hidden pb-16 pt-36 text-[16px] md:pb-20 lg:pb-28 lg:pt-[90px]">
          <div className="container text-[#fff]">
            <div className="flex items-center justify-between gap-x-[20px]">
              <div className="flex">
                <img
                  alt="logo"
                  src={user.profilePicture}
                  className="w-[70px] max-w-[70px] rounded-full transition duration-300 ease-in-out group-hover:opacity-10"
                />
                <div className="ml-[10px] mt-auto text-[24px] font-medium 2xl:ml-[20px]">
                  {user.name}
                </div>
              </div>
              {/* {workspace?.isUserAdmin && (
                <div
                  onClick={openModal}
                  className="cursor-pointer rounded-[5px] border-[1px] border-[#642EE7] p-[2px] px-[10px] text-[14px] text-[#642EE7] hover:bg-[#8e68e829]"
                >
                  Edit workspace
                </div>
              )} */}
            </div>
            <div className="mt-[45px]">
              <WorkspaceNavBar
                onChangeSettings={() => {
                  console.log('settings selected')
                  setWorkspaceNavBarSelected('Settings')
                }}
                onChangeMembers={() => {
                  console.log('members selected')
                  setWorkspaceNavBarSelected('Members')
                }}
                selected={workspaceNavBarSelected}
              />
              <div className="mt-[50px]">
                {workspaceNavBarSelected === 'Members' && (
                  <WorkspaceMembers
                    users={workspace?.UserWorkspace}
                    id={id}
                    isUserAdmin={workspace?.isUserAdmin}
                    onUpdate={getData}
                  />
                )}
                {workspaceNavBarSelected === 'Settings' && (
                  <WorkspaceSettings
                    id={id}
                    isUserAdmin={workspace?.isUserAdmin}
                    onUpdate={getData}
                  />
                )}
              </div>
            </div>
            <div className="mt-[50px] grid w-full grid-cols-3 gap-x-[30px] gap-y-[30px]"></div>
          </div>
        </section>
        <EditWorkspaceModal
          isOpen={isEditingWorkspace}
          onClose={closeModal}
          onUpdate={getData}
          previousWorkspaceName={workspace?.name}
          previouslogoURL={workspace?.finalURL}
          workspaceId={workspace?.id}
        />
      </>
    )
  }
  return (
    <div className="container grid w-full gap-y-[30px] pt-36 text-[16px] md:pb-20 lg:pb-28 lg:pt-[180px]">
      <div className="h-20 w-full animate-pulse rounded-[5px] bg-[#dfdfdf]"></div>
      <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#dfdfdf]"></div>
    </div>
  )
}

export default Account
