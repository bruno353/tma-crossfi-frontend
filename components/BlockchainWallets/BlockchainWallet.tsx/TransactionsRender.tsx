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
import { BlockchainWalletProps, ICPWalletsProps } from '@/types/blockchain-app'
// import { optionsNetwork } from './Modals/NewAppModal'
// import EditAppModal from './Modals/EditAppModal'
import { formatDate, transformString } from '@/utils/functions'
import NewICPWalletModal from '../Modals/NewICPWalletModal'
import EditICPWalletModal from '../Modals/EditICPWalletModal'
import FundICPWalletModal from '../Modals/FundICPWalletModal'
import TransferICPModal from '../Modals/TransferICPModal'
import { crossfiNetworkEVMToRpc } from '@/components/IDE/MainPage'
import TransferEVMModal from '../Modals/TransferEVMModal'
import OnRampModal from '../Modals/OnRamp'

export interface ModalI {
  wallets: ICPWalletsProps[]
  blockchainWallet: BlockchainWalletProps
  blockchainWalletId: string
  isUserAdmin: boolean
  onUpdate(): void
  netEnvironment?: string
}

const TransactionsRender = ({
  wallets,
  onUpdate,
  isUserAdmin,
  blockchainWalletId,
  blockchainWallet,
  netEnvironment,
}: ModalI) => {
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState<any>()
  const [isUserModalOpen, setIsUserModalOpen] = useState<any>()
  const [isEditInfoOpen, setIsEditInfoOpen] = useState<any>()
  const [isCopyInfoOpen, setIsCopyInfoOpen] = useState<any>()
  const [isEditWalletOpen, setIsEditWalletOpen] = useState<any>()
  const [isTransferOpen, setIsTransferOpen] = useState<any>()
  const [isOnRampOpen, setIsOnRampOpen] = useState<any>()
  const [isTransferEVMOpen, setIsTransferEVMOpen] = useState<any>()

  const onRampChains = ['FRAXTAL', 'DCHAIN', 'EDUCHAIN']
  const evmChainsTransfer = ['CROSSFI', 'DCHAIN', 'FRAXTAL', 'EDUCHAIN']

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
        <div className="mb-[40px] flex gap-x-[30px]">
          {onRampChains.includes(blockchainWallet?.network) && (
            <div
              onClick={() => {
                setIsOnRampOpen(true)
              }}
              className="w-[120px] cursor-pointer whitespace-nowrap rounded-[5px] bg-[#273687]  p-[4px] px-[15px] text-center text-[14px] text-[#fff] hover:bg-[#35428a]"
            >
              On-ramp
            </div>
          )}
          <div
            onClick={() => {
              if (blockchainWallet?.network === 'ICP') {
                setIsTransferOpen(true)
              } else if (
                evmChainsTransfer.includes(blockchainWallet?.network)
              ) {
                setIsTransferEVMOpen(true)
              }
            }}
            className="w-[130px] cursor-pointer whitespace-nowrap  rounded-[5px] bg-[#273687]  p-[4px] px-[15px] text-center text-[14px] text-[#fff] hover:bg-[#35428a]"
          >
            Transfer tokens
          </div>
        </div>
        <div className="mx-auto flex w-full">
          <a
            href={`${
              blockchainWallet?.network === 'ICP'
                ? `https://dashboard.internetcomputer.org/account/${blockchainWallet.icpWalletPubKId}`
                : netEnvironment === 'Mainnet'
                ? `https://stellarchain.io/accounts/${blockchainWallet?.stellarWalletPubK}`
                : `https://testnet.stellarchain.io/accounts/${blockchainWallet?.stellarWalletPubK}`
            } `}
            target="_blank"
            rel="noreferrer"
            className="mx-auto"
          >
            <div className="cursor-pointer text-[16px] hover:text-[#0354EC]">
              View transactions history
            </div>
          </a>
        </div>
      </div>
      {isTransferOpen && (
        <TransferICPModal
          isOpen={isTransferOpen}
          onClose={() => {
            setIsTransferOpen(false)
          }}
          onUpdateM={() => {
            onUpdate()
            setIsTransferOpen(false)
          }}
          blockchainWallet={blockchainWallet}
        />
      )}
      {isTransferEVMOpen && (
        <TransferEVMModal
          isOpen={isTransferEVMOpen}
          netEnvironment={netEnvironment}
          onClose={() => {
            setIsTransferEVMOpen(false)
          }}
          onUpdateM={() => {
            onUpdate()
            setIsTransferEVMOpen(false)
          }}
          blockchainWallet={blockchainWallet}
        />
      )}
      <OnRampModal
        isOpen={isOnRampOpen}
        netEnvironment={netEnvironment}
        onClose={() => {
          setIsOnRampOpen(false)
        }}
        onUpdateM={() => {
          onUpdate()
          setIsOnRampOpen(false)
        }}
        blockchainWallet={blockchainWallet}
      />
    </div>
  )
}

export default TransactionsRender
