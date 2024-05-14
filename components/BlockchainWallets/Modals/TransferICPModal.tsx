/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext, useRef } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { parseCookies } from 'nookies'
import Dropdown, { ValueObject } from '@/components/Modals/Dropdown'
import { fundICPWallet, transferICP } from '@/utils/api-blockchain'
import { ICPWalletsProps, BlockchainWalletProps } from '@/types/blockchain-app'
import ConfirmFundICPWalletModal from './ConfirmFundICPWalletModal'
import { wait } from '@/utils/functions'

export interface ModalI {
  blockchainWallet: BlockchainWalletProps
  onUpdateM(): void
  onClose(): void
  isOpen: boolean
}

const TransferICPModal = ({
  blockchainWallet,
  onUpdateM,
  onClose,
  isOpen,
}: ModalI) => {
  const [addressTo, setAddressTo] = useState('')
  const [fundAmount, setFundAmount] = useState('0.0')
  const [isLoading, setIsLoading] = useState(null)
  const [isConfirmTransactionOpen, setIsConfirmTransactionOpen] =
    useState<any>(false)
  const confirmTransactionRef = useRef(null)

  const handleInputChange = (e) => {
    setIsConfirmTransactionOpen(false)
    if (!isLoading) {
      const value = e.target.value
      // Esta expressão regular permite apenas números
      const regex = /^\d*\.?\d*$/

      if (regex.test(value)) {
        setFundAmount(value)
      }
    }
  }

  const handleInputAddressChange = (e) => {
    setIsConfirmTransactionOpen(false)
    if (!isLoading) {
      const value = e.target.value
      setAddressTo(value)
    }
  }

  const handleFund = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const final = {
      id: blockchainWallet?.id,
      addressTo,
      amount: fundAmount,
    }

    try {
      await transferICP(final, userSessionToken)
      await wait(3500)
      toast.success(`Success`)
      setIsLoading(false)
      onUpdateM()
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
            Address to transfer
          </label>
          <input
            type="text"
            maxLength={500}
            id="workspaceName"
            name="workspaceName"
            placeholder="0x..."
            onChange={handleInputAddressChange}
            value={addressTo}
            className="w-full rounded-md border border-transparent px-6 py-2 text-base text-body-color placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
          />
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between gap-x-[5px]">
            <label
              htmlFor="workspaceName"
              className="mb-2 block text-[14px] text-[#C5C4C4]"
            >
              Amount (ICPs) to fund
            </label>
            <div
              onClick={() => {
                if (blockchainWallet.balance) {
                  setFundAmount(blockchainWallet.balance)
                }
              }}
              className="cursor-pointer rounded-[7px] p-[5px] py-[2px] text-[13px] hover:bg-[#c9c9c921]"
            >
              Max
            </div>
          </div>

          <input
            type="text"
            id="workspaceName"
            name="workspaceName"
            value={fundAmount}
            onChange={handleInputChange}
            className="w-full rounded-md border border-transparent px-6 py-2 text-base text-body-color placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
          />
        </div>
        <div className="relative mt-10 flex justify-between">
          {Number(fundAmount) > 0 && addressTo && addressTo.length > 0 && (
            <div
              className={`${
                isLoading
                  ? 'animate-pulse !bg-[#35428a]'
                  : 'cursor-pointer  hover:bg-[#35428a]'
              } rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
              onClick={() => {
                if (Number(fundAmount) > Number(blockchainWallet.balance)) {
                  toast.error(
                    `Fund amount cannot be greater than wallet balance`,
                  )
                  return
                }
                if (!isLoading && fundAmount && Number(fundAmount) > 0) {
                  setIsConfirmTransactionOpen(true)
                }
              }}
            >
              Transfer
            </div>
          )}
          {isConfirmTransactionOpen && (
            <div
              ref={confirmTransactionRef}
              className="absolute right-0 w-fit translate-x-[30%]"
            >
              <ConfirmFundICPWalletModal
                amount={fundAmount}
                wallet={addressTo}
                onConfirmTransaction={() => {
                  setIsConfirmTransactionOpen(false)
                  handleFund()
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransferICPModal
