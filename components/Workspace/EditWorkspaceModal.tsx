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
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'

const EditWorkspaceModal = ({
  isOpen,
  onClose,
  onUpdate,
  previousWorkspaceName,
  previouslogoURL,
  workspaceId,
}) => {
  const [workspaceName, setWorkspaceName] = useState(previousWorkspaceName)
  const [hasLogoChanges, setHasLogoChanges] = useState(false)
  const [hasNameChanges, setHasNameChanges] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const fileInputRef = useRef(null)

  const handleInputChange = (e) => {
    if (!isLoading) {
      setHasNameChanges(true)
      setWorkspaceName(e.target.value)
    }
  }

  const modalRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (event) => {
    if (event.target === modalRef.current) {
      onClose()
    }
  }

  const handleFileChange = (e) => {
    if (isLoading) return
    setHasLogoChanges(true)
    const file = e.target.files[0]
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  const handleUpdateWorkspace = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()
    if (hasLogoChanges) {
      const formData = new FormData()
      formData.append('id', workspaceId)
      formData.append('files', selectedFile)

      try {
        await updateWorkspaceLogo(formData, userSessionToken)
      } catch (err) {
        console.log(err)
        toast.error(`Error: ${err.response.data.message}`)
      }
    }

    if (hasNameChanges) {
      const data = {
        id: workspaceId,
        name: workspaceName,
      }

      try {
        await updateWorkspace(data, userSessionToken)
      } catch (err) {
        console.log(err)
        toast.error(`Error: ${err.response.data.message}`)
      }
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
        className="absolute inset-0 bg-[#1c1c3d] opacity-80"
      ></div>
      <div className="relative z-50 w-[250px] rounded-md bg-[#060621] p-8 py-12 md:w-[500px]">
        <div onClick={onClose} className="absolute right-5 top-5">
          <img
            alt="delete"
            src="/images/delete.svg"
            className="w-[25px]  cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921]"
          ></img>
        </div>
        <h2 className="mb-6 text-xl">Edit Workspace</h2>
        <div>
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            Workspace logo
          </label>
        </div>
        <div
          className="groupLogo group relative mb-8 mt-[20px] h-fit w-[60px] max-w-[60px] cursor-pointer 2xl:w-[90px] 2xl:max-w-[90px]"
          onClick={handleImageClick}
        >
          {selectedImage ? (
            <>
              <img
                src={selectedImage}
                className="w-[60px] rounded-full transition duration-300 ease-in-out group-hover:opacity-10 2xl:w-[90px]"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 ease-in-out group-hover:opacity-100">
                <img
                  src="/images/dashboard/pencil.svg"
                  className="mb-1 w-[30px] rounded-full 2xl:w-[35px]"
                />
              </div>
            </>
          ) : (
            <>
              {previouslogoURL ? (
                <>
                  {' '}
                  <img
                    src={previouslogoURL}
                    className="w-[60px] rounded-full transition duration-300 ease-in-out group-hover:opacity-10 2xl:w-[90px]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 ease-in-out group-hover:opacity-100">
                    <img
                      src="/images/dashboard/pencil.svg"
                      className="mb-1 w-[30px] rounded-full 2xl:w-[35px]"
                    />
                  </div>
                </>
              ) : (
                <>
                  {' '}
                  <img
                    src="/images/dashboard/work.webp"
                    className="w-[60px] rounded-full transition duration-300 ease-in-out group-hover:opacity-10 2xl:w-[90px]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 ease-in-out group-hover:opacity-100">
                    <img
                      src="/images/dashboard/pencil.svg"
                      className="mb-1 w-[30px] rounded-full 2xl:w-[35px]"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".png, .jpg, .jpeg, .svg, .webp"
            style={{ display: 'none' }}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            Workspace name
          </label>
          <input
            type="text"
            id="workspaceName"
            name="workspaceName"
            value={workspaceName}
            onChange={handleInputChange}
            className="w-full rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
          />
        </div>
        {(hasNameChanges || hasLogoChanges) && (
          <div className="mt-10 flex justify-start">
            <div
              className={`${
                isLoading
                  ? 'animate-pulse !bg-[#35428a]'
                  : 'cursor-pointer  hover:bg-[#35428a]'
              }  rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
              onClick={() => {
                handleUpdateWorkspace()
              }}
            >
              Save
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditWorkspaceModal
