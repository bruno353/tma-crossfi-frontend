/* eslint-disable @typescript-eslint/no-empty-function */
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
import '../ChatsCSS/react-quill.css'
import { getChannel, getWorkspace } from '@/utils/api'
import nookies, { parseCookies, setCookie } from 'nookies'
import {
  editMessage,
  getUserChannels,
  joinVideoAudioChannel,
  newMessageChannel,
  readChannel,
} from '@/utils/api-chat'
import { ChannelProps, NewChannelMessageProps } from '@/types/chat'
import { AccountContext } from '@/contexts/AccountContext'
import { channelTypeToLogo } from '@/types/consts/chat'
import DeleteMessageModal from '../Modals/DeleteMessageModal'
import dynamic from 'next/dynamic'

import { LiveKitRoom, VideoConference } from '@livekit/components-react'
import '@livekit/components-styles'

import DeleteChannelModal from '../Modals/DeleteChannelModal'
import EditChannelModal from '../Modals/EditChannelModal'
import {
  formatDate,
  formatDateWithoutTime,
  formatHours,
  getDifferenceInSeconds,
  getSanitizeText,
  isDifferentDay,
} from '@/utils/functions'

const VideoChannel = (id: any) => {
  const { push } = useRouter()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { channel, setChannel, user, workspace, channels, setChannels } =
    useContext(AccountContext)

  const [isDeleteMessageOpen, setIsDeleteMessageOpen] = useState<any>()

  const [isDeleteChannelInfoOpen, setIsDeleteChannelInfoOpen] = useState<any>()
  const [isDeleteChannelOpen, setIsDeleteChannelOpen] = useState<any>()

  const [isEditChannelInfoOpen, setIsEditChannelInfoOpen] = useState<any>()
  const [isEditChannelOpen, setIsEditChannelOpen] = useState<any>()

  const menuRef = useRef(null)
  const deleteChannelRef = useRef(null)

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
      dado = await joinVideoAudioChannel(data, userSessionToken)
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

  const closeMenu = () => {
    setIsDeleteMessageOpen(false)
  }

  const closeMenuDeleteChannel = () => {
    setIsDeleteChannelOpen(false)
  }

  const handleChannelDeleted = () => {
    push(`/workspace/${channel.workspaceId}/chat`)
  }

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

  return (
    <>
      <div className="flex h-full max-h-[calc(100vh-6rem)] flex-1 flex-col justify-between bg-[#1D2144]  pb-16 text-[16px] text-[#C5C4C4] md:pb-20  lg:pb-8  2xl:text-[18px]">
        <div className="flex w-full justify-between gap-x-[10px] border-b-[1px] border-[#141733] bg-[#1D2144] px-[40px] py-[20px]">
          <div className="flex gap-x-[5px]">
            {isLoading ? (
              <div className="h-[25px] w-[300px] animate-pulse rounded-[3px] bg-[#dfdfdf]"></div>
            ) : (
              <>
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
              </>
            )}
          </div>
          {!isLoading && workspace?.isUserAdmin && (
            <div className="relative flex gap-x-[10px]">
              <div>
                {channel?.id && isEditChannelInfoOpen === channel?.id && (
                  <div className="absolute w-fit  min-w-[110px] -translate-x-[80%] translate-y-[120%] rounded-[6px] bg-[#060621] px-[10px]   py-[5px]  text-center  text-[12px]  2xl:min-w-[130px] 2xl:text-[14px]">
                    Edit Channel
                  </div>
                )}
                {isEditChannelOpen === channel?.id && (
                  <div>
                    <EditChannelModal
                      isOpen={isEditChannelOpen}
                      onClose={() => {
                        setIsEditChannelOpen(false)
                      }}
                      onChannelUpdate={() => {
                        window.location.reload()
                      }}
                      isPreviousPrivate={channel?.isPrivate}
                      previousName={channel?.name}
                      channelType={channel?.type}
                      channelId={channel?.id}
                    />{' '}
                  </div>
                )}
                <img
                  src={'/images/chat/config2.svg'}
                  alt="image"
                  className={
                    'w-[24px] cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921] 2xl:w-[27px]'
                  }
                  onMouseEnter={() => setIsEditChannelInfoOpen(channel?.id)}
                  onMouseLeave={() => setIsEditChannelInfoOpen(null)}
                  onClick={() => {
                    setIsEditChannelOpen(channel.id)
                  }}
                />
              </div>

              <div>
                {' '}
                {channel?.id && isDeleteChannelInfoOpen === channel?.id && (
                  <div className="absolute w-fit  min-w-[110px] -translate-x-[80%] translate-y-[120%] rounded-[6px] bg-[#060621] px-[10px]   py-[5px]  text-center  text-[12px]  2xl:min-w-[130px] 2xl:text-[14px]">
                    Delete Channel
                  </div>
                )}
                {channel?.id && isDeleteChannelOpen === channel?.id && (
                  <div
                    ref={deleteChannelRef}
                    className="absolute z-50   -translate-x-[100%]  translate-y-[50%]"
                  >
                    <DeleteChannelModal
                      id={channel?.id}
                      onUpdateM={() => {
                        handleChannelDeleted()
                      }}
                    />{' '}
                  </div>
                )}
                <img
                  src={'/images/delete.svg'}
                  alt="image"
                  className={
                    'w-[24px] cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921] 2xl:w-[27px]'
                  }
                  onMouseEnter={() => setIsDeleteChannelInfoOpen(channel?.id)}
                  onMouseLeave={() => setIsDeleteChannelInfoOpen(null)}
                  onClick={() => {
                    setIsDeleteChannelOpen(channel.id)
                  }}
                />
              </div>
            </div>
          )}
        </div>
        {channel && (channel.type === 'AUDIO' || channel.type === 'VIDEO') && (
          <LiveKitRoom
            data-lk-theme="default"
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WEBSOCKET_URL}
            token={channel?.tokenLiveKit}
            connect={true}
            video={channel.type === 'VIDEO'}
            audio={true}
          >
            <VideoConference />
          </LiveKitRoom>
        )}
      </div>
    </>
  )
}

export default VideoChannel
