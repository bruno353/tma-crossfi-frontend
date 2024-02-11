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
import {
  createBlockchainApps,
  createWallet,
  deployCanister,
} from '@/utils/api-blockchain'
import { wait } from '@/utils/functions'
import { LLMAppProps } from '@/types/llm'
import { deployLLMInstance } from '@/utils/api-llm'

export const optionsLLMInstanceTemplate = [
  {
    name: 'NLP',
    value: 'NLP',
  },
  {
    name: 'FALCON_7B',
    value: 'FALCON_7B',
  },
]

export interface ModalI {
  app: LLMAppProps
  onUpdateM(value: string): void
  onClose(): void
  isOpen: boolean
}

const NewInstanceModal = ({ app, onUpdateM, onClose, isOpen }: ModalI) => {
  const [instanceName, setInstanceName] = useState('')
  const [isLoading, setIsLoading] = useState(null)
  const [isInfoInstanceTemplate, setIsInfoInstanceTemplate] = useState(false)

  const [selectedInstanceTemplate, setSelectedInstanceTemplate] =
    useState<ValueObject>(optionsLLMInstanceTemplate[0])

  const { push } = useRouter()
  const pathname = usePathname()

  const handleInputChange = (e) => {
    if (!isLoading) {
      setInstanceName(e.target.value)
    }
  }

  const handleCreateInstance = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const final = {
      id: app.id,
      name: instanceName,
      llmTemplate: selectedInstanceTemplate.value,
    }

    try {
      const instance = await deployLLMInstance(final, userSessionToken)
      setIsLoading(false)
      toast.success(`Success`)
      onUpdateM(instance.id)
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
            Instance name
          </label>
          <input
            type="text"
            maxLength={50}
            id="workspaceName"
            name="workspaceName"
            value={instanceName}
            onChange={handleInputChange}
            className="w-full rounded-md border border-transparent px-6 py-2 text-base text-body-color placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
          />
        </div>
        <div className="mb-6">
          <div className="flex justify-between gap-x-[5px]">
            <div className="relative flex w-fit items-start gap-x-[7px]">
              <label
                htmlFor="workspaceName"
                className="mb-2 block text-[14px] text-[#C5C4C4]"
              >
                Instance template
              </label>
              <img
                alt="ethereum avatar"
                src="/images/header/help.svg"
                className="w-[15px] cursor-pointer rounded-full"
                onMouseEnter={() => setIsInfoInstanceTemplate(true)}
                onMouseLeave={() => setIsInfoInstanceTemplate(false)}
              ></img>
              {isInfoInstanceTemplate && (
                <div className="absolute right-0 flex w-[200px] -translate-y-[80%] translate-x-[105%] items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
                  Select the LLM model for your deployment; you can choose from
                  a variety of models templates.
                </div>
              )}
            </div>
            <a
              href="https://docs.accelar.io/"
              target="_blank"
              rel="noreferrer"
              className="my-auto"
            >
              <div className="my-auto cursor-pointer text-[12px] text-[#0354EC]">
                Templates
              </div>
            </a>
          </div>

          <Dropdown
            optionSelected={selectedInstanceTemplate}
            options={optionsLLMInstanceTemplate}
            onValueChange={(value) => {
              setSelectedInstanceTemplate(value)
            }}
          />
        </div>
        <div className="mt-10 flex justify-start">
          <div
            className={`${
              (instanceName.length === 0 || !selectedInstanceTemplate) &&
              '!cursor-auto !bg-[#8d96c5b7]'
            } ${
              isLoading
                ? 'animate-pulse !bg-[#35428a]'
                : 'cursor-pointer  hover:bg-[#35428a]'
            }  rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
            onClick={() => {
              if (
                !isLoading &&
                instanceName.length > 0 &&
                selectedInstanceTemplate
              ) {
                handleCreateInstance()
              }
            }}
          >
            Deploy LLM instance
          </div>
        </div>
        {!isLoading && (
          <div className="absolute bottom-4 text-[#0354EC]">
            Loading: the instance deployment may take up to 20 minutes.
          </div>
        )}
      </div>
    </div>
  )
}

export default NewInstanceModal
