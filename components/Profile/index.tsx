/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { parseCookies } from 'nookies'
import { callAxiosBackend } from '@/utils/general-api'
import { TelegramAppProps, TelegramWalletProps } from '@/types/telegram'
import { AccountContext } from '../../contexts/AccountContext'
import { ChevronDown, Plus, Wallet, ArrowLeft } from 'lucide-react'
import CreateWalletView from './CreateWalletView'

// Function to capitalize only the first letter and make the rest lowercase
function capitalizeFirst(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [wallets, setWallets] = useState<TelegramWalletProps[]>()
  const [walletSelected, setWalletSelected] = useState<TelegramWalletProps>()
  const [showWalletList, setShowWalletList] = useState(false)
  const [showCreateWallet, setShowCreateWallet] = useState(false)

  const { user } = useContext(AccountContext)

  const { push } = useRouter()

  const getAllWalletsFromIndexedDB = async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('WalletDB', 1)

      request.onsuccess = (event) => {
        const db = event.target.result
        const transaction = db.transaction(['WalletStore'], 'readonly')
        const store = transaction.objectStore('WalletStore')
        const wallets = []

        const cursorRequest = store.openCursor()
        cursorRequest.onsuccess = (event) => {
          const cursor = event.target.result
          if (cursor) {
            wallets.push(cursor.value)
            cursor.continue()
          } else {
            resolve(wallets) // Resolva a lista quando o cursor terminar
          }
        }

        cursorRequest.onerror = (error) => {
          reject(`Failed to retrieve wallets: ${error.target.error}`)
        }
      }

      request.onerror = (error) => {
        reject(`Failed to open database: ${error.target.error}`)
      }
    })
  }

  async function getData() {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    try {
      const res = await callAxiosBackend(
        'get',
        `/telegram/wallets`,
        userSessionToken,
      )
      setWallets(res)
      setWalletSelected(res[0])
      const wallets = await getAllWalletsFromIndexedDB();
      console.log('Wallets retrieved:', wallets);
      toast.success(JSON.stringify(wallets))
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      push('/dashboard')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    getData()
  }, [])

  if (isLoading) {
    return (
      <div className="container grid w-full gap-y-[30px] text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="h-20 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
        <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
      </div>
    )
  }

  if (showCreateWallet) {
    return (
      <section className="relative z-10 overflow-hidden px-[10px] pb-16 text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <CreateWalletView
          onWalletCreated={() => {
            console.log('hey')
            setShowCreateWallet(false)
          }}
        />
      </section>
    )
  }

  if (showWalletList) {
    return (
      <section className="relative z-10 overflow-hidden px-[10px] pb-16 text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="container text-[#fff]">
          <div>Select your wallet</div>
          <div>
            {wallets.map((wallet, index) => (
              <div
                key={index}
                onClick={() => setShowWalletList(true)}
                className="mx-auto mt-10 flex w-full max-w-[220px]  cursor-pointer items-center justify-between rounded-lg bg-[#1d21448e] p-3 py-4 transition-all hover:bg-[#2a2f5a]"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full bg-[#4646e7]"
                    style={{ boxShadow: '0 0 8px #4646e7' }}
                  />
                  <div>
                    <p className="text-gray-400 text-sm">
                      {wallet?.address?.slice(0, 6)}...
                      {wallet?.address?.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div onClick={() => setShowCreateWallet(true)} className="mt-5">
          + Create wallet
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="relative z-10 overflow-hidden px-[10px] pb-16 text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="container text-[#fff]">
          <div className="flex justify-between">
            <div>Hello, {user.telegramUsername}</div>
          </div>
          <div className="mt-10">
            <div>
              <div className="text-sm text-body-color">Balance</div>
              <div>USD </div>
            </div>
          </div>
          <div
            onClick={() => setShowWalletList(true)}
            className="mx-auto mt-10 flex w-full  max-w-[180px] cursor-pointer items-center justify-between rounded-lg bg-[#1d21448e] p-3 transition-all hover:bg-[#2a2f5a]"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full bg-[#4646e7]"
                style={{ boxShadow: '0 0 8px #4646e7' }}
              />
              <div>
                <p className="text-gray-400 text-sm">
                  {walletSelected?.address?.slice(0, 6)}...
                  {walletSelected?.address?.slice(-4)}
                </p>
              </div>
            </div>
            <ChevronDown className="text-gray-400 h-5 w-5" />
          </div>
        </div>
      </section>
    </>
  )
}

export default Profile
