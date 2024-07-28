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
import { getBlockchainWallets } from '@/utils/api-blockchain'
// import NewAppModal from './Modals/NewAppModal'
import Editor, { useMonaco } from '@monaco-editor/react'
import DeploymentsRender from './DeploymentsRender'
import NewWorkflowModal from './Modals/NewWorkflowModal'
import Dropdown, { ValueObject } from '../Modals/Dropdown'
import { depinOptionsFeatures, depinOptionsNetwork } from '@/types/consts/depin'
import NewDeployment from './Components/NewDeployment'
import { callAxiosBackend } from '@/utils/general-api'
import { DepinDeploymentProps } from '@/types/depin'

const MainPage = ({ id }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCompilation, setIsLoadingCompilation] = useState(false)
  const [isInfoBalanceOpen, setIsInfoBalanceOpen] = useState(false)
  const [value, setValue] = useState('// start your code here')
  const [languageSelectorOpen, setLanguageSelectorOpen] = useState(false)
  const monaco = useMonaco()
  const [depins, setDepins] = useState<DepinDeploymentProps[]>([])
  const [selected, setSelected] = useState<ValueObject>(depinOptionsFeatures[0])
  const [selectedNetwork, setSelectedNetwork] = useState<ValueObject>(
    depinOptionsNetwork[0],
  )

  const [navBarSelected, setNavBarSelected] = useState('Deployments')
  const [blockchainWallets, setBlockchainWallets] = useState<
    BlockchainWalletProps[]
  >([])

  const {
    workspace,
    user,
    isDeployingNewDepinFeature,
    setIsDeployingNewDepingFeature,
  } = useContext(AccountContext)

  const { push } = useRouter()
  const pathname = usePathname()

  const editorRef = useRef()
  const [language, setLanguage] = useState('')

  const onMount = (editor) => {
    editorRef.current = editor
    editor.focus()
  }
  const menuRef = useRef(null)

  async function getData() {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    try {
      const res = await callAxiosBackend(
        'get',
        `/blockchain/depin/functions/getWorkspaceDeployments?id=${id}&network=${selectedNetwork?.value}`,
        userSessionToken,
      )
      setDepins(res)
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
      <section className="relative z-10 max-h-[calc(100vh-4rem)] overflow-hidden px-[20px] pb-16 text-[16px]  md:pb-20 lg:pb-28 lg:pt-[40px] 2xl:max-h-[calc(100vh-8rem)]">
        <div className="container text-[#fff]">
          <div className="flex items-center justify-between gap-x-[20px]">
            <div className="relative flex gap-x-[8px]">
              <div className="mt-auto flex gap-x-[15px] text-[24px] font-medium">
                {/* <img
                  alt="ethereum avatar"
                  src="/images/depin/akash.svg"
                  className="w-[25px] 2xl:w-[25px]"
                ></img> */}
                <img
                  alt="frax"
                  src={selectedNetwork.imageSrc2}
                  className={selectedNetwork.imageStyle2}
                ></img>
                <div>Accelar Depin</div>
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
                  Frax
                  {'<>'} Internet Computer Protocol {'<>'} Akash integration
                </div>
              )}
            </div>
            <div className="flex gap-x-10">
              <Dropdown
                optionSelected={selectedNetwork}
                options={depinOptionsNetwork}
                onValueChange={(value) => {
                  setSelectedNetwork(value)
                }}
                classNameForDropdown="!min-w-[150px] !px-3 !py-1"
                classNameForPopUp="!px-3"
              />
              <Dropdown
                optionSelected={selected}
                options={depinOptionsFeatures}
                onValueChange={(value) => {
                  setSelected(value)
                }}
                classNameForDropdown="!min-w-[150px] !px-3 !py-1"
                classNameForPopUp="!px-3"
              />
              {workspace?.isUserAdmin && (
                <div
                  onClick={() => {
                    setIsDeployingNewDepingFeature(true)
                  }}
                  className={`${
                    depins.length === 0 && 'hidden'
                  } flex cursor-pointer items-center whitespace-nowrap rounded-[5px]  bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]`}
                >
                  New Deployment
                </div>
              )}
            </div>
          </div>
          <div className="mt-[25px] 2xl:mt-[45px]">
            <SubNavBar
              onChange={(value) => {
                setNavBarSelected(value)
              }}
              selected={navBarSelected}
              itensList={['Deployments']}
            />
            <div className="mt-[20px]">
              {navBarSelected === 'Deployments' && (
                <div>
                  {isDeployingNewDepinFeature ? (
                    <div className="overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
                      <NewDeployment
                        onUpdate={() => {
                          setIsDeployingNewDepingFeature(false)
                          getData()
                        }}
                        setIsCreatingNewApp={() => {
                          setIsDeployingNewDepingFeature(false)
                        }}
                        selectedNetwork={selectedNetwork}
                      />
                    </div>
                  ) : (
                    <div className="overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
                      <DeploymentsRender
                        apps={depins}
                        isUserAdmin={workspace?.isUserAdmin}
                        onUpdate={getData}
                        setIsCreatingNewApp={() => {
                          setIsDeployingNewDepingFeature(true)
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mt-[50px] grid w-full grid-cols-3 gap-x-[30px] gap-y-[30px]"></div>
        </div>
        {/* <NewWorkflowModal
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
            setDepins([newDeployment])
          }}
          workspaceId={workspace?.id}
        /> */}
      </section>
    </>
  )
}

export default MainPage
