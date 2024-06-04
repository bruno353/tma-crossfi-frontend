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
import { cleanDocs } from '../MainPage'
import { BlockchainContractProps } from '@/types/blockchain-app'
import ConfirmDeployContractModal from './ConfirmDeployContractModal'
import { isValidSorobanContractAddress } from '@/utils/functions'
import { callAxiosBackend } from '@/utils/general-api'

export interface ModalI {
  contract: BlockchainContractProps
  environment: string
  onUpdateM(response: string, contractId: string): void
  onClose(): void
  isOpen: boolean
}

const BotHelperModal = ({
  isOpen,
  environment,
  onUpdateM,
  onClose,
  contract,
}: ModalI) => {
  const [isLoading, setIsLoading] = useState(null)

  const [isConfirmTransactionOpen, setIsConfirmTransactionOpen] =
    useState<boolean>(false)

  const [isInfoOpen, setIsInfoOpen] = useState(false)

  const [input, setInput] = useState('')

  const confirmTransactionRef = useRef(null)

  const modalRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (event) => {
    if (event.target === modalRef.current) {
      onClose()
    }
  }

  const handleInputChange = (e) => {
    if (!isLoading) {
      setInput(e.target.value)
    }
  }

  async function handleImport() {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    const data = {
      question: input,
      id: contract?.id,
    }

    try {
      const res = await callAxiosBackend(
        'post',
        '/blockchain/functions/askBot',
        userSessionToken,
        data,
      )

      // if its a json and has error, the user inputed a wrong input
      try {
        const responseTreated = JSON.parse(res)
        if (responseTreated?.error) {
          toast.error(
            'Could not process your input. Please ensure you are concise and only refer to the contract building structure.',
          )
        }
      } catch (err) {
        console.log('Inputed right')
      }

      onUpdateM(res, contract?.id)
      console.log(res)
    } catch (err) {
      console.log(err)
      console.log('Error: ' + err.response.data.message)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        confirmTransactionRef.current &&
        !confirmTransactionRef.current.contains(event.target)
      ) {
        setIsConfirmTransactionOpen(false)
      }
    }

    if (isConfirmTransactionOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isConfirmTransactionOpen])

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
      <div className="relative z-50 w-[250px] rounded-md bg-[#060621] p-10 py-10 md:w-[800px]">
        <div onClick={onClose} className="absolute right-5 top-5">
          <img
            alt="delete"
            src="/images/delete.svg"
            className="w-[25px]  cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921]"
          ></img>
        </div>
        <div className="relative mb-4 flex gap-x-2">
          <div className="flex items-center gap-x-1">
            <img
              alt="ethereum avatar"
              src="/images/depin/bot.svg"
              className="mb-1 w-[20px]"
            ></img>
            <div className="block text-[18px] text-[#fff]">
              Ask for Soroban coding help with the Accelar Bot
            </div>
          </div>

          <img
            alt="ethereum avatar"
            src="/images/header/help.svg"
            className="mb-2 w-[15px] cursor-pointer rounded-full"
            onMouseEnter={() => setIsInfoOpen(true)}
            onMouseLeave={() => setIsInfoOpen(false)}
          ></img>
          {isInfoOpen && (
            <div className="absolute right-0 flex w-fit max-w-[300px] -translate-y-[102%] translate-x-[10%] items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
              This is a on-going development feature, describe the Soroban code
              you want the bot to write for you. Example: "Built me a simple sum
              smart-contract"
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-x-3 text-[12px]">
          <img
            alt="ethereum avatar"
            src="/images/depin/warning.svg"
            className="w-[20px]"
          ></img>
          <div className="text-[#cc5563]">
            Beta feature - The code produced should not be used in a production
            environment
          </div>
        </div>

        <div className="mb-7 mt-8">
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            Command
          </label>
          <input
            type="text"
            placeholder="Code a storage smart-contract for me"
            id="workspaceName"
            name="workspaceName"
            value={input}
            onChange={handleInputChange}
            className="w-full rounded-md border border-transparent px-6 py-2 text-base text-body-color placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
          />
        </div>

        <div className="mt-5 flex justify-start gap-x-4">
          <div
            className={`${
              isLoading
                ? 'animate-pulse !bg-[#35428a]'
                : 'cursor-pointer  hover:bg-[#35428a]'
            }  rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] ${
              input?.length === 0 && '!cursor-auto !bg-[#35428a]'
            } `}
            onClick={() => {
              // AQUI
              if (input?.length > 0 && !isLoading) {
                handleImport()
              }
            }}
          >
            Input
          </div>
          {isLoading && (
            <svg
              aria-hidden="true"
              className="my-auto mr-3 h-6 w-6 animate-spin fill-[#273687] text-[#fff]"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

export default BotHelperModal
