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
import { ChannelProps } from '@/types/chat'
import NewChannelModal from '../Modals/NewChannelModal'
import { AccountContext } from '@/contexts/AccountContext'
import { UserWorkspaceProps } from '@/types/workspace'
import UserWorkspaceInfoModal from '@/components/Workspace/UserWorkspaceInfoModal'

const ChatSidebar = (id: any) => {
  const [channels, setChannels] = useState<ChannelProps[]>()
  const [isCreatingNewChannel, setIsCreatingNewChannel] = useState(false)
  const [isCreatingNewChannelType, setIsCreatingNewChannelType] = useState('')
  const [users, setUsers] = useState<UserWorkspaceProps[]>()
  const { workspace, setWorkspace } = useContext(AccountContext)
  const [isUserModalOpen, setIsUserModalOpen] = useState<any>()

  const [sidebarOption, setSidebarOption] = useState<any>({
    TEXT: true,
    AUDIO: true,
    VIDEO: true,
  })

  const channelTypeToLogo = {
    TEXT: '/images/chat/hashtag.svg',
    AUDIO: '/images/chat/volume.svg',
    VIDEO: '/images/chat/volume.svg',
  }

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
      setChannels(dado)
      setUsers(dado.generalUsersWorkspace)
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
      <div className="relative z-10 flex h-screen w-fit overflow-hidden bg-[#33323E] px-[20px] pb-16 pt-5 text-[16px] text-[#C5C4C4] md:pb-20 lg:mt-[100px] lg:pb-28 2xl:pr-[30px] 2xl:text-[18px]">
        <div className="text-[12px] font-light  2xl:text-[14px]">
          {channelOption.map((option, index) => (
            <div key={index} className="mb-[30px]">
              <div className={`mb-1 flex min-w-[150px] items-center`}>
                <div
                  onClick={() => {
                    handleSidebarClick(option.type)
                  }}
                  className="flex cursor-pointer gap-x-[5px] hover:text-[#fff]"
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
                          <div className="mb-[7px] flex cursor-pointer gap-x-[3px] 2xl:gap-x-[3px]">
                            <img
                              src={channelTypeToLogo[option.type]}
                              alt="image"
                              className={'w-[14px] 2xl:w-[16px]'}
                            />
                            <div
                              title={optionChannel.name}
                              className="max-w-[180px] overflow-hidden truncate text-ellipsis whitespace-nowrap hover:text-[#fff] 2xl:max-w-[200px]"
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
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
        <div className="mt-[30px] grid gap-y-[25px] 2xl:mt-[40px]">
          {users?.map((workspaceUser, index) => (
            <div
              key={index}
              className="flex items-center gap-x-[10px] text-[15px] font-normal"
            >
              <div
                onMouseEnter={() => setIsUserModalOpen(workspaceUser.id)}
                onMouseLeave={() => setIsUserModalOpen(null)}
                className="relative flex items-center gap-x-[10px]"
              >
                <img
                  alt="ethereum avatar"
                  src={workspaceUser.user.profilePicture}
                  className="w-[35px] rounded-full"
                ></img>
                <div className="w-[350px] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                  {workspaceUser.user.email}
                </div>
                {isUserModalOpen === workspaceUser.id && (
                  <div className="absolute -top-[10px] -translate-y-[100%] ">
                    <UserWorkspaceInfoModal userWorkspace={workspaceUser} />
                  </div>
                )}
              </div>
            </div>
          ))}
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
    </>
  )
}

export default ChatSidebar
