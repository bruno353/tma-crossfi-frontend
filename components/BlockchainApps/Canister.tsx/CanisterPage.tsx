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
import { BlockchainAppProps, ICPCanisterProps } from '@/types/blockchain-app'
import { AccountContext } from '@/contexts/AccountContext'
import { getBlockchainApp, getCanister } from '@/utils/api-blockchain'
import EditAppModal from '../Modals/EditAppModal'
import SubNavBar from '@/components/Modals/SubNavBar'
import { optionsNetwork } from '../Modals/NewAppModal'
import HistoryRender from './HistoryRender'
import EditCanisterModal from '../Modals/EditCanisterModal'
import CanistersUIRender from './CanisterUIRender'
import {
  CANISTER_HELLO_WORLD,
  CANISTER_VECTOR_DATABASE,
} from '@/types/canister-template'

const CanisterPage = ({ appId, canisterId, workspaceId }) => {
  const [isCreatingNewApp, setIsCreatingNewApp] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [navBarSelected, setNavBarSelected] = useState('Interact')
  const [canister, setCanister] = useState<ICPCanisterProps>()
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)

  const { workspace, user } = useContext(AccountContext)

  const pathname = usePathname()
  const { push } = useRouter()

  const canisterToTypeTemplate = {
    HELLO_WORLD: CANISTER_HELLO_WORLD,
    VECTOR_DATABASE: CANISTER_VECTOR_DATABASE,
  }

  function pushBack() {
    const lastIndex = pathname.lastIndexOf('/')
    const final = pathname.substring(0, lastIndex)
    push(final)
  }

  async function getData() {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    const data = {
      id: canisterId,
    }

    try {
      const res = await getCanister(data, userSessionToken)
      if (!res) {
        pushBack()
        return
      }
      setCanister(res)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [canisterId])

  if (isLoading) {
    return (
      <div className="container grid w-full gap-y-[30px] pt-36 text-[16px] md:pb-20 lg:pb-28 lg:pt-[180px]">
        <div className="h-20 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
        <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
      </div>
    )
  }

  return (
    <>
      <section className="relative z-10 max-h-[calc(100vh-8rem)] overflow-hidden pb-16 pt-36 text-[16px] md:pb-20 lg:pb-28 lg:pt-[90px]">
        <div className="container relative text-[#fff]">
          <div
            onClick={() => {
              const basePath = pathname.split('/')[1]
              console.log('the bash pathhhh ' + basePath)
              const newPath = `/${basePath}/${workspaceId}/blockchain-apps/${appId}` // Constrói o novo caminho
              push(newPath)
            }}
            className="absolute left-4 flex -translate-y-[180%] cursor-pointer gap-x-[5px]"
          >
            <img
              alt="ethereum avatar"
              src="/images/blockchain/arrow-left.svg"
              className="w-[12px]"
            ></img>
            <div className="text-[14px] text-[#c5c4c4] hover:text-[#b8b8b8]">
              App {canister?.blockchainApp.name}
            </div>
          </div>
          <div className="flex items-center justify-between gap-x-[20px]">
            <div className="flex gap-x-[20px]">
              {/* <img
                src={
                  optionsNetwork.find((op) => {
                    return op.value === blockchainApp?.network
                  })?.imageSrc
                }
                alt="image"
                className={`${
                  optionsNetwork.find((op) => {
                    return op.value === blockchainApp?.network
                  })?.imageStyle
                } !w-[35px] flex-shrink-0`}
              /> */}
              <div className="mt-auto text-[24px] font-medium">
                {canister?.name}
              </div>
            </div>
            {workspace?.isUserAdmin && (
              <div
                onClick={() => {
                  setIsEditOpen(true)
                }}
                className="cursor-pointer rounded-[5px]  bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]"
              >
                Edit canister
              </div>
            )}
          </div>
          <div className="mt-[10px] flex items-center gap-x-[30px] text-[15px]">
            <div className="">{canister?.canisterId}</div>
            <div>Balance: {canister?.balance} TCycles</div>
          </div>
          <div className="mt-[35px]">
            <SubNavBar
              onChange={(value) => {
                setNavBarSelected(value)
              }}
              selected={navBarSelected}
              itensList={['Interact', 'History']}
            />
            <div className="mt-[40px]">
              {navBarSelected === 'Interact' && (
                <div className="overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
                  {/* <CanistersRender
                    canisters={blockchainApp?.ICPCanister}
                    isUserAdmin={workspace?.isUserAdmin}
                    onUpdate={getData}
                    app={blockchainApp}
                  /> */}
                  <CanistersUIRender
                    canister={canister}
                    canisterTemplate={
                      canisterToTypeTemplate[canister?.typeTemplate]
                    }
                    isUserAdmin={workspace?.isUserAdmin}
                    onUpdate={getData}
                  />
                </div>
              )}
              {navBarSelected === 'History' && (
                <div className="overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
                  <HistoryRender canister={canister} />
                </div>
              )}
            </div>
          </div>
          <div className="mt-[50px] grid w-full grid-cols-3 gap-x-[30px] gap-y-[30px]"></div>
        </div>
        {isEditOpen && (
          <EditCanisterModal
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false)
            }}
            onUpdateM={() => {
              getData()
              setIsEditOpen(false)
            }}
            canister={canister}
          />
        )}
      </section>
    </>
  )
}

export default CanisterPage
