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
  createWorkspace,
  updateWorkspace,
  updateWorkspaceLogo,
} from '@/utils/api'
import nookies, { parseCookies } from 'nookies'
import { changePassword } from '@/utils/api-user'

const EditPasswordModal = ({ isOpen, onClose, onUpdate }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(null)
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(true)

  const modalRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (event) => {
    if (event.target === modalRef.current) {
      onClose()
    }
  }

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  const handleChangePassword = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match.')
      setIsLoading(false)
      return
    }

    const data = {
      password: newPassword,
      oldPassword: currentPassword,
    }

    try {
      await changePassword(data, userSessionToken)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    onUpdate()
    setIsLoading(false)
    setIsLoading(false)
    onClose()
    window.location.reload()
  }

  return (
    <div
      onClick={handleOverlayClick}
      className={`fixed  inset-0 z-50 flex items-center justify-center font-normal text-[#C5C4C4] ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      } transition-opacity duration-300`}
    >
      <div
        ref={modalRef}
        className="absolute inset-0 bg-[#1c1c3d]  opacity-80"
      ></div>
      <div className="relative z-50 w-[250px] rounded-md bg-[#060621] p-8 py-12 md:w-[500px]">
        <div onClick={onClose} className="absolute right-5 top-5">
          <img
            alt="delete"
            src="/images/delete.svg"
            className="w-[25px]  cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921]"
          ></img>
        </div>
        <h2 className="mb-6 text-xl">Change Password</h2>
        <div className="mb-4">
          <div className="mb-2 flex gap-x-[20px]">
            <label
              htmlFor="workspaceName"
              className="block text-[14px] text-[#C5C4C4]"
            >
              Current password
            </label>
            {passwordVisibility ? (
              <div
                onClick={() => setPasswordVisibility(false)}
                className="flex cursor-pointer items-center text-center"
              >
                <EyeSlash className="cursor-pointer text-[#C5C4C4]" />
              </div>
            ) : (
              <div
                onClick={() => setPasswordVisibility(true)}
                className="flex cursor-pointer items-center text-center"
              >
                <Eye className="cursor-pointer text-[#C5C4C4]" />
              </div>
            )}
          </div>
          <input
            type={passwordVisibility ? 'password' : 'text'}
            id="workspaceName"
            name="workspaceName"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value)
            }}
            className="w-full rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
          />
        </div>
        <div className="mb-4 mt-8">
          <div className="mb-2 flex gap-x-[20px]">
            <label
              htmlFor="workspaceName"
              className="block text-[14px] text-[#C5C4C4]"
            >
              New password
            </label>
          </div>

          <input
            type={passwordVisibility ? 'password' : 'text'}
            id="workspaceName"
            name="workspaceName"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
            }}
            className="w-full rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            Confirm new password
          </label>
          <input
            type={passwordVisibility ? 'password' : 'text'}
            id="workspaceName"
            name="workspaceName"
            value={confirmNewPassword}
            onChange={(e) => {
              setConfirmNewPassword(e.target.value)
            }}
            className="w-full rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
          />
        </div>
        {
          // eslint-disable-next-line prettier/prettier
        (currentPassword.length > 0 && newPassword.length > 0 && confirmNewPassword.length > 0) && (
              <div className="mt-10 flex justify-start">
                <div
                  className={`${
                    isLoading
                      ? 'animate-pulse bg-[#8e68e829]'
                      : 'cursor-pointer  hover:bg-[#8e68e829]'
                  }  rounded-[5px] border-[1px] border-[#642EE7] p-[2px] px-[10px] text-[14px] text-[#642EE7] `}
                  onClick={() => {
                    handleChangePassword()
                  }}
                >
                  Save
                </div>
              </div>
            )
        }
      </div>
    </div>
  )
}

export default EditPasswordModal
