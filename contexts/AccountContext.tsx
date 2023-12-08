import { UserProps } from '@/types/user'
import React, { createContext, useState } from 'react'

interface CreateContextProps {
  children: React.ReactNode
}

interface CreateUserContextProps {
  user: UserProps | undefined
  setUser: (user: UserProps | undefined) => void // Permitindo que setUser aceite undefined
}

export const AccountContext = createContext({} as CreateUserContextProps)

export default function AccountContextProvider({
  children,
}: CreateContextProps) {
  const [user, setUser] = useState<UserProps>()

  return (
    <AccountContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}
