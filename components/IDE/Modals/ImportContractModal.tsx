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

export interface ModalI {
  contract: BlockchainContractProps
  environment: string
  onUpdateM(address: string): void
  onClose(): void
  isOpen: boolean
}

const DeployContractModal = ({
  isOpen,
  environment,
  onUpdateM,
  onClose,
  contract,
}: ModalI) => {
  const [isLoading, setIsLoading] = useState(null)

  const [isConfirmTransactionOpen, setIsConfirmTransactionOpen] =
    useState<boolean>(false)

  const [contractAddress, setContractAddress] = useState('')

  const confirmTransactionRef = useRef(null)

  const modalRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (event) => {
    if (event.target === modalRef.current) {
      onClose()
    }
  }

  const handleInputChange = (e) => {
    if (!isLoading) {
      setContractAddress(e.target.value)
    }
  }

  const handleImport = () => {
    if (!isLoading) {
      const isValid = isValidSorobanContractAddress(contractAddress)
      if (!isValid) {
        toast.error('Invalid contract address')
        return
      }
      onUpdateM(contractAddress)
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
            Import Contract {contract?.name}
          </label>
        </div>
        <div className="grid gap-y-2">
          <div className="text-[#c5c4c4]">
            Environment: <span className="text-[#fff]">{environment}</span>
          </div>
        </div>

        <div className="mb-7 mt-5">
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            Contract Address
          </label>
          <input
            type="text"
            id="workspaceName"
            name="workspaceName"
            value={contractAddress}
            onChange={handleInputChange}
            className="w-full rounded-md border border-transparent px-6 py-2 text-base text-body-color placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
          />
        </div>

        <div className="mt-5 flex justify-start">
          <div
            className={`${
              isLoading
                ? 'animate-pulse !bg-[#35428a]'
                : 'cursor-pointer  hover:bg-[#35428a]'
            }  rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
            onClick={() => {
              // AQUI
              handleImport()
            }}
          >
            Import
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeployContractModal
