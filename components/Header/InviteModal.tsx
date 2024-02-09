/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext, useRef } from 'react'
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
import { createWorkspace } from '@/utils/api'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { WorkspaceInviteProps } from '@/types/workspace'

export interface InviteModalI {
  workspaceInvite: WorkspaceInviteProps
  isOpen: boolean
  onClose(): void
}

const InviteModal = ({ isOpen, workspaceInvite }: InviteModalI) => {
  const [workspaceName, setWorkspaceName] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const fileInputRef = useRef(null)

  const handleCreateWorkspace = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const formData = new FormData()
    formData.append('name', workspaceName)
    formData.append('files', selectedFile)

    try {
      await createWorkspace(formData, userSessionToken)
      setIsLoading(false)
      toast.success(`Success`)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`fixed  inset-0 z-50 flex items-center justify-center font-normal text-[#C5C4C4] backdrop-blur-sm ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      } transition-opacity duration-300`}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-50 w-[250px] rounded-md bg-[#060621] p-8 md:w-[500px]">
        <div className="absolute right-5 top-2 cursor-pointer text-[18px] font-light text-[#C5C4C4]">
          x
        </div>
        <h2 className="mb-6 text-xl">New Workspace Invitation</h2>
        <div className="mb-2 block text-[14px] text-[#C5C4C4]">
          You have been invited to join {workspaceInvite?.workspace?.name}
        </div>
        <div>Invite at: {workspaceInvite?.createdAt}</div>
        <div className="mt-10 flex justify-start">
          <div
            className={`${
              isLoading
                ? 'animate-pulse !bg-[#35428a]'
                : 'cursor-pointer  hover:bg-[#35428a]'
            }  rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
            onClick={() => {
              handleCreateWorkspace()
            }}
          >
            Join workspace
          </div>
        </div>
      </div>
    </div>
  )
}

export default InviteModal
