/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Eye, EyeSlash, SmileySad } from 'phosphor-react'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { parseCookies } from 'nookies'
// import NewWorkspaceModal from './NewWorkspace'
import { getBlockchainApps, getUserWorkspace, getWorkspace } from '@/utils/api'
import { WorkspaceProps } from '@/types/workspace'
import { BlockchainWalletProps } from '@/types/blockchain-app'
import { AccountContext } from '@/contexts/AccountContext'
import { getBlockchainWallet } from '@/utils/api-blockchain'
import SubNavBar from '@/components/Modals/SubNavBar'
import ICPWalletsRender from './ICPWalletsRender'
import EditWalletModal from '../Modals/EditWalletModal'
import TransactionsRender from './TransactionsRender'
import Dropdown, { ValueObject } from '@/components/Modals/Dropdown'
import {
  sorobanNetworkToRpc,
  optionsNetwork as sorobanOption,
} from '@/components/IDE/MainPage'
import { optionsNetwork } from '@/components/BlockchainApps/Modals/NewAppModal'
import { callAxiosBackend } from '@/utils/general-api'

const BlockchainWalletPage = ({ id, workspaceId }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isInfoBalanceOpen, setIsInfoBalanceOpen] = useState(false)

  const [navBarSelected, setNavBarSelected] = useState('Transactions')
  const [blockchainWallet, setBlockchainWallet] =
    useState<BlockchainWalletProps>()
  const [isEditWalletOpen, setIsEditWalletOpen] = useState<boolean>(false)

  const [sorobanEnvironment, setSorobanEnvironment] = useState<ValueObject>(
    sorobanOption[1],
  )

  const { workspace, user } = useContext(AccountContext)

  const pathname = usePathname()
  const { push } = useRouter()

  async function getData(sorobanRpc?: string) {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    if (sorobanRpc) {
      data['sorobanRPC'] = sorobanRpc
    }

    try {
      const res = await callAxiosBackend(
        'post',
        '/blockchain/functions/getWallet',
        userSessionToken,
        data,
      )
      setBlockchainWallet(res)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [id])

  if (isLoading) {
    return (
      <div className="container grid w-full gap-y-[30px] text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="h-20 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
        <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
      </div>
    )
  }

  return (
    <>
      <section className="relative z-10 max-h-[calc(100vh-8rem)] overflow-hidden px-[20px] pb-16  text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="container relative text-[#fff]">
          <div
            onClick={() => {
              const basePath = pathname.split('/')[1]
              console.log('the bash pathhhh ' + basePath)
              const newPath = `/${basePath}/${workspaceId}/blockchain-wallets` // Constrói o novo caminho
              push(newPath)
            }}
            className="absolute left-0 flex -translate-y-[180%] cursor-pointer gap-x-[5px]"
          >
            <img
              alt="ethereum avatar"
              src="/images/blockchain/arrow-left.svg"
              className="w-[12px]"
            ></img>
            <div className="text-[14px] text-[#c5c4c4] hover:text-[#b8b8b8]">
              Wallets
            </div>
          </div>
          <div className="flex items-center justify-between gap-x-[20px]">
            <div className="">
              <div className="flex gap-x-[20px]">
                <img
                  src={
                    optionsNetwork.find((op) => {
                      return op.value === blockchainWallet?.network
                    })?.imageSrc
                  }
                  alt="image"
                  className={`${
                    optionsNetwork.find((op) => {
                      return op.value === blockchainWallet?.network
                    })?.imageStyle
                  } !w-[35px] flex-shrink-0`}
                />
                <div className="mt-auto text-[24px] font-medium">
                  {blockchainWallet?.name}
                </div>
              </div>
              {blockchainWallet?.network === 'ICP' ? (
                <a
                  href={`https://dashboard.internetcomputer.org/account/${blockchainWallet?.icpWalletPubKId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="mt-2 text-[14px] ">
                    Identity public Id:{' '}
                    <span className="hover:text-[#0354EC]">
                      {blockchainWallet?.icpWalletPubKId}
                    </span>
                  </div>
                </a>
              ) : (
                <a
                  href={`https://stellarchain.io/accounts/${blockchainWallet?.stellarWalletPubK}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="mt-2 text-[14px] ">
                    Public Key:{' '}
                    <span className="hover:text-[#0354EC]">
                      {blockchainWallet?.stellarWalletPubK}
                    </span>
                  </div>
                </a>
              )}
              {blockchainWallet?.network === 'ICP' ? (
                <div className="relative flex w-fit gap-x-[5px]">
                  <div className="mt-2 text-[14px] ">
                    Identity balance:{' '}
                    <span>{blockchainWallet?.balance} ICP</span>
                  </div>
                  <img
                    alt="ethereum avatar"
                    src="/images/header/help.svg"
                    className="w-[17px] cursor-pointer rounded-full"
                    onMouseEnter={() => setIsInfoBalanceOpen(true)}
                    onMouseLeave={() => setIsInfoBalanceOpen(false)}
                  ></img>
                  {isInfoBalanceOpen && (
                    <div className="absolute right-0 flex w-fit -translate-y-[80%] translate-x-[105%] items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
                      To fund your Identity, its necessary to transfer ICP
                      tokens to your Identity public Id. You can buy ICP tokens
                      in exchanges as Binance
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="relative flex w-fit gap-x-[5px]">
                    <div className="mt-3 text-[14px] ">
                      Wallet balance:{' '}
                      <span>{blockchainWallet?.balance} XLM</span>
                    </div>
                    <img
                      alt="ethereum avatar"
                      src="/images/header/help.svg"
                      className="w-[17px] cursor-pointer rounded-full"
                      onMouseEnter={() => setIsInfoBalanceOpen(true)}
                      onMouseLeave={() => setIsInfoBalanceOpen(false)}
                    ></img>
                    {isInfoBalanceOpen && (
                      <div className="absolute right-0 flex w-fit -translate-y-[80%] translate-x-[105%] items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
                        To fund your wallet, its necessary to transfer XLM
                        tokens to your address. You can buy XLM tokens in
                        exchanges as Binance
                      </div>
                    )}
                  </div>
                  {Number(blockchainWallet?.balance) === 0 && (
                    <div className="mt-3 w-fit rounded-md border-[1px] border-[#a53333] bg-[#e7c567ac] px-[10px] text-[14px] text-[#fff]">
                      Make sure to fund the wallet with at least 1 XLM to
                      activate it!
                    </div>
                  )}
                </div>
              )}
            </div>
            {workspace?.isUserAdmin && (
              <div className="grid gap-y-6">
                <div
                  onClick={() => {
                    setIsEditWalletOpen(true)
                  }}
                  className="cursor-pointer rounded-[5px]  bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]"
                >
                  Edit identity
                </div>
                {blockchainWallet?.network === 'STELLAR' && (
                  <div>
                    <Dropdown
                      optionSelected={sorobanEnvironment}
                      options={sorobanOption}
                      onValueChange={(value) => {
                        getData(sorobanNetworkToRpc[value.value])
                        setSorobanEnvironment(value)
                      }}
                      classNameForDropdown="!px-4 !pr-2 !py-1 !text-[#fff] !text-[14px]"
                      classNameForPopUp="!px-1 !pr-2 !py-1"
                      classNameForPopUpBox="!translate-y-[35px]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-[45px]">
            <SubNavBar
              onChange={(value) => {
                setNavBarSelected(value)
              }}
              selected={navBarSelected}
              itensList={
                blockchainWallet?.network === 'ICP'
                  ? ['Canister-wallets', 'Transactions']
                  : ['Transactions']
              }
            />
            <div className="mt-[20px] 2xl:mt-[40px]">
              {navBarSelected === 'Canister-wallets' && (
                <div className="overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
                  <ICPWalletsRender
                    wallets={blockchainWallet?.ICPWallets}
                    isUserAdmin={workspace?.isUserAdmin}
                    onUpdate={getData}
                    blockchainWalletId={blockchainWallet?.id}
                    blockchainWallet={blockchainWallet}
                  />
                </div>
              )}
              {navBarSelected === 'Transactions' && (
                <div className="overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
                  <TransactionsRender
                    wallets={blockchainWallet?.ICPWallets}
                    isUserAdmin={workspace?.isUserAdmin}
                    onUpdate={getData}
                    blockchainWalletId={blockchainWallet?.id}
                    blockchainWallet={blockchainWallet}
                    sorobanEnvironment={sorobanEnvironment.value}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-[50px] grid w-full grid-cols-3 gap-x-[30px] gap-y-[30px]"></div>
        </div>
        {isEditWalletOpen && (
          <EditWalletModal
            isOpen={isEditWalletOpen}
            onClose={() => {
              setIsEditWalletOpen(false)
            }}
            onUpdateM={() => {
              getData()
              setIsEditWalletOpen(false)
            }}
            wallet={blockchainWallet}
          />
        )}
      </section>
    </>
  )
}

export default BlockchainWalletPage
