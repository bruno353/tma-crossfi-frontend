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
  changeUserWorkspaceRole,
  createWorkspace,
  inviteUserToWorkspace,
  updateWorkspace,
  updateWorkspaceLogo,
} from '@/utils/api'
import { parseCookies } from 'nookies'
import { CanisterTemplateProps } from '@/types/canister-template'
import { callCanister } from '@/utils/api-blockchain'
import { LLMInstanceProps } from '@/types/llm'
import { callLLMInstance } from '@/utils/api-llm'

export interface ModalI {
  instance: LLMInstanceProps
  isUserAdmin: boolean
  onUpdate(): void
}

const InstanceUIRender = ({ instance, onUpdate, isUserAdmin }: ModalI) => {
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState<any>()
  const [interactModelInput, setInteractModelInput] = useState<string>('')
  const [interactModelResponse, setInteractModelResponse] = useState<string>('')
  const [isCopyInfoOpen, setIsCopyInfoOpen] = useState<any>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isInfoWalletOpen, setIsInfoWalletOpen] = useState<boolean>(false)

  const { push } = useRouter()
  const pathname = usePathname()

  const menuRef = useRef(null)
  const editRef = useRef(null)
  const urlRef = useRef(null)

  const closeMenu = () => {
    setIsDeleteUserOpen(false)
  }

  const handleInputChange = (e) => {
    if (!isLoading) {
      setInteractModelInput(e.target.value)
    }
  }

  const checkIfAllArgumentsValuesAreFilled = () => {
    if (!interactModelInput || interactModelInput?.length === 0) {
      return false
    }
    return true
  }

  const handleCallInstance = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const final = {
      id: instance.id,
      input: interactModelInput,
    }

    try {
      const res = await callLLMInstance(final, userSessionToken)
      setIsLoading(false)
      console.log(' aresposta')
      console.log(res)
      // setting the response
      setInteractModelResponse(res)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="text-[14px] text-[#C5C4C4]">
      <div className=" text-[14px] font-normal">
        <div className="relative mb-[18px] flex w-fit gap-x-[5px]">
          <div>Instance model: {instance.url}</div>
          <img
            alt="ethereum avatar"
            src="/images/header/help.svg"
            className="w-[17px] cursor-pointer rounded-full"
            onMouseEnter={() => setIsInfoWalletOpen(true)}
            onMouseLeave={() => setIsInfoWalletOpen(false)}
          ></img>
          {isInfoWalletOpen && (
            <div className="absolute right-0 z-50 flex w-[50%] translate-x-[105%]  items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
              The open-source model related to this instance, you can interact
              with it by using the input bellow.
            </div>
          )}
        </div>
        <div className="grid gap-y-[25px]">
          <div className="">
            <div className="max-h-[calc(100vh-32rem)] overflow-y-auto  scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md ">
              {' '}
              <div
                className={`flex items-center gap-x-[5px]  rounded-md border-[1px] border-[#c5c4c47c] px-[25px] py-[20px] text-[15px] font-normal hover:bg-[#7775840c]`}
              >
                <div className="flex w-full max-w-[20%] gap-x-[7px]">
                  <div
                    ref={editRef}
                    className="relative flex w-fit gap-x-[7px]"
                  >
                    {isCopyInfoOpen === instance.id && (
                      <div className="absolute right-0 !z-50 flex w-fit -translate-y-[10%]  translate-x-[120%]   items-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                        Copy id
                      </div>
                    )}
                    <div className="text-[#fff]">
                      <div className=" overflow-hidden truncate text-ellipsis whitespace-nowrap text-[16px]">
                        Model interaction
                      </div>
                      <div className="mt-[20px]">
                        <input
                          type="text"
                          maxLength={10000}
                          id="workspaceName"
                          placeholder="Type here"
                          name="workspaceName"
                          value={interactModelInput}
                          onChange={(event) => {
                            handleInputChange(event)
                          }}
                          className="w-full rounded-md border border-transparent px-6 py-2 text-base text-body-color placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
                        />
                      </div>
                      <div
                        className={`${
                          !checkIfAllArgumentsValuesAreFilled() &&
                          '!cursor-auto !bg-[#8d96c5b7]'
                        } ${
                          isLoading
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  mt-[15px] w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff]`}
                        onClick={() => {
                          if (
                            !isLoading &&
                            checkIfAllArgumentsValuesAreFilled()
                          ) {
                            handleCallInstance()
                          }
                        }}
                      >
                        Call instance
                      </div>
                      {interactModelResponse &&
                        interactModelResponse.length > 0 && (
                          <div className="mt-[30px]">
                            Response: {interactModelResponse}{' '}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstanceUIRender
