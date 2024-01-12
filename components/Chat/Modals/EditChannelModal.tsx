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
import { editChannel } from '@/utils/api'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { Switch } from '@chakra-ui/react'

const EditChannelModal = ({
  isOpen,
  onClose,
  onChannelUpdate,
  isPreviousPrivate,
  previousName,
  channelType,
  channelId,
}) => {
  const [channelName, setChannelName] = useState(previousName)
  const [isPrivate, setIsPrivate] = useState(isPreviousPrivate)
  const [isLoading, setIsLoading] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  const channelTypeToLogo = {
    TEXT: '/images/chat/hashtag.svg',
    AUDIO: '/images/chat/volume.svg',
    VIDEO: '/images/chat/volume.svg',
  }

  const handleInputChange = (e) => {
    if (!isLoading) {
      setChannelName(e.target.value)
      setHasChanges(true)
    }
  }

  const handleToggleChange = (e) => {
    setIsPrivate(e.target.checked)
    setHasChanges(true)
  }

  const handleOverlayClick = () => {
    // Fechar o modal quando a sobreposição escura é clicada
    onClose()
  }

  const handleModalClick = (e) => {
    // Impedir que o clique no modal propague para a sobreposição escura
    e.stopPropagation()
  }

  const handleUpdateChannel = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const final = {
      channelId,
      name: channelName,
      isPrivate,
    }

    try {
      await editChannel(final, userSessionToken)
      onChannelUpdate()
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
        <div onClick={onClose} className="absolute right-5 top-2">
          <img
            alt="delete"
            src="/images/delete.svg"
            className="w-[25px]  cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921]"
          ></img>
        </div>

        <div className="mb-6">
          <h2 className="mb-1 text-xl text-[#C5C4C4]">Edit channel</h2>
          <div className="flex gap-x-[5px]">
            <img
              src={channelTypeToLogo[channelType]}
              alt="image"
              className={`w-[12px]`}
            />
            <div className="text-[10px] text-[#C5C4C4]">{channelType}</div>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            Channel name
          </label>
          <input
            type="text"
            id="workspaceName"
            name="workspaceName"
            value={channelName}
            onChange={handleInputChange}
            className="w-full rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
          />
        </div>
        <div className="mb-4 flex justify-between">
          <div>
            <div className="mb-2 block text-[14px] text-[#C5C4C4]">
              Private channel
            </div>
            <div className="text-[10px] text-[#C5C4C4] 2xl:text-[11px]">
              Only admins can interact with this chat
            </div>
          </div>

          <div className="flex items-center justify-between gap-x-[10px]">
            <div>
              <Switch
                id="email-alerts"
                isChecked={isPrivate}
                onChange={handleToggleChange}
                colorScheme="purple"
              />
            </div>
          </div>
        </div>
        {hasChanges && (
          <div className="mt-10 flex justify-start">
            <div
              className={`${
                isLoading
                  ? 'animate-pulse bg-[#8e68e829]'
                  : 'cursor-pointer  hover:bg-[#8e68e829]'
              }  rounded-[5px] border-[1px] border-[#642EE7] p-[2px] px-[10px] text-[14px] text-[#642EE7] `}
              onClick={() => {
                if (!isLoading) {
                  handleUpdateChannel()
                }
              }}
            >
              Update
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditChannelModal
