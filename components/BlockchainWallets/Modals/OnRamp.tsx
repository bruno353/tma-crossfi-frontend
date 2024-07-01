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
import { formatTokenPrice, wait } from '@/utils/functions'
import { callAxiosBackend } from '@/utils/general-api'
import axios from 'axios'

export interface ModalI {
  blockchainWallet: BlockchainWalletProps
  netEnvironment: string
  onUpdateM(): void
  onClose(): void
  isOpen: boolean
}

const netEnvironmentToLabel = {
  CROSSFI: {
    TESTNET: 'CROSSFI_TESTNET',
  },
  FRAXTAL: {
    Mainnet: 'FRAXTAL_MAINNET',
    Testnet: 'FRAXTAL_TESTNET',
  },
}

const OnRampModal = ({
  blockchainWallet,
  netEnvironment,
  onUpdateM,
  onClose,
  isOpen,
}: ModalI) => {
  const [addressTo, setAddressTo] = useState('')
  const [fundAmount, setFundAmount] = useState('0.0')
  const [tokenPrice, setTokenPrice] = useState('0.0')
  const [amountToReceive, setAmountToReceive] = useState('0.0')
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
        getTokenAmountToReceive(tokenPrice, value)
      }
    }
  }

  const handleInputAddressChange = (e) => {
    return
    setIsConfirmTransactionOpen(false)
    if (!isLoading) {
      const value = e.target.value
      setAddressTo(value)
    }
  }

  const handleFund = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const data = {
      id: blockchainWallet?.id,
      addressTo,
      amount: fundAmount,
      evmRPC: netEnvironmentToLabel[blockchainWallet.network][netEnvironment],
    }

    try {
      const res = await callAxiosBackend(
        'post',
        '/blockchain/functions/transferEVMToken',
        userSessionToken,
        data,
      )
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

  const getSymbolPrice = async (symbol: string) => {
    setTokenPrice('loading')

    const config = {
      method: 'get',
      url: `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    let res

    try {
      await axios(config).then(function (response) {
        res = response.data
      })
      await new Promise((resolve) => setTimeout(resolve, 3000))
      const finalPrice = formatTokenPrice(res.price)
      setTokenPrice(finalPrice)
      getTokenAmountToReceive(finalPrice, fundAmount)
    } catch (err) {
      console.log(err)
      toast.error(`Error getting symbol price`)
    }
  }

  const getTokenAmountToReceive = async (
    tokenPrice: string,
    amountFiat: string,
  ) => {
    const amount = parseFloat(amountFiat) / parseFloat(tokenPrice)

    const final = formatTokenPrice(amount, 5)

    setAmountToReceive(final)
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

  useEffect(() => {
    setAddressTo(blockchainWallet?.fraxtalWalletPubK)
  }, [isOpen])

  useEffect(() => {
    let intervalId
    if (isOpen) {
      getSymbolPrice('ETHBRL')
      intervalId = setInterval(() => {
        getSymbolPrice('ETHBRL')
      }, 60000)
    }
    return () => clearInterval(intervalId)
  }, [isOpen])

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
      <div className="relative z-50 w-[250px] rounded-md bg-[#060621] p-8 py-12 pb-10 md:w-[500px]">
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
            Address to receive frxETH tokens
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
              Amount (BRL) to fund
            </label>
            <div
              onClick={() => {
                setFundAmount('100.00')
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
        <div className="mb-6 flex gap-x-2">
          <div className="">frxETH/BRL price:</div>
          {tokenPrice === 'loading' ? (
            <div className="h-5 w-32 animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
          ) : (
            <div>~ R$ {tokenPrice}</div>
          )}
        </div>
        <div className="mb-6 flex gap-x-2">
          <div className="">You will receive:</div>
          {tokenPrice === 'loading' ? (
            <div className="h-5 w-32 animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
          ) : (
            <div>~ {amountToReceive} frx</div>
          )}
        </div>
        <div className="relative mt-10 flex justify-between">
          <div
            className={`
            ${
              Number(fundAmount) > 0 && addressTo?.length > 0
                ? `${
                    isLoading
                      ? 'animate-pulse !bg-[#35428a]'
                      : 'cursor-pointer  hover:bg-[#35428a]'
                  } `
                : `!cursor-auto !bg-[#4f5b9bbb]`
            } rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff]
             `}
            onClick={() => {
              if (Number(fundAmount) > Number(blockchainWallet.balance)) {
                toast.error(`Fund amount cannot be greater than wallet balance`)
                return
              }
              if (
                !isLoading &&
                fundAmount &&
                Number(fundAmount) > 0 &&
                addressTo?.length > 0
              ) {
                setIsConfirmTransactionOpen(true)
              }
            }}
          >
            Transfer
          </div>
          {isConfirmTransactionOpen && (
            <div
              ref={confirmTransactionRef}
              className="absolute right-0 w-fit translate-x-[30%]"
            >
              <ConfirmFundICPWalletModal
                amount={fundAmount}
                wallet={addressTo}
                token={'XFI'}
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

export default OnRampModal
