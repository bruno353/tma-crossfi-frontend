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
import { ContractInspectionI } from '@/types/blockchain-app'

export interface ModalI {
  contractFunction: ContractInspectionI
  onUpdateM(): void
  onClose(): void
  onUpdateContractFunction(value: ContractInspectionI): void
  isOpen: boolean
}

const NewCallFunctionModal = ({
  isOpen,
  onUpdateM,
  onClose,
  contractFunction,
  onUpdateContractFunction,
}: ModalI) => {
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
      name: appName,
      walletNetwork: selected.value,
    }

    try {
      const wallet = await createWallet(final, userSessionToken)
      setIsLoading(false)
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
            {contractFunction?.functionName}
          </label>
        </div>
        <div className="max-h-[35vh] overflow-y-auto px-1 scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md ">
          <div>
            <div
              className="mb-4 whitespace-pre-wrap text-[#c5c4c4]"
              dangerouslySetInnerHTML={{
                __html: cleanDocs(contractFunction?.docs),
              }}
            />
          </div>
          <div className="mb-4 grid gap-y-3 ">
            {contractFunction?.inputs?.map((cntInsInput, indexInput) => (
              <div key={indexInput}>
                <div className="mb-1 flex items-center justify-between text-base font-light">
                  <div className="">{cntInsInput?.name}</div>
                  <div className="text-xs text-[#c5c4c4]">
                    {cntInsInput?.type}
                  </div>
                </div>

                <input
                  type="text"
                  id="workspaceName"
                  name="workspaceName"
                  value={cntInsInput?.value}
                  onChange={(e) => {
                    if (!isLoading) {
                      const newContractFunction = { ...contractFunction }
                      newContractFunction.inputs[indexInput].value =
                        e.target.value
                      onUpdateContractFunction(newContractFunction)
                    }
                  }}
                  className="w-full rounded-md border border-transparent px-6 py-2 text-base placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-start">
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
            Transact
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewCallFunctionModal
