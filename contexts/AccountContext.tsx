import { UserProps } from '@/types/user'
import { WorkspaceProps } from '@/types/workspace'
import React, { createContext, useState } from 'react'

interface CreateContextProps {
  children: React.ReactNode
}

interface CreateUserContextProps {
  user: UserProps | undefined
  setUser: (user: UserProps | undefined) => void // Permitindo que setUser aceite undefined

  workspace: WorkspaceProps | undefined
  setWorkspace: (workspace: WorkspaceProps | undefined) => void // Permitindo que setUser aceite undefined
}

export const AccountContext = createContext({} as CreateUserContextProps)

export default function AccountContextProvider({
  children,
}: CreateContextProps) {
  const [user, setUser] = useState<UserProps>()
  const [workspace, setWorkspace] = useState<WorkspaceProps>()

  return (
    <AccountContext.Provider
      value={{
        user,
        setUser,
        workspace,
        setWorkspace,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}
