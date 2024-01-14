/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  editDirectMessage,
  editMessage,
  getConversation,
  getUserChannels,
  newMessageChannel,
  newMessageConversation,
  readChannel,
  readConversation,
} from '@/utils/api-chat'
import {
  ChannelProps,
  NewChannelMessageProps,
  NewConversationMessageProps,
} from '@/types/chat'
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

import WebsocketComponent from '../Websocket/WebsocketChat'

const QuillNoSSRWrapper = dynamic(import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const Dm = (id: any) => {
  const { push } = useRouter()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const {
    user,
    workspace,
    conversation,
    setConversations,
    conversations,
    setConversation,
  } = useContext(AccountContext)
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

  function handleNewConversationMessageTreatment(
    message: NewConversationMessageProps,
  ) {
    if (message.secondMemberUserWorkspaceId === id.id) {
      if (!conversation) {
        getData(id.id)
      } else {
        const messageExist = conversation.directMessages.find(
          (mess) => mess.id === message.message.id,
        )
        if (!messageExist) {
          const newArrayChannel = {
            ...conversation,
            messages: [...conversation.directMessages, message.message],
          }
          setConversation(newArrayChannel)
        }

        const newConversations = [...conversations]
        conversations?.find((conversation) => {
          if (conversation.id === message.message.conversationId) {
            conversation.hasNewMessages = false
            return true
          }
          return false
        })
        setConversations(newConversations)
      }
    }
  }

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
      member2Id: id,
      workspaceId: workspace?.id,
    }

    let dado
    try {
      dado = await getConversation(data, userSessionToken)
      if (dado) {
        setConversation(dado)
      }
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
      let updatedMessage = await editDirectMessage(data, userSessionToken)
      updatedMessage = { ...updatedMessage, newMessageFromUser: true }

      // Encontre a mensagem na lista de mensagens do canal
      const updatedMessages = conversation?.directMessages.map((msg) =>
        msg.id === updatedMessage.id
          ? { ...msg, content: updatedMessage.content }
          : msg,
      )

      setConversation({ ...conversation, directMessages: updatedMessages })
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
  }

  const handleNewMessage = async (messageContent: string) => {
    const { userSessionToken } = parseCookies()
    const data = {
      member2Id: id.id,
      message: messageContent,
      workspaceId: workspace?.id,
    }

    try {
      setNewMessageHtml('')
      const newConversation = await newMessageConversation(
        data,
        userSessionToken,
      )

      if (!conversation) {
        const newMessage = {
          ...newConversation?.directMessages[
            newConversation.directMessages.length - 1
          ],
          newMessageFromUser: true,
        }

        const newArrayChannel = {
          ...newConversation,
          messages: [...newConversation?.directMessages, newMessage],
        }
        setConversation(newArrayChannel)
      } else {
        const newMessage = {
          ...newConversation?.directMessages[
            newConversation.directMessages.length - 1
          ],
          newMessageFromUser: true,
        }

        const newArrayChannel = {
          ...conversation,
          messages: [...conversation.directMessages, newMessage],
        }
        setConversation(newArrayChannel)
      }
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
  }

  const handleMessageDeleted = (messageId: string) => {
    const arrayChannel = { ...conversation }
    const finalArrayMessages = conversation?.directMessages.filter(
      (item) => item.id !== messageId,
    )
    arrayChannel.directMessages = finalArrayMessages
    setConversation(arrayChannel)
  }

  useEffect(() => {
    if (conversation?.directMessages?.length > 0) {
      console.log(
        'the new message: ' +
          JSON.stringify(
            conversation?.directMessages[
              conversation?.directMessages.length - 1
            ],
          ),
      )
      if (
        !conversation?.directMessages[
          conversation?.directMessages.length - 1
        ]?.['newMessageFromOtherUser'] &&
        !conversation?.directMessages[
          conversation?.directMessages.length - 1
        ]?.['newMessageFromUser']
      ) {
        console.log('scroll instant')
        scrollToBottomInstant()
      } else if (
        conversation?.directMessages[conversation?.directMessages.length - 1]?.[
          'newMessageFromUser'
        ]
      ) {
        console.log('scroll smooth')
        scrollToBottomSmooth()
      }
    }
  }, [conversation?.directMessages])

  async function setReadConversationMessages(member2Id: string) {
    const { userSessionToken } = parseCookies()
    const data = {
      member2Id,
      workspaceId: workspace?.id,
    }

    try {
      await readConversation(data, userSessionToken)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
  }

  useEffect(() => {
    if (conversation) {
      setReadConversationMessages(id.id)

      const newConversations = [...conversations]
      newConversations.find((conObj) => {
        if (
          conObj.userWorkspaceOneId === id.id ||
          conObj.userWorkspaceTwoId === id.id
        ) {
          conObj.hasNewMessages = false
          return true
        }
        return false
      })
      setConversations(newConversations)
    }
  }, [conversation])

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

  useEffect(() => {
    // Adiciona o event listener
    document.addEventListener('keydown', handleKeyPress)

    // Remove o event listener quando o componente é desmontado
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isEditMessageOpen, newMessageHtml])

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
            {conversation?.directMessages?.length === 0 && (
              <div className="mt-auto px-[40px] pb-[50px]">
                <div className="flex gap-x-[7px] text-[21px] font-medium text-[#fff] 2xl:gap-x-[10px] 2xl:text-[25px]">
                  <div>
                    {' '}
                    Start with{' '}
                    {
                      workspace?.UserWorkspace.find((obj) => obj.id === id.id)
                        .user.name
                    }
                  </div>
                </div>
                <div className="">
                  Send a message to start your conversation
                </div>
              </div>
            )}
            <div className="mt-auto">
              {conversation?.directMessages?.map((message, index) => {
                const showDaySeparator =
                  index === 0 ||
                  isDifferentDay(
                    message.createdAt,
                    conversation.directMessages[index - 1].createdAt,
                  )
                const differenceInSecods =
                  index === 0 ||
                  getDifferenceInSeconds(
                    message.createdAt,
                    conversation.directMessages[index - 1].createdAt,
                  )
                // eslint-disable-next-line prettier/prettier
                const sameUser = (differenceInSecods !== true && differenceInSecods < 360) && (!showDaySeparator) && (message.userWorkspaceId === conversation.directMessages[index - 1].userWorkspaceId)

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
                  alt="ethereum avatar"
                  src={
                    workspace?.UserWorkspace.find((obj) => obj.id === id.id)
                      .user.profilePicture
                  }
                  className="w-[30px] rounded-full"
                ></img>
                <div>
                  {
                    workspace?.UserWorkspace.find((obj) => obj.id === id.id)
                      .user.name
                  }
                </div>
              </>
            )}
          </div>
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
      {workspace && (
        <WebsocketComponent
          workspaceId={workspace.id}
          handleNewChannelMessage={(message) => {}}
          handleNewConversationMessage={(message) => {
            handleNewConversationMessageTreatment(message)
          }}
        />
      )}
    </>
  )
}

export default Dm
