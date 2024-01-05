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

const Channel = (id: any) => {
  const { push } = useRouter()

  const [channel, setChannel] = useState<ChannelProps>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

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
      <div className="relative z-10 flex h-screen w-fit overflow-hidden  px-[20px] pb-16 pt-5 text-[16px] text-[#C5C4C4] md:pb-20 lg:mt-[100px] lg:pb-28 2xl:pr-[30px] 2xl:text-[18px]">
        {id.id}
      </div>
    </>
  )
}

export default Channel
