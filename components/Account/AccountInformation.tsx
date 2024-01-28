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
import {
  changeUserWorkspaceRole,
  createWorkspace,
  inviteUserToWorkspace,
  updateWorkspace,
  updateWorkspaceLogo,
} from '@/utils/api'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { UserWorkspaceProps } from '@/types/workspace'
import { AccountContext } from '../../contexts/AccountContext'
import { editUser } from '@/utils/api-user'
import EditPasswordModal from './EditPasswordModal'

export interface AccountInformationI {
  onUpdate(): void
}

const AccountInfo = ({ onUpdate }: AccountInformationI) => {
  const { user, setUser } = useContext(AccountContext)

  const [isLoading, setIsLoading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [hasChange, setHasChange] = useState(false)
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState<any>()
  const [isUserModalOpen, setIsUserModalOpen] = useState<any>()
  const [newNameUser, setNewNameUser] = useState<any>(user?.name)

  const [selected, setSelected] = useState<any>('normal')

  const menuRef = useRef(null)

  const handleInputChange = (e) => {
    if (!isLoading) {
      setHasChange(true)
      setNewNameUser(e.target.value)
    }
  }

  const openModal = () => {
    setIsChangingPassword(true)
  }

  const closeModal = () => {
    setIsChangingPassword(false)
  }

  const handleUpdateUser = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const data = {
      name: newNameUser,
    }

    try {
      await editUser(data, userSessionToken)
      const newUser = { ...user }
      newUser.name = newNameUser
      setUser(newUser)
      setHasChange(false)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  const closeMenu = () => {
    setIsDeleteUserOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Clicked outside of the menu, so close it
        closeMenu()
      }
    }

    // Add event listener when the menu is open
    if (isDeleteUserOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      // Remove event listener when the menu is closed
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDeleteUserOpen])

  return (
    <div className="pb-[80px] text-[14px] text-[#C5C4C4]">
      <div className="flex gap-x-[50px]">
        <div>
          <label htmlFor="workspaceName" className="mb-4 block text-[16px]">
            Account information
          </label>
          <div className="mt-[30px]  gap-x-[20px]">
            <label htmlFor="workspaceName" className="mb-4 block text-[12px]">
              Email
            </label>
            <input
              type="text"
              disabled={true}
              id="workspaceName"
              name="workspaceName"
              maxLength={200}
              value={user?.email}
              className="w-[300px] rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp md:w-[400px]"
            />
          </div>
          <div className="mt-[20px]  gap-x-[20px]">
            <label htmlFor="workspaceName" className="mb-4 block text-[12px]">
              Name
            </label>
            <input
              type="text"
              id="workspaceName"
              name="workspaceName"
              maxLength={200}
              value={newNameUser}
              onChange={handleInputChange}
              className="w-[300px] rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp md:w-[400px]"
            />
          </div>
          {hasChange && newNameUser?.length > 0 && (
            <div
              className={`${
                isLoading
                  ? 'animate-pulse !bg-[#35428a]'
                  : 'cursor-pointer  hover:bg-[#35428a]'
              } mt-[35px] w-fit  items-center rounded-[5px]  bg-[#273687] p-[2px] px-[10px] text-center text-[14px] text-[#fff] `}
              onClick={() => {
                handleUpdateUser()
              }}
            >
              Update profile
            </div>
          )}
        </div>
        <div
          className={`${
            isLoading
              ? 'animate-pulse !bg-[#35428a]'
              : 'cursor-pointer  hover:bg-[#35428a]'
          } h-fit w-fit  items-center rounded-[5px]  bg-[#273687] p-[2px] px-[10px] text-center text-[14px] text-[#fff] `}
          onClick={() => {
            openModal()
          }}
        >
          Change password
        </div>
      </div>
      <EditPasswordModal
        isOpen={isChangingPassword}
        onClose={closeModal}
        onUpdate={closeModal}
      />
    </div>
  )
}

export default AccountInfo
