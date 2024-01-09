/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
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
import { getChannel, getWorkspace } from '@/utils/api'
import nookies, { parseCookies, setCookie } from 'nookies'
import { getUserChannels } from '@/utils/api-chat'
import { ChannelProps } from '@/types/chat'
import { AccountContext } from '@/contexts/AccountContext'
import { channelTypeToLogo } from '@/types/consts/chat'

const Channel = (id: any) => {
  const { push } = useRouter()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { channel, setChannel } = useContext(AccountContext)
  const [isEditInfoOpen, setIsEditInfoOpen] = useState<any>()
  const [isMessageHovered, setIsMessageHovered] = useState<any>()

  async function getData(id: any) {
    const { userSessionToken } = parseCookies()
    setIsLoading(true)
    console.log('getting channels')
    console.log(id)
    console.log(userSessionToken)

    const data = {
      id,
    }

    let dado
    try {
      dado = await getChannel(data, userSessionToken)
      setChannel(dado)
      setIsLoading(false)
    } catch (err) {
      toast.error(`Error: ${err}`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    return dado
  }

  function formatDate(createdAt) {
    const date = new Date(createdAt)
    const now = new Date()

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    const formattedTime = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    if (isToday) {
      return `Today ${formattedTime}`
    } else {
      const formattedDate = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      return `${formattedDate} ${formattedTime}`
    }
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (id) {
      getData(id.id)
    }
  }, [id])

  return (
    <>
      <div className="relative flex h-screen w-full  bg-[#1D2144]  pb-16 text-[16px] text-[#C5C4C4] md:pb-20 lg:mt-[100px] lg:pb-28  2xl:text-[18px]">
        <div className="w-full">
          <div className="w-full border-b-[1px] border-[#141733] bg-[#1D2144] px-[40px] py-[20px]">
            <div className="flex gap-x-[5px]">
              <img
                src={channelTypeToLogo[channel?.type]}
                alt="image"
                className={'w-[16px] 2xl:w-[18px]'}
              />
              <div>{channel?.name}</div>
              {channel?.isPrivate && (
                <img
                  src={'/images/chat/lock.svg'}
                  alt="image"
                  className={'ml-[5px] w-[14px] 2xl:w-[16px]'}
                />
              )}
            </div>
          </div>
          <div className="max-h-[1000px] pt-[50px] text-[12px] font-light 2xl:text-[14px]">
            {channel?.messages?.map((message, index) => (
              <div key={index}>
                <div
                  onMouseEnter={() => setIsMessageHovered(message.id)}
                  onMouseLeave={() => setIsMessageHovered(null)}
                  className="flex items-start gap-x-[10px] px-[40px]  py-[5px] hover:bg-[#24232e63] 2xl:gap-x-[15px]"
                >
                  <img
                    alt="ethereum avatar"
                    src={message?.userWorkspace?.user?.profilePicture}
                    className="max-w-[35px] rounded-full"
                  ></img>
                  <div>
                    <div className="flex h-fit gap-x-[9px]">
                      <div>{message?.userWorkspace?.user?.name} </div>
                      <div className="my-auto text-[10px] text-[#888888] 2xl:text-[12px]">
                        {formatDate(message?.createdAt)}
                      </div>
                    </div>
                    <div>{message.content}</div>
                  </div>
                  {isMessageHovered === message.id && (
                    <div className="relative ml-auto">
                      {isEditInfoOpen === message.id && (
                        <div className="absolute flex w-fit -translate-x-[50%]   -translate-y-[100%]   items-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                          Edit
                        </div>
                      )}
                      <img
                        alt="ethereum avatar"
                        src="/images/chat/pencil.svg"
                        className="w-[20px] cursor-pointer 2xl:w-[25px]"
                        onMouseEnter={() => setIsEditInfoOpen(message.id)}
                        onMouseLeave={() => setIsEditInfoOpen(null)}
                      ></img>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Channel
