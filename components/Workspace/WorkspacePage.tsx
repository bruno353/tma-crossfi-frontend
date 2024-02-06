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
// import NewWorkspaceModal from './NewWorkspace'
import { getUserWorkspace, getWorkspace } from '@/utils/api'
import { WorkspaceProps } from '@/types/workspace'
import EditWorkspaceModal from './EditWorkspaceModal'
import WorkspaceMembers from './WorkspaceMembers'
import WorkspaceSettings from './WorkspaceSettings'
import SubNavBar from '../Modals/SubNavBar'
import WorkspaceAnalytics from './WorkspaceAnalytics'
import { Logo } from '../Sidebar/Logo'

const WorkspacePage = ({ id }) => {
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [workspaceNavBarSelected, setWorkspaceNavBarSelected] =
    useState('Members')
  const [workspace, setWorkspace] = useState<WorkspaceProps>()

  const { push } = useRouter()

  const openModal = () => {
    setIsEditingWorkspace(true)
  }

  const closeModal = () => {
    setIsEditingWorkspace(false)
  }

  async function getData() {
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    try {
      const res = await getWorkspace(data, userSessionToken)
      if (res) {
        setWorkspace(res)
        setIsLoading(false)
      } else {
        push('/dashboard')
      }
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      push('/dashboard')
    }
  }

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [id])

  if (isLoading) {
    return (
      <div className="container grid w-full gap-y-[30px] pt-36 text-[16px] md:pb-20 lg:pb-28 lg:pt-[180px]">
        <div className="h-20 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
        <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
      </div>
    )
  }

  return (
    <>
      <section className="relative z-10 overflow-hidden pb-16 pt-36 text-[16px] md:pb-20 lg:pb-28 lg:pt-[90px]">
        <div className="container text-[#fff]">
          <div className="flex items-center justify-between gap-x-[20px]">
            <div className="flex">
              <div className="text-[30px]">
                <Logo
                  name={workspace?.name}
                  workspaceUrl={workspace?.finalURL}
                  tamanho={'[70px]'}
                />
              </div>

              <div className="ml-[10px] mt-auto text-[24px] font-medium 2xl:ml-[20px]">
                {workspace?.name}
              </div>
            </div>
            {workspace?.isUserAdmin && (
              <div
                onClick={openModal}
                className="cursor-pointer rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]"
              >
                Edit workspace
              </div>
            )}
          </div>
          <div className="mt-[45px]">
            <SubNavBar
              onChange={(value) => {
                setWorkspaceNavBarSelected(value)
              }}
              selected={workspaceNavBarSelected}
              itensList={['Members', 'Analytics', 'Settings']}
            />
            <div className="mt-[50px]">
              {workspaceNavBarSelected === 'Analytics' && (
                <WorkspaceAnalytics
                  workspace={workspace}
                  isUserAdmin={workspace?.isUserAdmin}
                  onUpdate={getData}
                />
              )}
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

export default WorkspacePage
