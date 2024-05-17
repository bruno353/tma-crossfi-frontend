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
import {
  BlockchainContractProps,
  BlockchainWalletProps,
} from '@/types/blockchain-app'
// import NewAppModal from './Modals/NewAppModal'
import Editor, { useMonaco } from '@monaco-editor/react'
import SelectLanguageModal from './Modals/SelectLanguage'
import './EditorStyles.css'
import { callAxiosBackend } from '@/utils/general-api'
import Dropdown, { ValueObject } from '../Modals/Dropdown'
import { transformString } from '@/utils/functions'

export const optionsNetwork = [
  {
    name: 'Testnet',
    value: 'Testnet',
  },
  {
    name: 'Mainnet',
    value: 'Mainnet',
  },
]

const MainPage = ({ id }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingContracts, setIsLoadingContracts] = useState(true)
  const [isLoadingNewContract, setIsLoadingNewContract] = useState(false)
  const [isLoadingCompilation, setIsLoadingCompilation] = useState(false)
  const [value, setValue] = useState('// start your code here')
  const [languageSelectorOpen, setLanguageSelectorOpen] = useState(false)
  const monaco = useMonaco()
  const [selected, setSelected] = useState<ValueObject>(optionsNetwork[0])
  const [openCode, setOpenCode] = useState(true)
  const [openContracts, setOpenContracts] = useState(true)
  const [openConsole, setOpenConsole] = useState(true)
  const [isContractsListOpen, setIsContractsListOpen] = useState(true)

  const [navBarSelected, setNavBarSelected] = useState('General')

  const [isSavingContract, setIsSavingContract] = useState(false)
  const [blockchainContracts, setBlockchainContracts] = useState<
    BlockchainContractProps[]
  >([])
  const [blockchainContractSelected, setBlockchainContractSelected] =
    useState<BlockchainContractProps>()
  const [blockchainContractHovered, setBlockchainContractHovered] =
    useState<BlockchainContractProps | null>()
  const [contractRename, setContractRename] =
    useState<BlockchainContractProps | null>()
  const [contractName, setContractName] = useState<string>('')

  const [blockchainWallets, setBlockchainWallets] = useState<
    BlockchainWalletProps[]
  >([])
  const [blockchainWalletsDropdown, setBlockchainWalletsDropdown] =
    useState<ValueObject[]>()
  const [blockchainWalletsSelected, setBlockchainWalletsSelected] =
    useState<ValueObject>()

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
      const res = await callAxiosBackend(
        'post',
        '/blockchain/functions/compileSorobanContract',
        userSessionToken,
        data,
      )
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoadingCompilation(false)
  }

  async function saveContract(code: string) {
    setIsSavingContract(true)
    const { userSessionToken } = parseCookies()

    const data = {
      id: blockchainContractSelected?.id,
      code: value,
    }

    try {
      const res = await callAxiosBackend(
        'put',
        '/blockchain/functions/saveContractCode',
        userSessionToken,
        data,
      )
    } catch (err) {
      console.log(err)
      toast.error(`Error saving contract: ${err.response.data.message}`)
    }
    setIsLoadingCompilation(false)
  }

  async function getData() {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    try {
      const res = await callAxiosBackend(
        'get',
        `/blockchain/functions/getWorkspaceWallets?id=${id}&sorobanRPC=https://horizon-testnet.stellar.org&network=STELLAR`,
        userSessionToken,
      )
      const walletsToSet = []
      for (let i = 0; i < res.length; i++) {
        walletsToSet.push({
          name: transformString(res[i].stellarWalletPubK, 5),
          value: res[i].id,
        })
      }
      setBlockchainWalletsDropdown(walletsToSet)
      setBlockchainWallets(res)
      if (walletsToSet?.length > 0) {
        setBlockchainWalletsSelected(walletsToSet[0])
      }
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  async function getContracts() {
    setIsLoadingContracts(true)
    const { userSessionToken } = parseCookies()

    try {
      const res = await callAxiosBackend(
        'get',
        `/blockchain/functions/getContracts?id=${id}`,
        userSessionToken,
      )
      setBlockchainContracts(res)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoadingContracts(false)
  }

  async function createNewContract() {
    setIsLoadingNewContract(true)
    const { userSessionToken } = parseCookies()

    const data = {
      workspaceId: id,
      network: 'STELLAR',
      code: '// write your code here',
      name: 'untitled',
    }
    try {
      const res = await callAxiosBackend(
        'post',
        `/blockchain/functions/createContract`,
        userSessionToken,
        data,
      )
      setIsLoadingNewContract(false)
      return res
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoadingNewContract(false)
  }

  async function handleDeleteContract(cnt: BlockchainContractProps) {
    const { userSessionToken } = parseCookies()

    const data = {
      id: cnt.id,
    }

    const newCnts = blockchainContracts?.filter((item) => item.id !== cnt.id)
    setBlockchainContracts(newCnts)
    try {
      await callAxiosBackend(
        'delete',
        `/blockchain/functions/deleteContract`,
        userSessionToken,
        data,
      )
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
  }

  async function handleRenameContract() {
    const { userSessionToken } = parseCookies()

    if (contractNameRef?.current?.length === 0 || !contractNameRef.current) {
      return
    }

    const idToSet = contractRename.id

    const data = {
      id: idToSet,
      name: contractNameRef.current,
    }

    try {
      const newCnts = [...blockchainContracts]

      const cntIndex = blockchainContracts?.findIndex(
        (item) => item.id === idToSet,
      )
      newCnts[cntIndex].name = contractNameRef.current
      setBlockchainContracts(newCnts)

      await callAxiosBackend(
        'put',
        `/blockchain/functions/renameContract`,
        userSessionToken,
        data,
      )
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
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
    getContracts()
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

  const contractNameRef = useRef(contractName)
  const nameRef = useRef(null)

  useEffect(() => {
    contractNameRef.current = contractName
  }, [contractName])

  const handleKeyPress = (event) => {
    if (
      event.key === 'Enter' &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      handleRenameContract()
      setContractRename(null)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nameRef.current && !nameRef.current.contains(event.target)) {
        setContractRename(null)
      }
    }

    if (contractRename) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [contractRename])

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
        <div className="container flex gap-x-[10px] text-[#fff]">
          <div className="relative h-[76vh] max-h-[76vh] rounded-xl bg-[#1D2144] py-4 pl-4 pr-8 text-[13px] font-light">
            <div className="relative flex gap-x-[5px]">
              <img
                alt="ethereum avatar"
                src="/images/workspace/stellar-new.svg"
                className="w-[16px]"
              ></img>
              <div className="font-medium">Soroban</div>
            </div>
            <div className="mt-4 h-[1px] w-full bg-[#c5c4c41a]"></div>
            <div className="mt-5 w-fit">
              <div className="mb-2 flex gap-x-[5px]">
                <img
                  alt="ethereum avatar"
                  src="/images/depin/settings.svg"
                  className="w-[16px]"
                ></img>
                <div>Environment</div>
              </div>
              <Dropdown
                optionSelected={selected}
                options={optionsNetwork}
                onValueChange={(value) => {
                  setSelected(value)
                }}
                classNameForDropdown="!px-1 !pr-2 !py-1"
                classNameForPopUp="!px-1 !pr-2 !py-1"
              />
            </div>
            <div className="mt-4">
              <div className="mb-2 flex gap-x-[5px]">
                <img
                  alt="ethereum avatar"
                  src="/images/depin/card.svg"
                  className="w-[16px]"
                ></img>
                <div>Wallet</div>
              </div>
              <div className="flex items-center gap-x-1">
                {blockchainWallets?.length > 0 ? (
                  <Dropdown
                    optionSelected={blockchainWalletsSelected}
                    options={blockchainWalletsDropdown}
                    onValueChange={(value) => {
                      setBlockchainWalletsSelected(value)
                    }}
                    classNameForDropdown="!px-1 !pr-2 !py-1 !flex-grow !min-w-[130px]"
                    classNameForPopUp="!px-1 !pr-2 !py-1"
                  />
                ) : (
                  <div className="text-[#c5c4c4]">create a wallet </div>
                )}

                <a href={`/workspace/${id}/blockchain-wallets`}>
                  <div
                    title="Create wallet"
                    className="flex-grow-0 cursor-pointer text-[16px]"
                  >
                    +
                  </div>
                </a>
              </div>
              {blockchainWalletsSelected && (
                <div className="mt-2 text-[12px] text-[#c5c4c4]">
                  {' '}
                  Balance:{' '}
                  {
                    blockchainWallets.find(
                      (obj) => obj.id === blockchainWalletsSelected.value,
                    ).balance
                  }
                </div>
              )}
            </div>
            <div className="mt-4">
              <div
                onClick={() => {
                  console.log(value)
                  setIsContractsListOpen(!isContractsListOpen)
                }}
                className="mb-2 flex cursor-pointer items-center gap-x-[8px]"
              >
                <div className="flex gap-x-[5px]">
                  <img
                    alt="ethereum avatar"
                    src="/images/depin/documents.svg"
                    className="w-[14px]"
                  ></img>
                  <div className={`${isLoadingContracts && 'animate-pulse'}`}>
                    Contracts
                  </div>
                </div>
                <img
                  alt="ethereum avatar"
                  src="/images/header/arrow-gray.svg"
                  className={`w-[8px] rounded-full transition-transform duration-150 ${
                    !isContractsListOpen && 'rotate-180'
                  }`}
                ></img>
              </div>
              {isContractsListOpen && (
                <div>
                  <div className="grid gap-y-[2px] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md ">
                    {blockchainContracts?.map((cnt, index) => (
                      <div
                        onClick={() => {
                          setBlockchainContractSelected(cnt)
                        }}
                        onMouseEnter={() => setBlockchainContractHovered(cnt)}
                        onMouseLeave={() => setBlockchainContractHovered(null)}
                        className="relative cursor-pointer rounded-md border border-transparent bg-transparent px-2 text-[14px] hover:bg-[#dbdbdb1e]"
                        key={index}
                      >
                        {contractRename?.id === cnt?.id ? (
                          <input
                            value={contractName}
                            ref={nameRef}
                            className="w-[80%] max-w-[80%] overflow-hidden truncate text-ellipsis whitespace-nowrap border border-transparent bg-transparent outline-none focus:border-primary"
                            onChange={(e) => {
                              if (e.target.value.length < 50) {
                                setContractName(e.target.value)
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <div className="w-[80%] max-w-[80%] overflow-hidden truncate text-ellipsis whitespace-nowrap border border-transparent bg-transparent outline-none focus:border-primary">
                            {' '}
                            {cnt?.name}{' '}
                          </div>
                        )}

                        {blockchainContractHovered?.id === cnt.id && (
                          <div className="absolute right-0 top-0 flex h-full px-[10px] text-[10px] backdrop-blur-sm">
                            <div className="flex items-center gap-x-2">
                              <img
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setContractRename(cnt)
                                  setContractName(cnt.name)
                                }}
                                src={`/images/depin/pencil.svg`}
                                alt="image"
                                className="my-auto w-[18px] cursor-pointer"
                              />
                              <img
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteContract(cnt)
                                }}
                                src={`/images/depin/garbage.svg`}
                                alt="image"
                                className="my-auto w-[11px] cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div
                    onClick={async () => {
                      if (!isLoadingNewContract) {
                        const newContract: BlockchainContractProps =
                          await createNewContract()
                        const newCnts = [...blockchainContracts, newContract]
                        setBlockchainContracts(newCnts)
                      }
                    }}
                    className={`mt-1 w-fit cursor-pointer rounded-[7px] px-[6px] py-[2px] text-[12px] text-[#c5c4c4] hover:bg-[#dbdbdb1e] ${
                      isLoadingNewContract && 'animate-pulse'
                    }`}
                  >
                    + New contract
                  </div>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 flex gap-x-3">
              <img
                onClick={() => setOpenCode(!openCode)}
                src={
                  openCode
                    ? '/images/depin/write.svg'
                    : '/images/depin/write-grey.svg'
                }
                alt="ethereum avatar"
                className="w-[17px] cursor-pointer"
              ></img>
              <img
                onClick={() => setOpenContracts(!openContracts)}
                alt="ethereum avatar"
                src={
                  openContracts
                    ? '/images/depin/document.svg'
                    : '/images/depin/document-grey.svg'
                }
                className="w-[16px] cursor-pointer"
              ></img>
              <img
                onClick={() => setOpenConsole(!openConsole)}
                alt="ethereum avatar"
                src={
                  openConsole
                    ? '/images/depin/terminal.svg'
                    : '/images/depin/terminal-grey.svg'
                }
                className="w-[18px] cursor-pointer"
              ></img>
            </div>
          </div>
          {openCode && (
            <div className="w-full min-w-[60%] max-w-[80%]">
              <div className="flex w-full justify-between">
                <div className="flex gap-x-4 text-[14px]">
                  <div>{blockchainContractSelected?.name}</div>
                  <div
                    onClick={() => setLanguageSelectorOpen(true)}
                    className="mb-2 flex w-fit cursor-pointer items-center gap-x-[7px] rounded-md pl-2 pr-3 text-[14px] font-normal text-[#c5c4c4] hover:bg-[#c5c5c510]"
                  >
                    <div>{language?.length > 0 ? language : 'Loading'}</div>
                    <img
                      alt="ethereum avatar"
                      src="/images/header/arrow.svg"
                      className="w-[7px]"
                    ></img>
                  </div>
                </div>

                <div
                  onClick={() => {
                    compileContract()
                  }}
                  className="cursor-pointer text-[14px]"
                >
                  Deploy
                </div>
              </div>
              <div
                className={`editor-container relative w-full ${
                  isLoadingCompilation && 'animate-pulse'
                }`}
              >
                <Editor
                  height="72vh"
                  theme="vs-dark"
                  defaultLanguage="javascript"
                  value={value}
                  language={language}
                  onMount={onMount}
                  onChange={(value) => {
                    if (!isLoadingCompilation) {
                      setValue(value)
                      saveContract(value)
                    }
                  }}
                  options={{
                    minimap: {
                      enabled: false,
                    },
                  }}
                />
                {isSavingContract ? (
                  <img
                    alt="ethereum avatar"
                    src="/images/depin/spin.svg"
                    className="absolute bottom-2 left-4 w-[16px] animate-spin"
                  ></img>
                ) : (
                  <div className="absolute bottom-2 left-4 text-[12px] text-[#c5c4c4]">
                    Last updated: {blockchainContractSelected?.updatedAt}
                  </div>
                )}
              </div>
            </div>
          )}

          {(openContracts || openConsole) && (
            <div className="grid h-[76vh] w-full gap-y-[1vh] text-[13px]">
              {openContracts && (
                <div className="h-full w-full  rounded-xl bg-[#1D2144] px-4 py-4">
                  <div className="flex gap-x-[5px]">
                    <img
                      alt="ethereum avatar"
                      src="/images/depin/document.svg"
                      className="w-[16px]"
                    ></img>
                    <div className="font-medium">Contract</div>
                  </div>
                </div>
              )}
              {openConsole && (
                <div className="h-full w-full rounded-xl bg-[#1D2144] px-4 py-4">
                  <div className="flex gap-x-[5px]">
                    <img
                      alt="ethereum avatar"
                      src="/images/depin/terminal.svg"
                      className="w-[16px]"
                    ></img>
                    <div className="font-medium">Console</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {languageSelectorOpen && (
          <div
            className="absolute top-[35px] !z-[999999] translate-x-[30px] translate-y-[40px] 2xl:translate-x-[80px]"
            ref={menuRef}
          >
            <SelectLanguageModal
              onUpdateM={(value) => {
                setLanguage(value)
                setLanguageSelectorOpen(false)
              }}
            />{' '}
          </div>
        )}
      </section>
    </>
  )
}

export default MainPage
