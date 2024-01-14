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
import { getWorkspace } from '@/utils/api'
import nookies, { parseCookies, setCookie } from 'nookies'
import { getUserChannels } from '@/utils/api-chat'
import {
  ChannelProps,
  NewChannelMessageProps,
  NewConversationMessageProps,
} from '@/types/chat'
import NewChannelModal from '../Modals/NewChannelModal'
import { AccountContext } from '@/contexts/AccountContext'
import { UserWorkspaceProps } from '@/types/workspace'
import UserWorkspaceInfoModal from '@/components/Workspace/UserWorkspaceInfoModal'
import { channelTypeToLogo } from '@/types/consts/chat'
import WebsocketComponent from '../Websocket/WebsocketChat'

const ChatSidebar = (id: any) => {
  const [isCreatingNewChannel, setIsCreatingNewChannel] = useState(false)
  const [isCreatingNewChannelType, setIsCreatingNewChannelType] = useState('')
  const [users, setUsers] = useState<UserWorkspaceProps[]>()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    workspace,
    setWorkspace,
    channels,
    setChannels,
    channel,
    setConversations,
    conversations,
    user,
  } = useContext(AccountContext)
  const [isUserModalOpen, setIsUserModalOpen] = useState<any>()

  const { push } = useRouter()
  const pathname = usePathname()

  function handleNewChannelMessageTreatment(message: NewChannelMessageProps) {
    console.log(message)
    if (channels?.length > 0) {
      const newChannels = [...channels]

      newChannels.find((channel) => {
        if (channel.id === message.channelId) {
          channel.hasNewMessages = true
          return true
        }
        return false
      })
      setChannels(newChannels)
    }
  }

  function handleNewConversationMessageTreatment(
    message: NewConversationMessageProps,
  ) {
    console.log(message)
    if (conversations?.length > 0) {
      const newConversations = [...conversations]

      newConversations.find((conv) => {
        if (conv.id === message.message.conversationId) {
          conv.hasNewMessages = true
          return true
        }
        return false
      })
      setConversations(newConversations)
    }
  }

  const [sidebarOption, setSidebarOption] = useState<any>({
    TEXT: true,
    AUDIO: true,
    VIDEO: true,
  })

  const channelOption = [
    {
      name: 'Text chats',
      type: 'TEXT',
    },
    {
      name: 'Audio chats',
      type: 'AUDIO',
    },
    {
      name: 'Video chats',
      type: 'VIDEO',
    },
  ]

  const handleSidebarClick = (type) => {
    const newSideBar = { ...sidebarOption }
    newSideBar[type] = !sidebarOption[type]

    console.log('newSidebar')
    console.log(newSideBar)
    setSidebarOption(newSideBar)
  }

  const closeModal = () => {
    setIsCreatingNewChannel(false)
  }

  async function getData(id: any) {
    const { userSessionToken } = parseCookies()
    console.log('getting channels')
    console.log(id)
    console.log(userSessionToken)

    const data = {
      id,
    }

    let dado
    try {
      dado = await getUserChannels(data, userSessionToken)
      console.log('channels q recebi')
      console.log(dado)
      setChannels(dado?.channels)
      setUsers(dado?.channels.generalUsersWorkspace)
      setConversations(dado?.conversations)
    } catch (err) {
      toast.error(`Error: ${err}`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    return dado
  }

  useEffect(() => {
    if (id) {
      console.log(id)
      console.log(id.id)
      getData(id.id)
    }
  }, [id])

  return (
    <>
      <div className="relative z-10 flex h-[90vh] w-fit border-r-[1px] border-[#141733] bg-[#1D2144] px-[20px] pb-2 pt-5 text-[16px] text-[#C5C4C4]  lg:pt-[50px] 2xl:pr-[30px] 2xl:text-[18px]">
        <div>
          <div className="text-[12px] font-light  2xl:text-[14px]">
            {channelOption.map((option, index) => (
              <div key={index} className="mb-[30px]">
                <div className={`mb-1 flex min-w-[150px] items-center`}>
                  <div
                    onClick={() => {
                      handleSidebarClick(option.type)
                    }}
                    className={`flex cursor-pointer gap-x-[5px] hover:text-[#fff]`}
                  >
                    <img
                      src="/images/chat/arrow-down.svg"
                      alt="image"
                      className={`w-[8px]  ${
                        !sidebarOption[option.type] && '-rotate-90'
                      }`}
                    />
                    <div>{option.name}</div>
                  </div>

                  {workspace?.isUserAdmin && (
                    <div
                      onClick={() => {
                        setIsCreatingNewChannel(true)
                        setIsCreatingNewChannelType(option.type)
                      }}
                      className="ml-auto cursor-pointer text-[17px] font-normal hover:text-[#fff]"
                    >
                      +
                    </div>
                  )}
                </div>
                {sidebarOption[option.type] &&
                  channels &&
                  channels?.length > 0 && (
                    <div>
                      {channels?.map((optionChannel, index) => (
                        <div key={index}>
                          {option.type === optionChannel.type && (
                            <div
                              onClick={() => {
                                const basePath = pathname.split('/')
                                const newPath = `/${basePath[1]}/${basePath[2]}/${basePath[3]}/channel/${optionChannel.id}`
                                console.log(newPath)
                                push(newPath)
                              }}
                              className="mb-[7px] flex cursor-pointer gap-x-[3px] 2xl:gap-x-[3px]"
                            >
                              <img
                                src={channelTypeToLogo[option.type]}
                                alt="image"
                                className={'w-[14px] 2xl:w-[16px]'}
                              />
                              <div
                                title={optionChannel.name}
                                className={`max-w-[120px] overflow-hidden truncate text-ellipsis whitespace-nowrap hover:text-[#fff] 2xl:max-w-[150px]  ${
                                  channel?.id === optionChannel.id &&
                                  'text-[#fff]'
                                }`}
                              >
                                {' '}
                                {optionChannel.name}{' '}
                              </div>
                              {optionChannel.isPrivate && (
                                <img
                                  src={'/images/chat/lock.svg'}
                                  alt="image"
                                  className={'w-[12px] 2xl:w-[14px]'}
                                />
                              )}
                              {optionChannel.hasNewMessages && (
                                <div className="h-[6px] w-[6px] rounded-full bg-[#fff]  2xl:h-[8px] 2xl:w-[8px]"></div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
          <div className="mt-[30px] grid min-w-[250px] gap-y-[10px] 2xl:mt-[40px]">
            <div className="mb-[10px] text-[12px]  font-light 2xl:text-[14px]">
              Members
            </div>
            {workspace?.UserWorkspace?.map((workspaceUser, index) => (
              <div key={index}>
                {workspaceUser.userId !== user.id && (
                  <div
                    onClick={() => {
                      const basePath = pathname.split('/')
                      const newPath = `/${basePath[1]}/${basePath[2]}/${basePath[3]}/dm/${workspaceUser.id}`
                      console.log(newPath)
                      push(newPath)
                    }}
                    onMouseEnter={() => setIsUserModalOpen(workspaceUser.id)}
                    onMouseLeave={() => setIsUserModalOpen(null)}
                    className="flex cursor-pointer items-center gap-x-[10px] rounded-md p-[10px] text-[14px] font-normal transition hover:bg-[#24232e63]"
                  >
                    <div className="relative flex items-center gap-x-[10px]">
                      <img
                        alt="ethereum avatar"
                        src={workspaceUser.user.profilePicture}
                        className="w-[30px] rounded-full"
                      ></img>
                      <div className="max-w-[120px] overflow-hidden  truncate text-ellipsis whitespace-nowrap 2xl:max-w-[180px]">
                        {workspaceUser.user.name}
                      </div>
                      {isUserModalOpen === workspaceUser.id && (
                        <div className="absolute -top-[10px] -translate-y-[100%] translate-x-[50%]">
                          <UserWorkspaceInfoModal
                            userWorkspace={workspaceUser}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <NewChannelModal
        isOpen={isCreatingNewChannel}
        onClose={closeModal}
        onChannelCreated={() => {
          getData(id.id)
        }}
        channelType={isCreatingNewChannelType}
        workspaceId={id.id}
      />
      <WebsocketComponent
        workspaceId={id.id}
        handleNewChannelMessage={(message) => {
          console.log('websocket funcionando show')
          handleNewChannelMessageTreatment(message)
        }}
        handleNewConversationMessage={(message) => {
          console.log('websocket funcionando show')
          handleNewConversationMessageTreatment(message)
        }}
      />
    </>
  )
}

export default ChatSidebar
