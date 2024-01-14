import { ChannelProps, ConversationProps } from '@/types/chat'
import { UserProps } from '@/types/user'
import { WorkspaceProps } from '@/types/workspace'
import React, { createContext, useState } from 'react'

interface CreateContextProps {
  children: React.ReactNode
}

interface CreateUserContextProps {
  user: UserProps | undefined
  setUser: (user: UserProps | undefined) => void

  channels: ChannelProps[] | undefined
  setChannels: (channels: ChannelProps[] | undefined) => void

  dm: ChannelProps | undefined
  setDm: (channels: ChannelProps | undefined) => void

  channel: ChannelProps | undefined
  setChannel: (channels: ChannelProps | undefined) => void

  conversation: ConversationProps | undefined
  setConversation: (conversation: ConversationProps | undefined) => void

  conversations: ConversationProps[] | undefined
  setConversations: (conversations: ConversationProps[] | undefined) => void

  workspace: WorkspaceProps | undefined
  setWorkspace: (workspace: WorkspaceProps | undefined) => void
}

export const AccountContext = createContext({} as CreateUserContextProps)

export default function AccountContextProvider({
  children,
}: CreateContextProps) {
  const [user, setUser] = useState<UserProps>()
  const [channels, setChannels] = useState<ChannelProps[]>()
  const [channel, setChannel] = useState<ChannelProps>()
  const [conversation, setConversation] = useState<ConversationProps>()
  const [conversations, setConversations] = useState<ConversationProps[]>()

  const [dm, setDm] = useState<ChannelProps>()
  const [workspace, setWorkspace] = useState<WorkspaceProps>()

  return (
    <AccountContext.Provider
      value={{
        user,
        setUser,
        dm,
        setDm,
        channel,
        setChannel,
        channels,
        setChannels,
        conversation,
        setConversation,
        conversations,
        setConversations,
        workspace,
        setWorkspace,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}
