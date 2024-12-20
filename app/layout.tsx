/* eslint-disable no-unused-vars */
'use client'

// import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import 'node_modules/react-modal-video/css/modal-video.css'
import '../styles/index.css'
import { Providers } from './providers'
import Header from '@/components/Header'
import { Web3Modal } from '@/contexts/Web3Modal'
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  // eslint-disable-next-line no-undef
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="lazyOnload"
      />

      <head />

      <body className="min-h-screen w-full bg-gradient-to-br from-[#060621] via-[#0a0a3d] to-[#060621] bg-fixed bg-no-repeat">
        <Providers>
          <Web3Modal>
            <Header />
            {children}
            <ScrollToTop />
          </Web3Modal>
        </Providers>
      </body>
    </html>
  )
}
