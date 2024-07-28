/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import {
  useEffect,
  useState,
  ChangeEvent,
  FC,
  useContext,
  useRef,
  useCallback,
} from 'react'
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
import ConfirmGenericTransaction from './ConfirmGenericTransaction'
import WebsocketComponent from '@/components/Chat/Websocket/WebsocketChat'
import {
  netEnvironmentToConfigs,
  netEnvironmentToLabel,
} from '@/types/consts/on-ramp'

export interface ModalI {
  blockchainWallet: BlockchainWalletProps
  netEnvironment: string
  onUpdateM(): void
  onClose(): void
  isOpen: boolean
}

export enum OnRampStatus {
  ORDER_CREATION,
  PIX_RENDER,
}

export interface PixDataI {
  brCode: string
  qrCodeImage: string
  valueToReceive: string
  id: string
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
  const [onRampStatus, setOnRampStatus] = useState<OnRampStatus>(
    OnRampStatus.ORDER_CREATION,
  )
  const [pixData, setPixData] = useState<PixDataI | null>()

  const [isLoading, setIsLoading] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)

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
    setIsConfirmTransactionOpen(false)
    if (!isLoading) {
      const value = e.target.value
      setAddressTo(value)
    }
  }

  const handleCreateOrderPix = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const data = {
      id: blockchainWallet?.id,
      value: Number(fundAmount),
      walletNetwork:
        netEnvironmentToLabel[blockchainWallet.network][netEnvironment],
    }

    try {
      const res = await callAxiosBackend(
        'post',
        '/blockchain/on-ramp/functions/createOrderPix',
        userSessionToken,
        data,
      )
      toast.success(`Order created`)
      setOnRampStatus(OnRampStatus.PIX_RENDER)
      setPixData(res)
      //   startCheckOrder(res.id)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }

  const checkOrder = async (id: string) => {
    console.log('check order called')
    const { userSessionToken } = parseCookies()

    try {
      const res = await callAxiosBackend(
        'get',
        `/blockchain/on-ramp/functions/getOrderPix?id=${id}`,
        userSessionToken,
      )
      if (res?.status === 'FINALIZED') {
        toast.success(`Token transfered`)
        setOnRampStatus(OnRampStatus.ORDER_CREATION)
        setPixData(null)
        setFundAmount('0.0')
        onUpdateM()
      }
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
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
    const sanitizedPrice = tokenPrice.replace(/,/g, '')

    console.log(parseFloat(amountFiat))
    console.log(parseFloat(sanitizedPrice))
    const amount = parseFloat(amountFiat) / parseFloat(sanitizedPrice)

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

  //   async function startCheckOrder(id: string) {
  //     let counter = 0
  //     let intervalId
  //     if (
  //       isOpen &&
  //       onRampStatus === OnRampStatus.ORDER_CREATION &&
  //       counter < 300
  //     ) {
  //       intervalId = setInterval(() => {
  //         counter += 1
  //         checkOrder(id)
  //       }, 30000)
  //     }
  //     return () => clearInterval(intervalId)
  //   }

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

  if (onRampStatus === OnRampStatus.ORDER_CREATION) {
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
        <div className="relative z-50 w-[250px] rounded-md bg-[#060621] p-8 py-12 pb-10 pt-6 md:w-[500px]">
          <div onClick={onClose} className="absolute right-5 top-5">
            <img
              alt="delete"
              src="/images/delete.svg "
              className="w-[25px]  cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921]"
            ></img>
          </div>
          <div className="mb-8 flex gap-x-2">
            <div className="flex items-center gap-x-3">
              <img
                alt="frax"
                src={
                  netEnvironmentToConfigs[blockchainWallet.network]?.imageSrc
                }
                className={
                  netEnvironmentToConfigs[blockchainWallet.network]?.imageStyle
                }
              ></img>
              <div className="text-[20px]">
                On-ramp{' '}
                {netEnvironmentToConfigs[blockchainWallet.network]?.label}
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
              <div className="absolute right-0 flex w-fit max-w-[400px] -translate-y-[110%] translate-x-[20%] items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
                For Brazilian citizens, you can now enter the{' '}
                {netEnvironmentToConfigs[blockchainWallet.network]?.label} world
                buying{' '}
                {netEnvironmentToConfigs[blockchainWallet.network]?.token}{' '}
                directly through Pix payments. After sending the Pix order, the
                tokens will be transferred to your wallet immediately.
              </div>
            )}
          </div>
          <div className="mb-6">
            <label
              htmlFor="workspaceName"
              className="mb-2 block text-[14px] text-[#C5C4C4]"
            >
              Address to receive{' '}
              {netEnvironmentToConfigs[blockchainWallet.network]?.token} tokens
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
                Amount (BRL) to fund - Method: Pix Brazil
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
            <div className="">
              {netEnvironmentToConfigs[blockchainWallet.network]?.token}/BRL
              price:
            </div>
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
              <div>
                ~ {amountToReceive}{' '}
                {netEnvironmentToConfigs[blockchainWallet.network]?.token}
              </div>
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
                          : '!cursor-pointer  !bg-[#273687] hover:bg-[#35428a] '
                      } `
                    : `!cursor-auto !bg-[#4f5b9bbb]`
                } rounded-[5px] p-[4px] px-[15px] text-[14px] text-[#fff]
                 `}
              onClick={() => {
                if (Number(fundAmount) > 100) {
                  toast.error(`Fund amount cannot be greater than R$100.00`)
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
              Create Pix order
            </div>
            {isConfirmTransactionOpen && (
              <div
                ref={confirmTransactionRef}
                className="absolute right-0 w-fit -translate-x-[5%]"
              >
                <ConfirmGenericTransaction
                  description="You are going to create a pix order request"
                  onConfirmTransaction={() => {
                    setIsConfirmTransactionOpen(false)
                    handleCreateOrderPix()
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } else if (onRampStatus === OnRampStatus.PIX_RENDER) {
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
        <div className="relative z-50 w-[250px] rounded-md bg-[#060621] p-8 py-12 pb-10 pt-6 md:w-[500px]">
          <div onClick={onClose} className="absolute right-5 top-5">
            <img
              alt="frax"
              src="/images/delete.svg "
              className="w-[25px]  cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921]"
            ></img>
          </div>
          <div className="mb-8 flex gap-x-2">
            <div className="flex items-center gap-x-3">
              <img
                alt="delete"
                src="/images/workspace/frax.svg"
                className="w-[35px]"
              ></img>
              <div className="text-[20px]">On-ramp Fraxtal</div>
            </div>
            <img
              alt="ethereum avatar"
              src="/images/header/help.svg"
              className="mb-2 w-[15px] cursor-pointer rounded-full"
              onMouseEnter={() => setIsInfoOpen(true)}
              onMouseLeave={() => setIsInfoOpen(false)}
            ></img>
            {isInfoOpen && (
              <div className="absolute right-0 flex w-fit max-w-[400px] -translate-y-[110%] translate-x-[20%] items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
                For Brazilian citizens, you can now enter the Frax world by
                buying frxETH directly through Pix payments. After sending the
                Pix order, the tokens will be transferred to your wallet
                immediately.
              </div>
            )}
          </div>
          <div>
            <img
              alt="ethereum avatar"
              src={pixData?.qrCodeImage}
              className="mx-auto mb-2 w-[150px] 2xl:w-[300px]"
            ></img>
          </div>
          <div className="mt-4 flex gap-x-2 px-5">
            <div className="w-full break-words text-[#0354EC]">
              {pixData?.brCode}
            </div>
            <img
              alt="ethereum avatar"
              src="/images/workspace/copy.svg"
              className="w-[20px] cursor-pointer rounded-full"
              onClick={(event) => {
                event.stopPropagation()
                navigator.clipboard.writeText(pixData?.brCode)
                toast.success('Code copied')
              }}
            ></img>
          </div>
          <div className="mt-3 px-5">
            You are receiving:{' '}
            {String(Number(pixData?.valueToReceive) * 10 ** 18)} frxETH tokens
          </div>
          <div className="relative ml-auto mt-10 flex justify-between">
            <div
              className={`ml-auto cursor-pointer rounded-[5px] bg-[#c22336] p-[4px] px-[15px] text-[14px] text-[#fff]`}
              onClick={() => {
                setOnRampStatus(OnRampStatus.ORDER_CREATION)
              }}
            >
              Cancel
            </div>
          </div>
        </div>
        <WebsocketComponent
          workspaceId={blockchainWallet.workspaceId}
          handleNewChannelMessage={(message) => {
            console.log('websocket funcionando show')
          }}
          handleNewConversationMessage={(message) => {
            console.log('websocket funcionando show')
          }}
          handleNewOrderPixPaidMessage={(message) => {
            if (message === pixData.id) {
              onUpdateM()
            }
          }}
        />
      </div>
    )
  }
}

export default OnRampModal
