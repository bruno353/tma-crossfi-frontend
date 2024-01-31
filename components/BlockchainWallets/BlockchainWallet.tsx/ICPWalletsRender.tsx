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
import { BlockchainWalletProps, ICPWalletsProps } from '@/types/blockchain-app'
// import { optionsNetwork } from './Modals/NewAppModal'
// import EditAppModal from './Modals/EditAppModal'
import { formatDate, transformString } from '@/utils/functions'
import NewICPWalletModal from '../Modals/NewICPWalletModal'
import EditICPWalletModal from '../Modals/EditICPWalletModal'
import FundICPWalletModal from '../Modals/FundICPWalletModal'

export interface ModalI {
  wallets: ICPWalletsProps[]
  blockchainWallet: BlockchainWalletProps
  blockchainWalletId: string
  isUserAdmin: boolean
  onUpdate(): void
}

const ICPWalletsRender = ({
  wallets,
  onUpdate,
  isUserAdmin,
  blockchainWalletId,
  blockchainWallet,
}: ModalI) => {
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState<any>()
  const [isUserModalOpen, setIsUserModalOpen] = useState<any>()
  const [isEditInfoOpen, setIsEditInfoOpen] = useState<any>()
  const [isCopyInfoOpen, setIsCopyInfoOpen] = useState<any>()
  const [isEditWalletOpen, setIsEditWalletOpen] = useState<any>()
  const [isFundWalletOpen, setIsFundWalletOpen] = useState<any>()
  const [isDeployNewCanisterWalletOpen, setIsDeployNewCanisterWalletOpen] =
    useState<boolean>(false)
  const [isFundInfoOpen, setIsFundInfoOpen] = useState<any>()

  const { push } = useRouter()
  const pathname = usePathname()

  const menuRef = useRef(null)
  const editRef = useRef(null)

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

  function handleClickApp(id: string, event) {
    if (!editRef?.current?.contains(event.target)) {
      push(`${pathname}/${id}`)
    }
  }

  function NoAppsFound() {
    return (
      <div className="mx-auto w-fit items-center justify-center text-[15px] font-light">
        <SmileySad size={32} className="text-blue-500 mx-auto  mb-2" />
        <span>No Canister-wallets found, create your first Wallet</span>
      </div>
    )
  }

  return (
    <div className="text-[14px] text-[#C5C4C4]">
      <div className=" text-[14px] font-normal">
        <div className="mb-[18px]">
          <div
            onClick={() => {
              setIsDeployNewCanisterWalletOpen(true)
            }}
            className="w-fit cursor-pointer rounded-[5px]  bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]"
          >
            Deploy new Canister-wallet
          </div>
        </div>
        <div className="grid gap-y-[25px]">
          {wallets?.length === 0 ? (
            NoAppsFound()
          ) : (
            <div className="">
              <div className="flex w-full rounded-t-md bg-[#c5c4c40e] px-[15px] py-[8px]">
                <div className="w-full max-w-[30%]">Canister-wallet Id</div>
                <div className="w-full max-w-[30%]">Description</div>
                <div className="w-full max-w-[15%]">Balance</div>
                <div className="w-full max-w-[15%]">created at</div>
              </div>
              <div className="max-h-[calc(100vh-42rem)] overflow-y-auto  rounded-b-md border border-[#c5c4c40e] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md ">
                {' '}
                {wallets?.map((wallet, index) => (
                  <div
                    onClick={(event) => {
                      handleClickApp(wallet.id, event)
                    }}
                    key={index}
                    className={`flex items-center  ${
                      index !== wallets?.length - 1 &&
                      'border-b-[1px] border-[#c5c4c40e]'
                    } cursor-pointer gap-x-[2px] px-[15px] py-[20px] text-[15px] font-normal hover:bg-[#7775840c]`}
                  >
                    <div className="flex w-full max-w-[30%] gap-x-[7px]">
                      <div
                        ref={editRef}
                        className="relative flex w-fit gap-x-[7px]"
                      >
                        {isCopyInfoOpen === wallet.id && (
                          <div className="absolute right-0 !z-50 flex w-fit -translate-y-[10%]  translate-x-[120%]   items-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                            Copy id
                          </div>
                        )}
                        <div className=" overflow-hidden truncate text-ellipsis whitespace-nowrap">
                          {transformString(wallet.walletId)}
                        </div>
                        <img
                          ref={editRef}
                          alt="ethereum avatar"
                          src="/images/workspace/copy.svg"
                          className="w-[20px] cursor-pointer rounded-full"
                          onMouseEnter={() => setIsCopyInfoOpen(wallet.id)}
                          onMouseLeave={() => setIsCopyInfoOpen(null)}
                          onClick={() => {
                            navigator.clipboard.writeText(wallet.walletId)
                          }}
                        ></img>
                      </div>
                    </div>
                    <div className="w-full max-w-[30%] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                      {wallet.name}
                    </div>
                    <div className="w-full max-w-[15%] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                      {wallet.balance} TCycles
                    </div>
                    <div className="w-full max-w-[15%] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                      {formatDate(wallet.createdAt)}
                    </div>
                    <div className="ml-auto w-full max-w-[5%]">
                      {' '}
                      {isFundInfoOpen === wallet.id && (
                        <div className="absolute flex w-fit -translate-x-[50%]   -translate-y-[100%]   items-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                          Fund wallet
                        </div>
                      )}
                      {isUserAdmin && (
                        <img
                          ref={editRef}
                          alt="ethereum avatar"
                          src="/images/workspace/money.svg"
                          className="w-[14px] cursor-pointer 2xl:w-[24px]"
                          onMouseEnter={() => setIsFundInfoOpen(wallet.id)}
                          onMouseLeave={() => setIsFundInfoOpen(null)}
                          onClick={(event) => {
                            event.stopPropagation()
                            setIsFundWalletOpen(wallet.id)
                          }}
                        ></img>
                      )}
                    </div>
                    <div className="ml-auto w-full max-w-[5%]">
                      {' '}
                      {isEditInfoOpen === wallet.id && (
                        <div className="absolute flex w-fit -translate-x-[50%]   -translate-y-[100%]   items-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                          Edit wallet
                        </div>
                      )}
                      {isUserAdmin && (
                        <img
                          ref={editRef}
                          alt="ethereum avatar"
                          src="/images/chat/pencil.svg"
                          className="w-[15px] cursor-pointer 2xl:w-[25px]"
                          onMouseEnter={() => setIsEditInfoOpen(wallet.id)}
                          onMouseLeave={() => setIsEditInfoOpen(null)}
                          onClick={(event) => {
                            event.stopPropagation()
                            setIsEditWalletOpen(wallet.id)
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
      {isEditWalletOpen && (
        <EditICPWalletModal
          isOpen={isEditWalletOpen}
          onClose={() => {
            setIsEditWalletOpen(false)
          }}
          onUpdateM={() => {
            onUpdate()
            setIsEditWalletOpen(false)
          }}
          wallet={wallets.find((app) => app.id === isEditWalletOpen)}
        />
      )}
      {isFundWalletOpen && (
        <FundICPWalletModal
          isOpen={isFundWalletOpen}
          onClose={() => {
            setIsFundWalletOpen(false)
          }}
          onUpdateM={() => {
            onUpdate()
            setIsFundWalletOpen(false)
          }}
          wallet={wallets.find((app) => app.id === isFundWalletOpen)}
        />
      )}
      {isDeployNewCanisterWalletOpen && (
        <NewICPWalletModal
          isOpen={isDeployNewCanisterWalletOpen}
          onUpdateM={() => {
            setIsDeployNewCanisterWalletOpen(false)
            onUpdate()
          }}
          onClose={() => {
            setIsDeployNewCanisterWalletOpen(false)
          }}
          blockchainWalletId={blockchainWalletId}
          blockchainWallet={blockchainWallet}
        />
      )}
    </div>
  )
}

export default ICPWalletsRender
