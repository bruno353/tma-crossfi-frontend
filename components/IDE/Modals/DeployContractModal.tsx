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
import { TypeWalletProvider, cleanDocs } from '../MainPage'
import {
  ABIConstructorI,
  BlockchainContractProps,
  ContractABII,
  ContractInspectionI,
  NetworkIDE,
} from '@/types/blockchain-app'
import ConfirmDeployContractModal from './ConfirmDeployContractModal'
import { transformString, truncateString } from '@/utils/functions'
import { AccountContext } from '@/contexts/AccountContext'

export interface ModalI {
  contract: BlockchainContractProps
  environment: string
  wallet: string
  walletFreighter: string
  walletEVM: string
  walletBalance: string
  walletProvider: TypeWalletProvider
  onUpdateM(contractABIName?: string): void
  onSaveContractABIs(contractABIs?: ContractABII[]): void
  onClose(): void
  isOpen: boolean
  contractABIs?: ContractABII[]
}

const DeployContractModal = ({
  isOpen,
  environment,
  wallet,
  walletFreighter,
  walletEVM,
  walletBalance,
  walletProvider,
  onUpdateM,
  onSaveContractABIs,
  onClose,
  contract,
  contractABIs,
}: ModalI) => {
  const { ideChain } = useContext(AccountContext)

  const [isLoading, setIsLoading] = useState(null)

  const [abiOptions, setABIOptions] = useState<ValueObject[]>(null)
  const [abiSelected, setABISelected] = useState<ValueObject>()
  const [constructorValues, setConstructorValues] = useState<[]>([])

  const [isConfirmTransactionOpen, setIsConfirmTransactionOpen] =
    useState<boolean>(false)

  const confirmTransactionRef = useRef(null)

  const modalRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (event) => {
    if (event.target === modalRef.current) {
      onClose()
    }
  }

  function handleNewABIs() {
    console.log('fui chamado handle new abi')
    console.log(contractABIs)
    const finalSet: ValueObject[] = []
    for (let i = 0; i < contractABIs?.length; i++) {
      finalSet.push({
        name: contractABIs[i].name,
        value: contractABIs[i].name,
      })
    }
    setABIOptions(finalSet)
    setABISelected(finalSet[0])
  }

  function renderConstructor(abiName) {
    const cntABIIndex = contractABIs?.findIndex((ct) => ct.name === abiName)
    const cntABI = contractABIs[cntABIIndex]

    if (
      !cntABI?.constructor ||
      cntABI?.constructor?.length === 0 ||
      !Array.isArray(cntABI?.constructor)
    ) {
      return
    }
    return (
      <div className="mb-2 mt-4">
        <div className="mb-2 text-[#c5c4c4]">Constructor:</div>
        <div className="grid  max-h-[200px] grid-cols-2 justify-between gap-x-4 gap-y-2 overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
          {cntABI?.constructor?.map((constructorInput, index) => (
            <div key={index}>
              <div className="mb-1 flex items-center justify-between gap-x-2 text-base font-light">
                <div className="text-sm">
                  {truncateString(constructorInput?.name, 15)}
                </div>
                <div className="text-xs text-[#c5c4c4]">
                  {constructorInput?.type}
                </div>
              </div>

              <input
                type="text"
                id="workspaceName"
                name="workspaceName"
                value={constructorInput?.value}
                onChange={(e) => {
                  if (!isLoading) {
                    cntABI.constructor[index].value = e.target.value
                    const newABIs = [...contractABIs]
                    newABIs[cntABIIndex] = cntABI
                    onSaveContractABIs(newABIs)
                    // const newContracts = [...blockchainContracts]
                    // const cntIndex = newContracts.findIndex(
                    //   (cnt) => cnt.id === blockchainContractSelected?.id,
                    // )

                    // newContracts[cntIndex].contractInspections[index].inputs[
                    //   indexInput
                    // ].value = e.target.value

                    // setBlockchainContracts(newContracts)
                    // setBlockchainContractSelected(newContracts[cntIndex])
                  }
                }}
                className="w-full rounded-md border border-transparent px-3 py-1 text-base placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
              />
            </div>
          ))}
        </div>
      </div>
    )
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

  function getWallet() {
    let address = ''
    if (walletProvider === TypeWalletProvider.ACCELAR) {
      address = wallet
    } else if (walletProvider === TypeWalletProvider.FREIGHTER) {
      address = walletFreighter
    } else if (walletProvider === TypeWalletProvider.EVM) {
      address = walletEVM
    }
    return address
  }

  useEffect(() => {
    handleNewABIs()
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
              {transformString(getWallet(), 7)}
            </span>
          </div>
          {walletProvider === TypeWalletProvider.ACCELAR && (
            <div className="text-[#c5c4c4]">
              Balance: <span className="text-[#fff]">{walletBalance}</span>
            </div>
          )}
          {ideChain === NetworkIDE.CROSSFI && (
            <div>
              <div className="w-fit min-w-[200px]">
                <div className="mb-2 text-[#c5c4c4]">ABI:</div>
                <Dropdown
                  optionSelected={abiSelected}
                  options={abiOptions}
                  onValueChange={(value) => {
                    setABISelected(value)
                  }}
                  classNameForDropdown="!px-1 !pr-2 !py-1 !font-medium"
                  classNameForPopUp="!px-1 !pr-2 !py-1"
                  classNameForPopUpBox="!translate-y-[35px]"
                />
              </div>
              <div
                onClick={() => {
                  console.log(contractABIs)
                }}
              >
                {contractABIs && renderConstructor(abiSelected?.name)}
              </div>
            </div>
          )}
        </div>

        {Number(walletBalance) === 0 &&
          walletProvider === TypeWalletProvider.ACCELAR && (
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
              wallet={
                walletProvider === TypeWalletProvider.ACCELAR
                  ? wallet
                  : walletFreighter
              }
              environment={environment}
              onConfirmTransaction={() => {
                onUpdateM(abiSelected?.value)
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
