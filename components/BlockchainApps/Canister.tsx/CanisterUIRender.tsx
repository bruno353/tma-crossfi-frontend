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
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { UserWorkspaceProps } from '@/types/workspace'
import { BlockchainAppProps, ICPCanisterProps } from '@/types/blockchain-app'
import EditAppModal from '../Modals/EditAppModal'
import { formatDate, transformString } from '@/utils/functions'
import { optionsNetwork } from '../Modals/NewAppModal'
import NewCanisterModal from '../Modals/NewCanisterModal'
import EditCanisterModal from '../Modals/EditCanisterModal'
import { CanisterTemplateProps } from '@/types/canister-template'
import { callCanister } from '@/utils/api-blockchain'

export interface ModalI {
  canister: ICPCanisterProps
  canisterTemplate: CanisterTemplateProps
  isUserAdmin: boolean
  onUpdate(): void
}

const CanistersUIRender = ({
  canister,
  canisterTemplate,
  onUpdate,
  isUserAdmin,
}: ModalI) => {
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState<any>()
  const [canisterTemplateState, setCanisterTemplateState] =
    useState<CanisterTemplateProps>(canisterTemplate)
  const [isCopyInfoOpen, setIsCopyInfoOpen] = useState<any>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isCreatingNewCanisterOpen, setIsCreatingNewCanisterOpen] =
    useState<boolean>(false)
  const [isInfoWalletOpen, setIsInfoWalletOpen] = useState<boolean>(false)

  const { push } = useRouter()
  const pathname = usePathname()

  const menuRef = useRef(null)
  const editRef = useRef(null)
  const urlRef = useRef(null)

  const closeMenu = () => {
    setIsDeleteUserOpen(false)
  }

  const handleInputChange = (e, index, index2) => {
    const canisterFinal = { ...canisterTemplateState }
    if (!isLoading) {
      canisterFinal.functions[index].callArguments[index2].value =
        e.target.value
      setCanisterTemplateState(canisterFinal)
    }
  }

  const checkIfAllArgumentsValuesAreFilled = (index) => {
    const args = canisterTemplateState.functions[index].callArguments
    for (let i = 0; i < args.length; i++) {
      if (!args[i].value || args[i].value?.length === 0) {
        return false
      }
    }
    return true
  }

  const handleCallCanister = async (index) => {
    const args = canisterTemplateState.functions[index]
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const valuesArgs = []
    for (let i = 0; i < args.callArguments.length; i++) {
      valuesArgs.push(args.callArguments[i].value)
    }

    const resultJoinArgs = `("${valuesArgs.join(', ')}")`

    console.log('meu result join')
    console.log(resultJoinArgs)

    const final = {
      canisterId: canister?.canisterId,
      icpWalletId: canister.icpWallet.id,
      methodName: args.methodName,
      callArguments: resultJoinArgs,
    }

    try {
      const res = await callCanister(final, userSessionToken)
      toast.success(`Success`)
      setIsLoading(false)
      console.log(' aresposta')
      console.log(res)
      // setting the response
      const canisterFinal = { ...canisterTemplateState }
      canisterFinal.functions[index].callResponse = res
      setCanisterTemplateState(canisterFinal)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
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

  function NoAppsFound() {
    return (
      <div className="mx-auto w-fit items-center justify-center text-[15px] font-light">
        <SmileySad size={32} className="text-blue-500 mx-auto  mb-2" />
        <span>No Canisters found, deploy your first App</span>
      </div>
    )
  }

  return (
    <div className="text-[14px] text-[#C5C4C4]">
      <div className=" text-[14px] font-normal">
        <div className="relative mb-[18px] flex w-fit gap-x-[5px]">
          <div>ICP canister-wallet: {canister?.icpWallet.walletId}</div>
          <img
            alt="ethereum avatar"
            src="/images/header/help.svg"
            className="w-[17px] cursor-pointer rounded-full"
            onMouseEnter={() => setIsInfoWalletOpen(true)}
            onMouseLeave={() => setIsInfoWalletOpen(false)}
          ></img>
          {isInfoWalletOpen && (
            <div className="absolute right-0 flex  translate-x-[105%] w-[80%]  items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
              This ICP wallet is the canister's controller, all the interactions
              interactions will be done through this wallet.
            </div>
          )}
        </div>
        <div className="grid gap-y-[25px]">
          {canisterTemplate?.functions.length === 0 ? (
            NoAppsFound()
          ) : (
            <div className="">
              <div className="max-h-[calc(100vh-32rem)] overflow-y-auto  scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md ">
                {' '}
                {canisterTemplateState?.functions.map(
                  (canisterTFunction, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-x-[5px]  rounded-md border-[1px] border-[#c5c4c47c] px-[25px] py-[20px] text-[15px] font-normal hover:bg-[#7775840c]`}
                    >
                      <div className="flex w-full max-w-[20%] gap-x-[7px]">
                        <div
                          ref={editRef}
                          className="relative flex w-fit gap-x-[7px]"
                        >
                          {isCopyInfoOpen === canister.id && (
                            <div className="absolute right-0 !z-50 flex w-fit -translate-y-[10%]  translate-x-[120%]   items-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                              Copy id
                            </div>
                          )}
                          <div className="text-[#fff]">
                            <div className=" overflow-hidden truncate text-ellipsis whitespace-nowrap text-[16px]">
                              {canisterTFunction.methodName}
                            </div>
                            <div className="mt-[20px]">
                              {canisterTFunction?.callArguments.map(
                                (callArgument, index2) => (
                                  <input
                                    key={index2}
                                    type="text"
                                    maxLength={50}
                                    id="workspaceName"
                                    placeholder={callArgument.name}
                                    name="workspaceName"
                                    value={callArgument.value}
                                    onChange={(event) => {
                                      handleInputChange(event, index, index2)
                                    }}
                                    className="w-full rounded-md border border-transparent px-6 py-2 text-base text-body-color placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
                                  />
                                ),
                              )}
                            </div>
                            <div
                              className={`${
                                !checkIfAllArgumentsValuesAreFilled(index) &&
                                '!cursor-auto !bg-[#8d96c5b7]'
                              } ${
                                isLoading
                                  ? 'animate-pulse !bg-[#35428a]'
                                  : 'cursor-pointer  hover:bg-[#35428a]'
                              }  mt-[15px] w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff]`}
                              onClick={() => {
                                if (
                                  !isLoading &&
                                  checkIfAllArgumentsValuesAreFilled(index)
                                ) {
                                  handleCallCanister(index)
                                }
                              }}
                            >
                              Call canister
                            </div>
                            {canisterTFunction.callResponse && (
                              <div className="mt-[30px]">
                                Response: {canisterTFunction.callResponse}{' '}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* {isEditCanisterOpen && (
        <EditCanisterModal
          isOpen={isEditCanisterOpen !== false}
          onClose={() => {
            setIsEditCanisterOpen(false)
          }}
          onUpdateM={() => {
            onUpdate()
            setIsEditCanisterOpen(false)
          }}
          canister={canisters.find(
            (canister) => canister.id === isEditCanisterOpen,
          )}
        />
      )} */}
      {/* {isCreatingNewCanisterOpen && (
        <NewCanisterModal
          isOpen={isCreatingNewCanisterOpen}
          onClose={() => {
            setIsCreatingNewCanisterOpen(false)
          }}
          onUpdateM={() => {
            onUpdate()
            setIsCreatingNewCanisterOpen(false)
          }}
          app={app}
        />
      )} */}
    </div>
  )
}

export default CanistersUIRender
