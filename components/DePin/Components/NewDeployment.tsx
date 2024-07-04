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
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Eye, EyeSlash, SmileySad } from 'phosphor-react'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import {
  formatDate,
  formatTokenPrice,
  transformString,
} from '@/utils/functions'
import { LLMAppProps } from '@/types/llm'
import {
  depinOptionsFeatures,
  depinPaymentMethodsAccelar,
  depinPaymentMethodsEVM,
} from '@/types/consts/depin'
import Dropdown, { ValueObject } from '@/components/Modals/Dropdown'
import { AccountContext } from '@/contexts/AccountContext'
import { callAxiosBackend } from '@/utils/general-api'
// import EditWorkflowModal from './Modals/EditWorkflowModal'
import { parseCookies } from 'nookies'
import { TypeWalletProvider } from '@/components/IDE/MainPage'
import { BlockchainWalletProps } from '@/types/blockchain-app'
import ConnectButton from '@/contexts/ConnectButton'
import { useAccount } from 'wagmi'
import ConfirmGenericTransaction from '@/components/BlockchainWallets/Modals/ConfirmGenericTransaction'
import fraxtalContractABI from '../abi-frax/fraxtalContractABI.json'

export interface ModalI {
  onUpdate(): void
  setIsCreatingNewApp(): void
}

const NewDeployment = ({ onUpdate, setIsCreatingNewApp }: ModalI) => {
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState<any>()
  const [isEditInfoOpen, setIsEditInfoOpen] = useState<any>()
  const [isEditAppOpen, setIsEditAppOpen] = useState<any>()
  const [deploymentName, setDeploymentName] = useState('')
  const [bidAmount, setBidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(null)
  const [sdlValue, setSDLValue] = useState('')
  const [tokenPrice, setTokenPrice] = useState('0.0')
  const [isLoadingWallets, setIsLoadingWallets] = useState(false)
  const [blockchainWalletsSelected, setBlockchainWalletsSelected] =
    useState<ValueObject>()

  const [isConfirmTransactionOpen, setIsConfirmTransactionOpen] =
    useState<any>(false)

  const confirmTransactionRef = useRef(null)

  const { address, chain } = useAccount()

  const [blockchainWalletsDropdown, setBlockchainWalletsDropdown] =
    useState<ValueObject[]>()
  const [selectedFeature, setSelectedFeature] = useState<ValueObject>(
    depinOptionsFeatures[0],
  )
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<ValueObject>(depinPaymentMethodsAccelar[0])

  const [blockchainWallets, setBlockchainWallets] = useState<
    BlockchainWalletProps[]
  >([])

  const [walletProvider, setWalletProvider] = useState<TypeWalletProvider>(
    TypeWalletProvider.ACCELAR,
  )

  const { workspace, user, isDeployingNewDepinFeature } =
    useContext(AccountContext)

  const { push } = useRouter()
  const pathname = usePathname()

  const menuRef = useRef(null)
  const editRef = useRef(null)

  const closeMenu = () => {
    setIsDeleteUserOpen(false)
  }

  const handleInputChangeName = (e) => {
    if (!isLoading) {
      setDeploymentName(e.target.value)
    }
  }

  const handleInputBidAmount = (e) => {
    if (!isLoading) {
      const value = e.target.value
      // Esta expressão regular permite apenas números
      const regex = /^\d*\.?\d*$/

      if (regex.test(value)) {
        setBidAmount(value)
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Clicked outside of the menu, so close it
        closeMenu()
      }
    }

    // Add event listener when the menu is open
    if (isDeleteUserOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      // Remove event listener when the menu is closed
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDeleteUserOpen])

  function handleClickApp(id: string, event) {
    console.log('cliquei no app ism')
    if (!editRef?.current?.contains(event.target)) {
      push(`${pathname}/${id}`)
    }
  }

  function formChecks() {
    if (
      deploymentName?.length > 0 &&
      sdlValue?.length > 0 &&
      bidAmount?.length > 0
    ) {
      if (
        walletProvider === TypeWalletProvider?.ACCELAR &&
        blockchainWalletsSelected
      ) {
        return true
      } else if (
        walletProvider === TypeWalletProvider?.EVM &&
        address?.length > 0
      ) {
        return true
      }
    }
    return false
  }

  const handleAccelarDeployment = async () => {
    if (!formChecks()) {
      toast.error('Complete the form')
      return
    }
    if (selectedPaymentMethod.value === 'pix') {
      toast.error('Pix paymenths is disable for this hour in Brazil')
      return
    }
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const data = {
      walletId: blockchainWalletsSelected.value,
      bidAmount,
      network: 'FRAXTAL_MAINNET',
      depinFeature: 'AKASH',
      sdl: 'sdl',
    }

    try {
      const res = await callAxiosBackend(
        'post',
        '/blockchain/depin/functions/createDeploymentOrder',
        userSessionToken,
        data,
      )
      toast.success(`Order created`)
      console.log(res)
      onUpdate()
      //   startCheckOrder(res.id)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }

  const handleEVMDeployment = async () => {
    if (!formChecks()) {
      toast.error('Complete the form')
      return
    }
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    try {
      const res = await write(
        functionNameFinal,
        functionParams,
        fraxtalContractABI,
        chain,
        address,
        addressContract,
        value,
      )
      console.log('rtespo')
      console.log(res)

      const newContracts = [...blockchainContracts]
      const cntIndex = newContracts.findIndex(
        (cnt) => cnt.id === blockchainContractSelected?.id,
      )
      newContracts[cntIndex].consoleLogs.unshift({
        type: 'contractCall',
        functionName: contractInspection.functionName,
        args: functionParams,
        responseValue: res.transactionHash,
        stateMutability: contractInspection.stateMutability,
        desc: address,
        createdAt: String(new Date()),
      })

      setBlockchainContracts(newContracts)
      setBlockchainContractSelected(newContracts[cntIndex])
    } catch (err) {
      console.log(err)
      console.log('Error: ' + err?.response?.data?.message)

      const newContracts = [...blockchainContracts]
      const cntIndex = newContracts.findIndex(
        (cnt) => cnt.id === blockchainContractSelected?.id,
      )
      newContracts[cntIndex].consoleLogs.unshift({
        type: 'deployError',
        desc: err?.response?.data?.message ?? 'Check metamask for log error',
        contractName: blockchainContractSelected?.name,
        createdAt: String(new Date()),
      })

      setBlockchainContracts(newContracts)
      setBlockchainContractSelected(newContracts[cntIndex])
    }
  }

  const handleCreateDeployment = async () => {
    if (walletProvider === TypeWalletProvider.ACCELAR) {
      handleAccelarDeployment()
    } else if (walletProvider === TypeWalletProvider.EVM) {
      handleEVMDeployment()
    }
  }

  async function getWalletsFrax() {
    setIsLoadingWallets(true)
    const { userSessionToken } = parseCookies()

    try {
      const res = await callAxiosBackend(
        'get',
        `/blockchain/functions/getWorkspaceWallets?id=${workspace.id}&network=FRAXTAL`,
        userSessionToken,
      )
      const walletsToSet = []
      for (let i = 0; i < res?.length; i++) {
        walletsToSet.push({
          name: transformString(res[i].fraxtalWalletPubK, 5),
          value: res[i].id,
        })
      }
      setBlockchainWalletsDropdown(walletsToSet)
      setBlockchainWallets(res)
      if (walletsToSet?.length > 0) {
        setBlockchainWalletsSelected(walletsToSet[0])
      }
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoadingWallets(false)
    setIsLoading(false)
  }

  const getDeploymentPrice = async () => {
    return
    setTokenPrice('loading')
    const { userSessionToken } = parseCookies()

    try {
      const res = await callAxiosBackend(
        'get',
        `/blockchain/depin/functions/getDeploymentPrice?network=FRAXTAL_MAINNET&depinFeature=AKASH`,
        userSessionToken,
      )
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const finalPrice = formatTokenPrice(res.price)
      setTokenPrice(finalPrice)
    } catch (err) {
      console.log(err)
      toast.error(`Error getting symbol price`)
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
    let intervalId
    if (isDeployingNewDepinFeature) {
      getWalletsFrax()
      getDeploymentPrice()
      intervalId = setInterval(() => {
        getDeploymentPrice()
      }, 180000)
    }
    return () => clearInterval(intervalId)
  }, [isDeployingNewDepinFeature])

  return (
    <div className="text-[14px] text-[#C5C4C4]">
      <div className=" text-[14px] font-normal">
        <div className="grid gap-y-[25px]">
          <div className="flex items-center gap-x-4">
            <img
              onClick={() => {
                setIsCreatingNewApp()
              }}
              alt="ethereum avatar"
              src="/images/blockchain/arrow-left.svg"
              className="my-auto w-[25px] cursor-pointer 2xl:w-[20px]"
            ></img>
            <div className="text-2xl">New deployment</div>
          </div>
          <div className="h-[calc(100vh-26rem)] max-h-[calc(100vh-26rem)] overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:h-[calc(100vh-23rem)] 2xl:max-h-[calc(100vh-23rem)]">
            <div className="flex gap-x-20">
              <div>
                <div className="mb-6">
                  <label
                    htmlFor="workspaceName"
                    className="mb-2 block text-[14px] text-[#C5C4C4]"
                  >
                    Name*
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    id="workspaceName"
                    name="workspaceName"
                    value={deploymentName}
                    onChange={handleInputChangeName}
                    className="w-[400px] rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
                  />
                </div>{' '}
                <div className="mb-6">
                  <label
                    htmlFor="workspaceName"
                    className="mb-2 block text-[14px] text-[#C5C4C4]"
                  >
                    Feature
                  </label>
                  <div className="text-base">
                    <Dropdown
                      optionSelected={selectedFeature}
                      options={depinOptionsFeatures}
                      onValueChange={(value) => {
                        setSelectedFeature(value)
                      }}
                      classNameForDropdown="!min-w-[150px] !px-3 !py-1 !w-fit"
                      classNameForPopUp="!px-3"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="workspaceName"
                    className="mb-2 block text-[14px] text-[#C5C4C4]"
                  >
                    SDL*
                  </label>
                  <textarea
                    onChange={(e) => {
                      setSDLValue(e.target.value)
                    }}
                    className="h-[130px] w-[600px] rounded-md border border-transparent px-6 py-2 text-sm text-white placeholder-body-color outline-none  focus:border-primary dark:bg-[#242B51]"
                  >
                    {' '}
                  </textarea>{' '}
                </div>
                <div className="mb-2 flex gap-x-2">
                  <div className="">Estimated price:</div>
                  {tokenPrice === 'loading' ? (
                    <div className="h-5 w-32 animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
                  ) : (
                    <div>~ frxETH {tokenPrice}</div>
                  )}
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="workspaceName"
                    className="mb-2 block text-[14px] text-[#C5C4C4]"
                  >
                    Amount to bid* (frxETH)
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    id="workspaceName"
                    name="workspaceName"
                    value={bidAmount}
                    onChange={handleInputBidAmount}
                    className="w-[400px] rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
                  />
                </div>{' '}
                <div className="relative mt-10 w-[320px]">
                  <div
                    className={`
                ${
                  formChecks()
                    ? `${
                        isLoading
                          ? 'animate-pulse !bg-[#35428a]'
                          : 'cursor-pointer  hover:bg-[#35428a]'
                      } `
                    : `!cursor-auto !bg-[#4f5b9bbb]`
                } w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff]
                 `}
                    onClick={() => {
                      if (!isLoading && formChecks()) {
                        setIsConfirmTransactionOpen(true)
                      }
                    }}
                  >
                    Create Deployment
                  </div>
                  {isConfirmTransactionOpen && (
                    <div
                      ref={confirmTransactionRef}
                      className="absolute right-0 top-0 w-fit -translate-y-[100%] translate-x-[50%]"
                    >
                      <ConfirmGenericTransaction
                        description="You are going to create a deployment order request"
                        onConfirmTransaction={() => {
                          handleCreateDeployment()
                          setIsConfirmTransactionOpen(false)
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="mb-6">
                  <label
                    htmlFor="workspaceName"
                    className="mb-2 block text-[14px] text-[#C5C4C4]"
                  >
                    Wallet provider*
                  </label>
                  <div className="mb-3 mt-1 flex h-fit w-fit gap-x-[1px] rounded-xl bg-[#242B51] px-1 py-1">
                    <div
                      onClick={() => {
                        setWalletProvider(TypeWalletProvider.ACCELAR)
                        getWalletsFrax()
                      }}
                      className={`cursor-pointer rounded-xl px-2 py-1 ${
                        walletProvider === TypeWalletProvider.ACCELAR &&
                        'bg-[#dbdbdb1e]'
                      }`}
                    >
                      Accelar
                    </div>
                    <div
                      onClick={() => {
                        setSelectedPaymentMethod(depinPaymentMethodsEVM[0])
                        setWalletProvider(TypeWalletProvider.EVM)
                      }}
                      className={`cursor-pointer rounded-xl px-2 py-1 ${
                        walletProvider === TypeWalletProvider.EVM &&
                        'bg-[#dbdbdb1e]'
                      }`}
                    >
                      Metamask
                    </div>
                  </div>
                  {walletProvider === TypeWalletProvider.ACCELAR && (
                    <div>
                      {isLoadingWallets ? (
                        <div className="mb-2 flex h-[25px] w-[150px] animate-pulse rounded-md bg-[#dbdbdb1e]"></div>
                      ) : (
                        <>
                          <div className="flex w-fit items-center gap-x-1">
                            {blockchainWallets?.length > 0 ? (
                              <Dropdown
                                optionSelected={blockchainWalletsSelected}
                                options={blockchainWalletsDropdown}
                                onValueChange={(value) => {
                                  setBlockchainWalletsSelected(value)
                                }}
                                classNameForDropdown="!px-1 !pr-2 !py-1 !flex-grow !min-w-[130px] !font-medium"
                                classNameForPopUp="!px-1 !pr-2 !py-1"
                                classNameForPopUpBox="!translate-y-[35px]"
                              />
                            ) : (
                              <div className="my-auto mt-1 text-[#c5c4c4]">
                                create a wallet{' '}
                              </div>
                            )}

                            <a
                              href={`/workspace/${workspace.id}/blockchain-wallets`}
                            >
                              <div
                                title="Create wallet"
                                className="flex-grow-0 cursor-pointer text-[16px]"
                              >
                                +
                              </div>
                            </a>
                          </div>
                          {blockchainWalletsSelected && (
                            <div className="mt-2 text-[12px] text-[#c5c4c4]">
                              {' '}
                              Balance:{' '}
                              {
                                blockchainWallets?.find(
                                  (obj) =>
                                    obj.id === blockchainWalletsSelected.value,
                                )?.balance
                              }
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  {walletProvider === TypeWalletProvider.EVM && (
                    <div className="flex gap-x-2">
                      <div className="">
                        <ConnectButton />
                      </div>
                      <div>
                        {address && chain?.id !== 252 && (
                          <div className="text-[#c22336]">
                            * Change network to Fraxtal
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="workspaceName"
                    className="mb-2 block text-[14px] text-[#C5C4C4]"
                  >
                    Payment method
                  </label>
                  <div className="text-base">
                    <Dropdown
                      optionSelected={selectedPaymentMethod}
                      options={
                        walletProvider === TypeWalletProvider.ACCELAR
                          ? depinPaymentMethodsAccelar
                          : depinPaymentMethodsEVM
                      }
                      onValueChange={(value) => {
                        setSelectedPaymentMethod(value)
                      }}
                      classNameForDropdown="!min-w-[280px] !px-2 !py-1 !w-fit"
                      classNameForPopUp="!px-3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* {isEditAppOpen && (
        <EditWorkflowModal
          isOpen={isEditAppOpen}
          onClose={() => {
            setIsEditAppOpen(false)
          }}
          onUpdateM={() => {
            onUpdate()
            setIsEditAppOpen(false)
          }}
          app={apps.find((app) => app.id === isEditAppOpen)}
          onDelete={() => {
            onUpdate()
            setIsEditAppOpen(false)
          }}
        />
      )} */}
    </div>
  )
}

export default NewDeployment
