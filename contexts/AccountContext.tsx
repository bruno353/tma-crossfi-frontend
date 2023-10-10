import React, { createContext, useState } from 'react'

export interface UserProps {
  firstName: string
  lastName: string
  email: string
  companyName?: string
  foundingYear?: number
  location: string
  website?: string
  personalBlog?: string
  githubLink?: string
  isCompany: boolean
  tags: string[]
  description: string
  password: string
  confirmPassword: string
  profilePictureHash: string
  calendly: string
  sessionToken: string
  createdAt: string
  updatedAt: string
}

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
