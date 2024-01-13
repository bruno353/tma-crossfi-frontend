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
import {
  editMessage,
  getUserChannels,
  newMessageChannel,
} from '@/utils/api-chat'
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
  formatHours,
  getDifferenceInSeconds,
  getSanitizeText,
  isDifferentDay,
} from '@/utils/functions'

import io from 'socket.io-client'

const QuillNoSSRWrapper = dynamic(import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const Channel = (id: any) => {
  const { push } = useRouter()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { channel, setChannel, user, workspace } = useContext(AccountContext)
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
  const editorHtmlRef = useRef('')

  useEffect(() => {
    console.log('trying connect with websocket')
    const workspaceId = '161afd31-dd93-4d27-8264-685430b44791'
    const applicationId =
      'as90qw90uj3j9201fj90fj90dwinmfwei98f98ew0-o0c1m221dds222143332-21wddwqd@@@123'
    const { userSessionToken } = parseCookies()

    const socket = io('https://api.accelar.io', {
      query: {
        workspaceId,
      },
      extraHeaders: {
        'X-Parse-Application-Id': applicationId,
        'X-Parse-Session-Token': userSessionToken,
      },
    })

    socket.on('connect', () => {
      console.log('Conectado ao WebSocket')

      // // Envie um evento personalizado após a conexão, se necessário
      // socket.emit('customEvent', { applicationId, sessionToken })
    })

    socket.on('personalMessage', (message) => {
      console.log('Mensagem pessoal recebida:', message)
    })

    socket.on('channelMessage', (message) => {
      console.log('Mensagem do canal recebida:', message)
    })

    socket.on('disconnect', () => {
      console.log('Desconectado do WebSocket')
    })

    return () => {
      socket.off('personalMessage')
      socket.off('channelMessage')
      socket.disconnect()
    }
  }, [])

  function handleChangeEditor(value) {
    if (editorHtmlRef.current.length < 5000) {
      editorHtmlRef.current = value
    }
  }

  function handleChangeNewMessage(value) {
    if (editorHtml.length < 5000) {
      setNewMessageHtml(value)
    }
  }

  const menuRef = useRef(null)
  const messagesEndRef = useRef(null)
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
      dado = await getChannel(data, userSessionToken)
      setChannel(dado)
      setIsLoading(false)
    } catch (err) {
      toast.error(`Error: ${err}`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    return dado
  }

  const scrollToBottomInstant = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
  }

  const scrollToBottomSmooth = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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

  const editSave = () => {
    handleSaveMessage(isEditMessageOpen, editorHtmlRef.current)
  }

  const newMessageSave = () => {
    console.log('new message saved')
    handleNewMessage(newMessageHtml)
  }

  const handleSaveMessage = async (
    messageId: string,
    messageContent: string,
  ) => {
    setIsEditMessageOpen(false)
    const { userSessionToken } = parseCookies()
    const data = {
      messageId,
      message: messageContent,
    }

    console.log('o data')
    console.log(messageId)
    console.log(messageContent)

    try {
      setEditorHtml('')
      let updatedMessage = await editMessage(data, userSessionToken)
      updatedMessage = { ...updatedMessage, newMessageFromUser: true }

      // Encontre a mensagem na lista de mensagens do canal
      const updatedMessages = channel.messages.map((msg) =>
        msg.id === updatedMessage.id
          ? { ...msg, content: updatedMessage.content }
          : msg,
      )

      // Atualize o estado do canal com as novas mensagens
      setChannel({ ...channel, messages: updatedMessages })
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
  }

  const handleNewMessage = async (messageContent: string) => {
    const { userSessionToken } = parseCookies()
    const data = {
      channelId: id.id,
      message: messageContent,
    }

    try {
      setNewMessageHtml('')
      let newMessage = await newMessageChannel(data, userSessionToken)
      newMessage = { ...newMessage, newMessageFromUser: true } // Criar uma nova cópia com a propriedade adicionada

      const newArrayChannel = {
        ...channel,
        messages: [...channel.messages, newMessage],
      } // Criar uma nova cópia do array de mensagens
      setChannel(newArrayChannel)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
  }

  const handleMessageDeleted = (messageId: string) => {
    const arrayChannel = { ...channel }
    const finalArrayMessages = channel?.messages.filter(
      (item) => item.id !== messageId,
    )
    arrayChannel.messages = finalArrayMessages
    setChannel(arrayChannel)
  }

  const handleChannelDeleted = () => {
    push(`/workspace/${channel.workspaceId}/chat`)
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
    } else {
      if (
        event.key === 'Enter' &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
      ) {
        newMessageSave()
      }
    }
  }

  function renderMessages() {
    return (
      <div className="mr-[20px] flex h-full flex-1 flex-col overflow-y-auto pb-[20px] pt-5 text-[12px] font-light scrollbar-thin scrollbar-track-[#11132470] scrollbar-thumb-[#0e101f] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:text-[14px]">
        {isLoading ? (
          <div className="mt-auto grid gap-y-[40px]  px-[40px] pb-[20px]">
            <div className="flex animate-pulse gap-x-[10px]   2xl:gap-x-[15px]">
              <div className="h-[40px] w-[40px] rounded-full bg-[#dfdfdf]">
                {' '}
              </div>
              <div className="mt-auto h-[40px]  w-full  rounded-[3px] bg-[#dfdfdf]"></div>
            </div>
            <div className="flex animate-pulse gap-x-[10px]   2xl:gap-x-[15px]">
              <div className="h-[40px] w-[40px] rounded-full bg-[#dfdfdf]">
                {' '}
              </div>
              <div className="mt-auto h-[40px]  w-full  rounded-[3px] bg-[#dfdfdf]"></div>
            </div>
            <div className="flex animate-pulse gap-x-[10px]   2xl:gap-x-[15px]">
              <div className="h-[40px] w-[40px] rounded-full bg-[#dfdfdf]">
                {' '}
              </div>
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
                <div className="">
                  Send a message to start your conversation
                </div>
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

                const mss = getSanitizeText(message.content)

                if (mss.length === 0) {
                  // eslint-disable-next-line array-callback-return
                  return
                }
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
                      className={`flex h-fit items-start gap-x-[10px] px-[40px]  py-[2px] hover:bg-[#24232e63] 2xl:gap-x-[15px] ${
                        !sameUser && 'mt-[20px]'
                      }`}
                    >
                      {!sameUser ? (
                        <img
                          alt="ethereum avatar"
                          src={message?.userWorkspace?.user?.profilePicture}
                          className="max-w-[35px] rounded-full"
                        ></img>
                      ) : (
                        <div className="my-auto flex w-[35px] items-center">
                          {' '}
                          {isMessageHovered === message.id && (
                            <div className="text-[10px] text-[#888888] 2xl:text-[12px]">
                              {formatHours(message?.createdAt)}{' '}
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        {!sameUser && (
                          <div className="flex h-fit gap-x-[9px]">
                            <div>{message?.userWorkspace?.user?.name} </div>
                            <div className="my-auto text-[10px] text-[#888888] 2xl:text-[12px]">
                              {formatDate(message?.createdAt)}
                            </div>
                          </div>
                        )}

                        {isEditMessageOpen === message.id ? (
                          <div>
                            <QuillNoSSRWrapper
                              value={editorHtmlRef.current}
                              onChange={handleChangeEditor}
                              // disabled={isLoading}
                              className="my-quill mt-2 w-[280px]  rounded-md bg-[#787ca536] text-base font-normal text-[#fff] outline-0 lg:w-[900px]"
                              // maxLength={5000}
                              placeholder="Type here"
                            />
                            <div className="mt-[10px] text-[10px]">
                              enter to <span className="text-[#fff]">save</span>{' '}
                              - esc to{' '}
                              <span className="text-[#fff]">cancel</span>
                            </div>
                          </div>
                        ) : (
                          <div>{mss}</div>
                        )}
                      </div>
                      {isMessageHovered === message.id &&
                        message.userWorkspace.userId === user.id && (
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
                                className="w-[15px] cursor-pointer 2xl:w-[20px]"
                                onMouseEnter={() =>
                                  setIsEditInfoOpen(message.id)
                                }
                                onMouseLeave={() => setIsEditInfoOpen(null)}
                                onClick={() => {
                                  editorHtmlRef.current = message.content
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
                                className="w-[12px] cursor-pointer 2xl:w-[15px]"
                                onMouseEnter={() =>
                                  setIsDeleteInfoOpen(message.id)
                                }
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

  useEffect(() => {
    // Adiciona o event listener
    document.addEventListener('keydown', handleKeyPress)

    // Remove o event listener quando o componente é desmontado
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isEditMessageOpen, newMessageHtml])

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
          {!isLoading && workspace.isUserAdmin && (
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
        {/* <Messages
          channel={channel}
          isLoading={isLoading}
          handleMessageDeleted={(e) => {
            handleMessageDeleted(e)
          }}
        /> */}
        {renderMessages()}
        <div className="mt-auto px-[40px]">
          {' '}
          <QuillNoSSRWrapper
            value={newMessageHtml}
            onChange={handleChangeNewMessage}
            // disabled={isLoading}
            className="my-quill mt-2 w-full rounded-md  bg-[#787ca536] text-base font-normal text-[#fff] outline-0"
            placeholder="Type here"
          />
        </div>
      </div>
    </>
  )
}

export default Channel
