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
import {
  BlockchainContractProps,
  ContractInspectionI,
} from '@/types/blockchain-app'
import ConfirmDeployContractModal from './ConfirmDeployContractModal'
import { transformString } from '@/utils/functions'

export interface ModalI {
  contract: BlockchainContractProps
  environment: string
  wallet: string
  walletBalance: string
  onUpdateM(): void
  onClose(): void
  isOpen: boolean
}

const DeployContractModal = ({
  isOpen,
  environment,
  wallet,
  walletBalance,
  onUpdateM,
  onClose,
  contract,
}: ModalI) => {
  const [isLoading, setIsLoading] = useState(null)

  const [isConfirmTransactionOpen, setIsConfirmTransactionOpen] =
    useState<boolean>(false)

  const confirmTransactionRef = useRef(null)

  const modalRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (event) => {
    if (event.target === modalRef.current) {
      onClose()
    }
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
      <div className="relative z-50 w-[250px] rounded-md bg-[#060621] p-8 py-6 md:w-[500px]">
        <div onClick={onClose} className="absolute right-5 top-5">
          <img
            alt="delete"
            src="/images/delete.svg"
            className="w-[25px]  cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921]"
          ></img>
        </div>
        <div className="mb-4">
          <label
            htmlFor="workspaceName"
            className="block text-[16px] text-[#fff]"
          >
            Deploy Contract {contract?.name}
          </label>
        </div>
        <div className="grid gap-y-2">
          <div className="text-[#c5c4c4]">
            Environment: <span className="text-[#fff]">{environment}</span>
          </div>
          <div className="text-[#c5c4c4]">
            Wallet:{' '}
            <span
              className="cursor-pointer text-[#fff]"
              onClick={() => {
                navigator.clipboard.writeText(wallet)
                toast.success('Address copied')
              }}
            >
              {transformString(wallet, 7)}
            </span>
          </div>
          <div className="text-[#c5c4c4]">
            Balance: <span className="text-[#fff]">{walletBalance}</span>
          </div>
        </div>

        {Number(walletBalance) === 0 && (
          <div className="mt-2 flex gap-x-3">
            <img
              alt="ethereum avatar"
              src="/images/depin/warning.svg"
              className="w-[15px]"
            ></img>
            <div className="text-[14px] text-[#cc5563]">
              You have no balance, this transaction will likely fail
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-start">
          <div
            className={`${
              isLoading
                ? 'animate-pulse !bg-[#35428a]'
                : 'cursor-pointer  hover:bg-[#35428a]'
            }  rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
            onClick={() => {
              if (!isLoading) {
                setIsConfirmTransactionOpen(true)
              }
            }}
          >
            Transact
          </div>
        </div>
        {isConfirmTransactionOpen && (
          <div ref={confirmTransactionRef} className="absolute right-0">
            <ConfirmDeployContractModal
              wallet={wallet}
              environment={environment}
              onConfirmTransaction={() => {
                onUpdateM()
                setIsConfirmTransactionOpen(false)
                // handleFund()
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default DeployContractModal
