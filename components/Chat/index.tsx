/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { getWorkspace } from '@/utils/api'
import nookies, { parseCookies, setCookie } from 'nookies'
import Sidebar from '../Sidebar'
import ChatSidebar from './ChatSidebar'
import { getUserChannels } from '@/utils/api-chat'
import Start from './Start'
import WebsocketComponent from './Websocket/WebsocketChat'
import { NewChannelMessageProps } from '@/types/chat'

const Chat = (id: any) => {
  const { push } = useRouter()

  //   useEffect(() => {
  //     window.scrollTo({
  //       top: 0,
  //       behavior: 'smooth',
  //     })
  //     if (id) {
  //       getData()
  //     } else {
  //       push('/dashboard')
  //     }
  //   }, [id])
  return (
    <>
      <div className="flex h-full">
        <div className="h-full flex-shrink-0">
          <Sidebar id={id.id} />
        </div>
        <div className="h-full flex-shrink-0">
          <ChatSidebar id={id.id} />
        </div>
      </div>
    </>
  )
}

export default Chat
