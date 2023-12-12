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

const NewWorkspaceModal = ({ isOpen, onClose }) => {
  const [workspaceName, setWorkspaceName] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const fileInputRef = useRef(null)

  const handleInputChange = (e) => {
    if (!isLoading) {
      setWorkspaceName(e.target.value)
    }
  }

  const handleOverlayClick = () => {
    // Fechar o modal quando a sobreposição escura é clicada
    onClose()
  }

  const handleModalClick = (e) => {
    // Impedir que o clique no modal propague para a sobreposição escura
    e.stopPropagation()
  }

  const handleFileChange = (e) => {
    if (isLoading) return

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
      onClose()
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }

  return (
    <div
      onClick={handleOverlayClick}
      className={`fixed  inset-0 z-50 flex items-center justify-center font-normal ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      } transition-opacity duration-300`}
    >
      <div
        onClick={handleModalClick}
        className="absolute inset-0 bg-black opacity-50"
      ></div>
      <div
        className="relative z-50 w-[250px] rounded-md bg-[#060621] p-8 md:w-[500px]"
        onClick={handleModalClick}
      >
        <div
          onClick={onClose}
          className="absolute right-5 top-2 cursor-pointer text-[18px] font-light"
        >
          x
        </div>
        <h2 className="mb-6 text-2xl">New Workspace</h2>
        <div>
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            Workspace logo
          </label>
        </div>
        <div
          className="groupLogo group relative mb-6 h-fit w-[60px] cursor-pointer"
          onClick={handleImageClick}
        >
          {selectedImage ? (
            <>
              <img
                src={selectedImage}
                className="w-[60px] rounded-full transition duration-300 ease-in-out group-hover:opacity-10"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 ease-in-out group-hover:opacity-100">
                <img
                  src="/images/dashboard/pencil.svg"
                  className="mb-1 w-[30px] rounded-full"
                />
              </div>
            </>
          ) : (
            <>
              <img
                src="/images/dashboard/work.webp"
                className="w-[60px] rounded-full transition duration-300 ease-in-out group-hover:opacity-10"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 ease-in-out group-hover:opacity-100">
                <img
                  src="/images/dashboard/pencil.svg"
                  className="mb-1 w-[30px] rounded-full"
                />
              </div>
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
        <div className="mt-10 flex justify-start">
          <div
            className={`${
              isLoading
                ? 'animate-pulse bg-[#8e68e829]'
                : 'cursor-pointer  hover:bg-[#8e68e829]'
            }  rounded-[5px] border-[1px] border-[#642EE7] p-[2px] px-[10px] text-[14px] text-[#642EE7] `}
            onClick={() => {
              handleCreateWorkspace()
            }}
          >
            Create
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewWorkspaceModal
