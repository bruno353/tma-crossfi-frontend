/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unknown-property */
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
import { parseCookies } from 'nookies'
import Dropdown, { ValueObject } from '@/components/Modals/Dropdown'
import { createBlockchainApps, createWallet } from '@/utils/api-blockchain'
import { optionsNetwork } from '@/components/BlockchainApps/Modals/NewAppModal'

const NewWalletModal = ({ isOpen, onUpdateM, onClose, workspaceId }) => {
  const [appName, setAppName] = useState('')
  const [isLoading, setIsLoading] = useState(null)

  const [selected, setSelected] = useState<ValueObject>(optionsNetwork[0])

  const handleInputChange = (e) => {
    if (!isLoading) {
      setAppName(e.target.value)
    }
  }

  const handleCreateChannel = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const final = {
      workspaceId,
      name: appName,
      walletNetwork: selected.value,
    }

    try {
      const wallet = await createWallet(final, userSessionToken)
      setIsLoading(false)
      onUpdateM(wallet.id)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }
  const modalRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (event) => {
    if (event.target === modalRef.current) {
      onClose()
    }
  }

  return (
    <div
      onClick={handleOverlayClick}
      className={`fixed  inset-0 z-50 flex items-center justify-center font-normal backdrop-blur-sm ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      } transition-opacity duration-300`}
    >
      <div
        ref={modalRef}
        className="absolute inset-0 bg-[#1c1c3d] opacity-80"
      ></div>
      <div className="relative z-50 w-[250px] rounded-md bg-[#060621] p-8 py-12 md:w-[500px]">
        <div onClick={onClose} className="absolute right-5 top-5">
          <img
            alt="delete"
            src="/images/delete.svg"
            className="w-[25px]  cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921]"
          ></img>
        </div>
        <div className="mb-6">
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            Wallet description
          </label>
          <input
            type="text"
            maxLength={50}
            id="workspaceName"
            name="workspaceName"
            value={appName}
            onChange={handleInputChange}
            className="w-full rounded-md border border-transparent px-6 py-2 text-base text-body-color placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            Network
          </label>
          <div className="text-base">
            <Dropdown
              optionSelected={selected}
              options={optionsNetwork}
              onValueChange={(value) => {
                setSelected(value)
              }}
            />
          </div>
        </div>
        <div className="mt-10 flex justify-start">
          <div
            className={`${
              isLoading
                ? 'animate-pulse !bg-[#35428a]'
                : 'cursor-pointer  hover:bg-[#35428a]'
            }  rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
            onClick={() => {
              if (!isLoading) {
                handleCreateChannel()
              }
            }}
          >
            Create
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewWalletModal
