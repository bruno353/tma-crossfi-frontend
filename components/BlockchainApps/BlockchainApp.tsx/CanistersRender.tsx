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
import { UserWorkspaceProps } from '@/types/workspace'
import { BlockchainAppProps, ICPCanisterProps } from '@/types/blockchain-app'
import EditAppModal from '../Modals/EditAppModal'
import { formatDate, transformString } from '@/utils/functions'
import { optionsNetwork } from '../Modals/NewAppModal'
import NewCanisterModal from '../Modals/NewCanisterModal'
import EditCanisterModal from '../Modals/EditCanisterModal'

export interface ModalI {
  app: BlockchainAppProps
  canisters: ICPCanisterProps[]
  isUserAdmin: boolean
  onUpdate(): void
}

const CanistersRender = ({ app, canisters, onUpdate, isUserAdmin }: ModalI) => {
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState<any>()
  const [isUserModalOpen, setIsUserModalOpen] = useState<any>()
  const [isEditInfoOpen, setIsEditInfoOpen] = useState<any>()
  const [isEditCanisterOpen, setIsEditCanisterOpen] = useState<any>()
  const [isCopyInfoOpen, setIsCopyInfoOpen] = useState<any>()
  const [isCreatingNewCanisterOpen, setIsCreatingNewCanisterOpen] =
    useState<boolean>(false)

  const { push } = useRouter()
  const pathname = usePathname()

  const menuRef = useRef(null)
  const editRef = useRef(null)
  const urlRef = useRef(null)

  const closeMenu = () => {
    setIsDeleteUserOpen(false)
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

  function handleClickCanisters(id: string, event) {
    if (
      !editRef?.current?.contains(event.target) &&
      !urlRef?.current?.contains(event.target)
    ) {
      push(`${pathname}/canister/${id}`)
    }
  }

  function NoAppsFound() {
    return (
      <div className="mx-auto w-fit items-center justify-center text-[15px] font-light">
        <SmileySad size={32} className="text-blue-500 mx-auto  mb-2" />
        <span>No Canisters found, deploy your first Canister</span>
      </div>
    )
  }

  return (
    <div className="text-[14px] text-[#C5C4C4]">
      <div className=" text-[14px] font-normal">
        <div className="mb-[18px]">
          <div
            onClick={() => {
              setIsCreatingNewCanisterOpen(true)
            }}
            className="w-fit cursor-pointer rounded-[5px]  bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]"
          >
            Deploy new canister
          </div>
        </div>
        <div className="grid gap-y-[25px]">
          {canisters?.length === 0 ? (
            NoAppsFound()
          ) : (
            <div className="">
              <div className="flex w-full gap-x-[5px] rounded-t-md bg-[#c5c4c40e] px-[15px] py-[8px]">
                <div className="w-full max-w-[20%]">Canister Id</div>
                <div className="w-full max-w-[38%]">URL</div>
                <div className="w-full max-w-[17%]">Type</div>
                <div className="w-full max-w-[10%]">Created at</div>
              </div>
              <div className="max-h-[calc(100vh-26rem)] overflow-y-auto rounded-b-md  border border-[#c5c4c41a] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:max-h-[calc(100vh-32rem)] ">
                {' '}
                {canisters?.map((canister, index) => (
                  <div
                    onClick={(event) => {
                      handleClickCanisters(canister.id, event)
                    }}
                    key={index}
                    className={`flex items-center  ${
                      index !== canisters?.length - 1 &&
                      'border-b-[1px] border-[#c5c4c41a]'
                    } cursor-pointer gap-x-[5px] px-[15px] py-[20px] text-[15px] font-normal hover:bg-[#7775840c]`}
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
                        <div>
                          <div className=" overflow-hidden truncate text-ellipsis whitespace-nowrap">
                            {canister.name}
                          </div>
                          <div className=" overflow-hidden truncate text-ellipsis whitespace-nowrap">
                            {transformString(canister.canisterId)}
                          </div>
                        </div>
                        <img
                          ref={editRef}
                          alt="ethereum avatar"
                          src="/images/workspace/copy.svg"
                          className="w-[20px] cursor-pointer rounded-full"
                          onMouseEnter={() => setIsCopyInfoOpen(canister.id)}
                          onMouseLeave={() => setIsCopyInfoOpen(null)}
                          onClick={(event) => {
                            event.stopPropagation()
                            navigator.clipboard.writeText(canister.canisterId)
                          }}
                        ></img>
                      </div>
                    </div>
                    <a
                      ref={urlRef}
                      onClick={(event) => {
                        event.stopPropagation()
                      }}
                      href={canister.url}
                      target="_blank"
                      className="w-full max-w-[38%]"
                      rel="noreferrer"
                    >
                      <div className="flex w-full items-center gap-x-[7px] hover:text-[#0354EC]">
                        {canister.url}
                      </div>
                    </a>

                    <div className="flex w-full max-w-[17%] items-center gap-x-[7px]">
                      {canister.typeTemplate}
                    </div>
                    <div className="w-full max-w-[10%] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                      {formatDate(canister.createdAt)}
                    </div>
                    <div className="ml-auto w-full max-w-[5%]">
                      {' '}
                      {isEditInfoOpen === canister.id && (
                        <div className="absolute flex w-fit -translate-x-[50%]   -translate-y-[100%]   items-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                          Edit canister
                        </div>
                      )}
                      {isUserAdmin && (
                        <img
                          ref={editRef}
                          alt="ethereum avatar"
                          src="/images/chat/pencil.svg"
                          className="w-[15px] cursor-pointer 2xl:w-[25px]"
                          onMouseEnter={() => setIsEditInfoOpen(canister.id)}
                          onMouseLeave={() => setIsEditInfoOpen(null)}
                          onClick={(event) => {
                            event.stopPropagation()
                            setIsEditCanisterOpen(canister.id)
                          }}
                        ></img>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {isEditCanisterOpen && (
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
      )}
      {isCreatingNewCanisterOpen && (
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
      )}
    </div>
  )
}

export default CanistersRender
