/* eslint-disable @next/next/no-img-element */
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
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { parseCookies } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
// import NewWorkspaceModal from './NewWorkspace'
import { getBlockchainApps, getUserWorkspace, getWorkspace } from '@/utils/api'
import { WorkspaceProps } from '@/types/workspace'
import SubNavBar from '../Modals/SubNavBar'
import { Logo } from '../Sidebar/Logo'
import { BlockchainWalletProps } from '@/types/blockchain-app'
import { callPostAPI, getBlockchainWallets } from '@/utils/api-blockchain'
// import NewAppModal from './Modals/NewAppModal'
import Editor, { useMonaco } from '@monaco-editor/react'
import { DePinProps } from '@/types/automation'
import DeploymentsRender from './DeploymentsRender'
import NewWorkflowModal from './Modals/NewWorkflowModal'

const MainPage = ({ id }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCompilation, setIsLoadingCompilation] = useState(false)
  const [isInfoBalanceOpen, setIsInfoBalanceOpen] = useState(false)
  const [value, setValue] = useState('// start your code here')
  const [languageSelectorOpen, setLanguageSelectorOpen] = useState(false)
  const [isCreatingNewApp, setIsCreatingNewApp] = useState(false)
  const monaco = useMonaco()
  const [dePins, setDePins] = useState<DePinProps[]>([])

  const [navBarSelected, setNavBarSelected] = useState('General')
  const [blockchainWallets, setBlockchainWallets] = useState<
    BlockchainWalletProps[]
  >([])

  const { workspace, user } = useContext(AccountContext)

  const { push } = useRouter()
  const pathname = usePathname()

  const editorRef = useRef()
  const [language, setLanguage] = useState('')

  const onMount = (editor) => {
    editorRef.current = editor
    editor.focus()
  }
  const menuRef = useRef(null)

  async function compileContract() {
    setIsLoadingCompilation(true)
    const { userSessionToken } = parseCookies()

    const data = {
      walletId: '123',
      code: value,
    }

    try {
      const res = await callPostAPI(
        '/blockchain/functions/compileSorobanContract',
        data,
        userSessionToken,
      )
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoadingCompilation(false)
  }

  async function getData() {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    try {
      const res = await getBlockchainWallets(data, userSessionToken)
      setBlockchainWallets(res)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setLanguageSelectorOpen(false)
      }
    }

    if (languageSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [languageSelectorOpen])

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [id])

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('vs-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1D2144',
          'editor.foreground': '#FFFFFF',
          'editor.lineHighlightBackground': '#dbdbdb1e',
          'editorLineNumber.foreground': '#858585',
          'editor.selectionBackground': '#0000FF20',
        },
      })
      setTimeout(() => {
        setLanguage('rust')
      }, 5000)
    }
  }, [monaco])

  if (isLoading) {
    return (
      <div className="container grid w-full gap-y-[30px]  text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="h-20 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
        <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
      </div>
    )
  }

  return (
    <>
      <section className="relative z-10 max-h-[calc(100vh-8rem)] overflow-hidden px-[20px] pb-16  text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="container text-[#fff]">
          <div className="flex items-center justify-between gap-x-[20px]">
            <div className="relative flex gap-x-[8px]">
              <div className="mt-auto text-[24px] font-medium">
                Depin Deployment
              </div>
              <img
                alt="ethereum avatar"
                src="/images/header/help.svg"
                className="w-[17px] cursor-pointer rounded-full"
                onMouseEnter={() => setIsInfoBalanceOpen(true)}
                onMouseLeave={() => setIsInfoBalanceOpen(false)}
              ></img>
              {isInfoBalanceOpen && (
                <div className="absolute right-0 flex w-fit -translate-y-[20%] translate-x-[105%] items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
                  Create descentralized infrastructure deployments by using the
                  Internet Computer Protocol {'<>'} Akash integration
                </div>
              )}
            </div>
            {workspace?.isUserAdmin && (
              <div
                onClick={() => {
                  setIsCreatingNewApp(true)
                }}
                className={`${
                  dePins.length === 0 && 'animate-bounce'
                } cursor-pointer rounded-[5px]  bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]`}
              >
                New Deployment
              </div>
            )}
          </div>
          <div className="mt-[45px]">
            <SubNavBar
              onChange={(value) => {
                setNavBarSelected(value)
              }}
              selected={navBarSelected}
              itensList={['General']}
            />
            <div className="mt-[50px]">
              {navBarSelected === 'General' && (
                <div className="overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
                  <DeploymentsRender
                    apps={dePins}
                    isUserAdmin={workspace?.isUserAdmin}
                    onUpdate={getData}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-[50px] grid w-full grid-cols-3 gap-x-[30px] gap-y-[30px]"></div>
        </div>
        <NewWorkflowModal
          isOpen={isCreatingNewApp}
          onClose={() => {
            setIsCreatingNewApp(false)
          }}
          onUpdateM={(data: any) => {
            setIsCreatingNewApp(false)
            const newDeployment = {
              id: '123',
              name: 'Websocket test',
              sdl: '---version: "2.0"services:  service-1:    image: ""    expose:      - port: 80        as: 80        to:          - global: trueprofiles:  compute:    service-1:      resources:        cpu:          units: 0.1        memory:          size: 512Mi        storage:          - size: 1Gi  placement:    dcloud:      pricing:        service-1:          denom: uakt          amount: 1000deployment:  service-1:    dcloud:      profile: service-1      count: 1',
              createdAt: String(new Date()),
              updatedAt: String(new Date()),
              activated: true,
            }
            setDePins([newDeployment])
          }}
          workspaceId={workspace?.id}
        />
      </section>
    </>
  )
}

export default MainPage
