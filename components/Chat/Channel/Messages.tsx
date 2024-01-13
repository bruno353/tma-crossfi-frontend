/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import './try.css'
import { getChannel, getWorkspace } from '@/utils/api'
import nookies, { parseCookies, setCookie } from 'nookies'
import { getUserChannels, newMessageChannel } from '@/utils/api-chat'
import { ChannelProps } from '@/types/chat'
import { AccountContext } from '@/contexts/AccountContext'
import { channelTypeToLogo } from '@/types/consts/chat'
import DeleteMessageModal from '../Modals/DeleteMessageModal'
import dynamic from 'next/dynamic'

import DeleteChannelModal from '../Modals/DeleteChannelModal'
import EditChannelModal from '../Modals/EditChannelModal'
import {
  formatDate,
  formatDateWithoutTime,
  getDifferenceInSeconds,
  getSanitizeText,
  isDifferentDay,
} from '@/utils/functions'

const QuillNoSSRWrapper = dynamic(import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

export interface MessagesI {
  channel: ChannelProps
  isLoading: boolean
  handleMessageDeleted(string): void
}

const Messages = ({ channel, isLoading, handleMessageDeleted }: MessagesI) => {
  const [isEditInfoOpen, setIsEditInfoOpen] = useState<any>()

  const [isDeleteInfoOpen, setIsDeleteInfoOpen] = useState<any>()
  const [isDeleteMessageOpen, setIsDeleteMessageOpen] = useState<any>()

  const [isDeleteChannelInfoOpen, setIsDeleteChannelInfoOpen] = useState<any>()
  const [isDeleteChannelOpen, setIsDeleteChannelOpen] = useState<any>()

  const [isEditChannelInfoOpen, setIsEditChannelInfoOpen] = useState<any>()
  const [isEditChannelOpen, setIsEditChannelOpen] = useState<any>()

  const [isEditMessageOpen, setIsEditMessageOpen] = useState<any>()
  const [isMessageHovered, setIsMessageHovered] = useState<any>()
  const [editorHtml, setEditorHtml] = useState('')
  const [newMessageHtml, setNewMessageHtml] = useState('')

  function handleChangeEditor(value) {
    if (editorHtml.length < 5000) {
      setEditorHtml(value)
    }
  }

  const menuRef = useRef(null)
  const messagesEndRef = useRef(null)
  const deleteChannelRef = useRef(null)

  const scrollToBottomInstant = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
  }

  const scrollToBottomSmooth = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const closeMenu = () => {
    setIsDeleteMessageOpen(false)
  }

  const closeMenuDeleteChannel = () => {
    setIsDeleteChannelOpen(false)
  }

  const editSave = () => {
    console.log('message saved')
    setIsEditMessageOpen(false)
  }

  useEffect(() => {
    if (channel?.messages?.length > 0) {
      console.log(
        'the new message: ' +
          JSON.stringify(channel?.messages[channel?.messages.length - 1]),
      )
      if (
        !channel?.messages[channel?.messages.length - 1]?.[
          'newMessageFromOtherUser'
        ] &&
        !channel?.messages[channel?.messages.length - 1]?.['newMessageFromUser']
      ) {
        console.log('scroll instant')
        scrollToBottomInstant()
      } else if (
        channel?.messages[channel?.messages.length - 1]?.['newMessageFromUser']
      ) {
        console.log('scroll smooth')
        scrollToBottomSmooth()
      }
    }
  }, [channel?.messages])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Clicked outside of the menu, so close it
        closeMenu()
      }
    }

    // Add event listener when the menu is open
    if (isDeleteMessageOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      // Remove event listener when the menu is closed
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDeleteMessageOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        deleteChannelRef.current &&
        !deleteChannelRef.current.contains(event.target)
      ) {
        // Clicked outside of the menu, so close it
        closeMenuDeleteChannel()
      }
    }

    // Add event listener when the menu is open
    if (isDeleteChannelOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      // Remove event listener when the menu is closed
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDeleteChannelOpen])

  const handleKeyPress = (event) => {
    console.log('key press called')
    if (isEditMessageOpen) {
      if (
        event.key === 'Enter' &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
      ) {
        editSave()
      } else if (event.key === 'Escape') {
        setIsEditMessageOpen(false)
      }
    }
  }

  useEffect(() => {
    // Adiciona o event listener
    document.addEventListener('keydown', handleKeyPress)

    // Remove o event listener quando o componente é desmontado
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isEditMessageOpen, newMessageHtml])

  return (
    <div className="mr-[20px] flex h-full flex-1 flex-col overflow-y-auto pt-5 text-[12px] font-light scrollbar-thin scrollbar-track-[#11132470] scrollbar-thumb-[#0e101f] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:text-[14px]">
      {isLoading ? (
        <div className="mt-auto grid gap-y-[40px]  px-[40px] pb-[20px]">
          <div className="flex animate-pulse gap-x-[10px]   2xl:gap-x-[15px]">
            <div className="h-[40px] w-[40px] rounded-full bg-[#dfdfdf]"> </div>
            <div className="mt-auto h-[40px]  w-full  rounded-[3px] bg-[#dfdfdf]"></div>
          </div>
          <div className="flex animate-pulse gap-x-[10px]   2xl:gap-x-[15px]">
            <div className="h-[40px] w-[40px] rounded-full bg-[#dfdfdf]"> </div>
            <div className="mt-auto h-[40px]  w-full  rounded-[3px] bg-[#dfdfdf]"></div>
          </div>
          <div className="flex animate-pulse gap-x-[10px]   2xl:gap-x-[15px]">
            <div className="h-[40px] w-[40px] rounded-full bg-[#dfdfdf]"> </div>
            <div className="mt-auto h-[40px]  w-full  rounded-[3px] bg-[#dfdfdf]"></div>
          </div>
        </div>
      ) : (
        <>
          {channel?.messages?.length === 0 && (
            <div className="mt-auto px-[40px] pb-[50px]">
              <div className="flex gap-x-[7px] text-[21px] font-medium text-[#fff] 2xl:gap-x-[10px] 2xl:text-[25px]">
                <div> Start in #{channel?.name}</div>
                {channel?.isPrivate && (
                  <img
                    src={'/images/chat/lock.svg'}
                    alt="image"
                    className={'ml-[5px] w-[14px] 2xl:w-[16px]'}
                  />
                )}
              </div>
              <div className="">Send a message to start your conversation</div>
            </div>
          )}
          <div className="mt-auto">
            {channel?.messages?.map((message, index) => {
              const showDaySeparator =
                index === 0 ||
                isDifferentDay(
                  message.createdAt,
                  channel.messages[index - 1].createdAt,
                )
              const differenceInSecods =
                index === 0 ||
                getDifferenceInSeconds(
                  message.createdAt,
                  channel.messages[index - 1].createdAt,
                )
              // eslint-disable-next-line prettier/prettier
              const sameUser = (differenceInSecods !== true && differenceInSecods < 360) && (!showDaySeparator)
              return (
                <div key={message.id}>
                  {showDaySeparator && (
                    <div className="flex w-full items-center justify-center gap-x-[7px] px-[40px] text-[9px]  2xl:text-[11px] ">
                      <div className="h-[1px] w-full border-b-[1px] border-[#88888831]"></div>
                      <div className="flex-shrink-0">
                        {formatDateWithoutTime(message?.createdAt)}
                      </div>
                      <div className="h-[1px] w-full border-b-[1px] border-[#88888831]"></div>
                    </div>
                  )}
                  <div
                    onMouseEnter={() => setIsMessageHovered(message.id)}
                    onMouseLeave={() => {
                      if (!isDeleteMessageOpen) {
                        setIsMessageHovered(null)
                      }
                    }}
                    className="flex items-start gap-x-[10px] px-[40px]  py-[20px] hover:bg-[#24232e63] 2xl:gap-x-[15px]"
                  >
                    {sameUser && (
                      <img
                        alt="ethereum avatar"
                        src={message?.userWorkspace?.user?.profilePicture}
                        className="max-w-[35px] rounded-full"
                      ></img>
                    )}

                    <div>
                      <div className="flex h-fit gap-x-[9px]">
                        <div>{message?.userWorkspace?.user?.name} </div>
                        <div className="my-auto text-[10px] text-[#888888] 2xl:text-[12px]">
                          {formatDate(message?.createdAt)}
                        </div>
                      </div>
                      {isEditMessageOpen ? (
                        <>
                          <QuillNoSSRWrapper
                            value={editorHtml}
                            onChange={handleChangeEditor}
                            // disabled={isLoading}
                            className="my-quill mt-2 w-[280px]  rounded-md bg-[#787ca536] text-base font-normal text-[#fff] outline-0 lg:w-[900px]"
                            // maxLength={5000}
                            placeholder="Type here"
                          />
                          <div className="mt-[10px] text-[10px]">
                            enter to <span className="text-[#fff]">save</span> -
                            esc to <span className="text-[#fff]">cancel</span>
                          </div>
                        </>
                      ) : (
                        <div>{getSanitizeText(message.content)}</div>
                      )}
                    </div>
                    {isMessageHovered === message.id && (
                      <div className="relative ml-auto flex items-center gap-x-[10px]">
                        <div>
                          {' '}
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
                            onClick={() => {
                              setIsEditMessageOpen(message.id)
                            }}
                          ></img>{' '}
                        </div>
                        <div>
                          {' '}
                          {isDeleteInfoOpen === message.id && (
                            <div className="absolute flex w-fit -translate-x-[50%]   -translate-y-[120%]   items-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                              Delete
                            </div>
                          )}
                          {isDeleteMessageOpen === message.id && (
                            <div
                              ref={menuRef}
                              className="absolute z-50   -translate-x-[100%]  -translate-y-[120%]"
                            >
                              <DeleteMessageModal
                                messageId={message.id}
                                onUpdateM={() => {
                                  handleMessageDeleted(message.id)
                                }}
                              />{' '}
                            </div>
                          )}
                          <img
                            alt="ethereum avatar"
                            src="/images/delete.svg"
                            className="w-[14px] cursor-pointer 2xl:w-[18px]"
                            onMouseEnter={() => setIsDeleteInfoOpen(message.id)}
                            onMouseLeave={() => setIsDeleteInfoOpen(null)}
                            onClick={() => {
                              setIsDeleteMessageOpen(message.id)
                            }}
                          ></img>{' '}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}

export default Messages
