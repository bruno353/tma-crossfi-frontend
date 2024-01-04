import { ChannelProps } from '@/types/chat'
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

  workspace: WorkspaceProps | undefined
  setWorkspace: (workspace: WorkspaceProps | undefined) => void
}

export const AccountContext = createContext({} as CreateUserContextProps)

export default function AccountContextProvider({
  children,
}: CreateContextProps) {
  const [user, setUser] = useState<UserProps>()
  const [channels, setChannels] = useState<ChannelProps[]>()
  const [workspace, setWorkspace] = useState<WorkspaceProps>()

  return (
    <AccountContext.Provider
      value={{
        user,
        setUser,
        channels,
        setChannels,
        workspace,
        setWorkspace,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}
