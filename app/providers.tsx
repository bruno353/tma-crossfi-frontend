/* eslint-disable no-undef */
'use client'

import AccountContextProvider from '@/contexts/AccountContext'
import { ThemeProvider } from 'next-themes'
import { ToastContainer } from 'react-toastify'
import { ChakraProvider } from '@chakra-ui/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ChakraProvider>
        <AccountContextProvider>
          <ThemeProvider
            attribute="class"
            enableSystem={false}
            defaultTheme="dark"
          >
            {children}
          </ThemeProvider>
        </AccountContextProvider>
      </ChakraProvider>

      <ToastContainer />
    </>
  )
}
