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
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { Switch } from '@chakra-ui/react'
import { createChannel } from '@/utils/api-chat'

const NewAppModal = ({ isOpen, onClose, onChannelCreated, workspaceId }) => {
  const [channelName, setChannelName] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const [selected, setSelected] = useState<any>('ICP')

  const optionsNetwork = [
    {
      name: 'Internet computer protocol',
      value: 'ICP',
    },
  ]

  const handleInputChange = (e) => {
    if (!isLoading) {
      setChannelName(e.target.value)
    }
  }

  const handleToggleChange = (e) => {
    setIsPrivate(e.target.checked)
  }

  const handleCreateChannel = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const final = {
      workspaceId,
      name: channelName,
      isPrivate,
    }

    try {
      await createChannel(final, userSessionToken)
      onChannelCreated()
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsLoading(false)
      toast.success(`Success`)
      onClose()
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }
  const modalRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (event) => {
    if (event.target === modalRef.current) {
      onClose()
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
        <div className="mb-6">
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            App name
          </label>
          <input
            type="text"
            maxLength={50}
            id="workspaceName"
            name="workspaceName"
            value={channelName}
            onChange={handleInputChange}
            className="w-full rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            Network
          </label>
          <select
            className="w-full cursor-pointer rounded-md bg-[#242B51] px-[5px] py-[7px] text-[#C5C4C4]"
            onChange={(option) => setSelected(option.target.value)}
            value={selected}
          >
            {optionsNetwork.map((option) => (
              <option key={option.name} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-10 flex justify-start">
          <div
            className={`${
              isLoading
                ? 'animate-pulse bg-[#8e68e829]'
                : 'cursor-pointer  hover:bg-[#8e68e829]'
            }  rounded-[5px] border-[1px] border-[#642EE7] p-[2px] px-[10px] text-[14px] text-[#642EE7] `}
            onClick={() => {
              if (!isLoading) {
                handleCreateChannel()
              }
            }}
          >
            Create
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewAppModal
