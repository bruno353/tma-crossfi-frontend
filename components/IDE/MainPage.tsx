/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import {
  useEffect,
  useState,
  useReducer,
  ChangeEvent,
  FC,
  useContext,
  useRef,
} from 'react'

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
import {
  convertAnsiToHtml,
  extractAllErrorMessages,
  extractTextMessage,
  extractTextMessageAndRemoveItems,
  extractTextMessageSecondOcorrency,
  getValueBetweenStrings,
  transformString,
} from '@/utils/functions'
import Sidebar from './Modals/Sidebar'
import * as StellarSdk from '@stellar/stellar-sdk'
import NewCallFunctionModal from './Modals/CallFunctionModal'
import DeployContractModal from './Modals/DeployContractModal'
import ImportContractModal from './Modals/ImportContractModal'

export interface ConsoleError {
  type: 'error'
  errorDescription: string
  errorMessage: string
  string: string
  lineError: number
  isOpen?: boolean
}

export interface ConsoleCompile {
  type: 'compile'
  contractName: string
  wasm: string
  createdAt: string
  desc?: string
  isOpen?: boolean
}

export interface ConsoleContractCall {
  type: 'contractCall'
  contractAddress: string
  title: string
  createdAt: string
  desc?: string
  isOpen?: boolean
}

export interface ConsoleDeploy {
  type: 'deploy'
  contractName: string
  createdAt: string
  desc?: string
  isOpen?: boolean
}

export interface ConsoleDeployError {
  type: 'deployError'
  contractName: string
  createdAt: string
  desc?: string
  isOpen?: boolean
}

export type ConsoleLog =
  | ConsoleError
  | ConsoleCompile
  | ConsoleDeploy
  | ConsoleDeployError
  | ConsoleContractCall

export interface ContractInspectionInputsI {
  name: string
  type: string
  value?: any
}

export interface ContractInspectionI {
  functionName: string
  inputs: ContractInspectionInputsI[]
  outputsArray: string[]
  transactError?: boolean
  isOpen?: boolean
  docs?: string
}

export const cleanDocs = (docs) => {
  return docs?.replace(/(\r\n\s+|\n\s+)/g, '\n').trim()
}

export const sorobanNetworkToRpc = {
  Testnet: 'https://horizon-testnet.stellar.org',
  Mainnet: 'https://horizon.stellar.org',
}

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

const contractReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_CONTRACT':
      if (state.includes(action.payload)) {
        return state
      }
      return [...state, action.payload]
    case 'REMOVE_CONTRACT':
      return state.filter((contract) => contract !== action.payload)
    default:
      return state
  }
}

const MainPage = ({ id }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isCallingFunctionModal, setIsCallingFunctionModal] =
    useState<number>(-1)
  const [isLoadingContracts, setIsLoadingContracts] = useState(true)
  const [isLoadingNewContract, setIsLoadingNewContract] = useState(false)
  const [isLoadingCompilation, setIsLoadingCompilation] = useState(false)
  const [value, setValue] = useState('// start your code here')
  const [languageSelectorOpen, setLanguageSelectorOpen] = useState(false)
  const monaco = useMonaco()
  const [selected, setSelected] = useState<ValueObject>(optionsNetwork[0])
  const [openModalDeploy, setOpenModalDeploy] = useState(false)
  const [openModalImport, setOpenModalImport] = useState(false)

  const [openCode, setOpenCode] = useState(true)
  const [openContracts, setOpenContracts] = useState(true)
  const [openConsole, setOpenConsole] = useState(true)

  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [isContractCallLoading, setIsContractCallLoading] = useState(false)

  const [consoleCompile, setConsoleCompile] = useState<ConsoleCompile[]>([])

  const [contractInspections, setContractInspections] = useState<
    ContractInspectionI[]
  >([])

  const [navBarSelected, setNavBarSelected] = useState('General')

  const [isSavingContract, setIsSavingContract] = useState(false)
  const [blockchainContracts, setBlockchainContracts] = useState<
    BlockchainContractProps[]
  >([])
  const [blockchainContractSelected, setBlockchainContractSelected] =
    useState<BlockchainContractProps>()
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
  const [contractsToBeSaved, dispatch] = useReducer(contractReducer, [])
  const { workspace, user } = useContext(AccountContext)
  const [decorationIds, setDecorationIds] = useState([])

  const { push } = useRouter()
  const pathname = usePathname()

  const saveTimeoutRef = useRef(null)

  const editorRef = useRef()
  const [language, setLanguage] = useState('')
  const [highlightLine, setHighlightLine] = useState(false)

  const onMount = (editor, highlightLine?: number) => {
    editorRef.current = editor
    editor.focus()

    if (highlightLine) {
      // Add the decoration to highlight line 10
      const newDecorationIds = editor.deltaDecorations(
        [],
        [
          {
            range: new monaco.Range(highlightLine, 1, highlightLine, 1),
            options: {
              isWholeLine: true,
              className: 'myLineDecoration',
            },
          },
        ],
      )
      setDecorationIds(newDecorationIds)
    } else {
      editor.deltaDecorations(decorationIds, [])
      setDecorationIds([])
    }
  }
  const menuRef = useRef(null)

  function convertToBuffer(data) {
    return new Uint8Array(data).buffer
  }

  async function loadWasmModuleFromBuffer(buffer) {
    // Aqui, assumimos que 'buffer' é um ArrayBuffer do WASM compilado.
    const wasmModule = await WebAssembly.instantiate(buffer)
    return wasmModule.instance.exports
  }

  const executeFunction = (wasmExports) => {
    // const argsArray = [BigInt('bruno'.trim())]
    console.log('chamando')
    const func = wasmExports['add']
    if (!func) {
      toast.error('Function not found!')
      return
    }
    try {
      const funcResult = func()
      return funcResult
    } catch (error) {
      console.error('Error executing WASM function:', error)
      toast.error('Error executing function!')
    }
  }

  function listWasmFunctions(exports) {
    return Object.keys(exports).filter(
      (key) => typeof exports[key] === 'function',
    )
  }

  async function compileContract() {
    setIsLoadingCompilation(true)

    const { userSessionToken } = parseCookies()

    const data = {
      walletId: '123',
      contractId: blockchainContractSelected?.id,
      code: blockchainContractSelected?.code,
    }

    try {
      const res = await callAxiosBackend(
        'post',
        '/blockchain/functions/compileSorobanContract',
        userSessionToken,
        data,
      )
      setContractInspections(res.contractInspection)
      const newLogs = [...consoleLogs]
      newLogs.unshift({
        type: 'compile',
        contractName: blockchainContractSelected?.name,
        wasm: JSON.stringify(res.contractWasm.data),
        createdAt: String(new Date()),
      })
      setConsoleLogs(newLogs)
    } catch (err) {
      console.log(err)
      console.log('Error: ' + err.response.data.message)
      // let errorDescription = extractTextMessage(
      //   err.response.data.message,
      //   'error[',
      //   'Building',
      // )
      // let errorMessage = extractTextMessage(errorDescription, 'error[', '\n')

      // errorMessage = convertAnsiToHtml(errorMessage)
      // errorDescription = convertAnsiToHtml(errorDescription)

      // console.log('response tratado: ' + errorMessage)

      const out = extractAllErrorMessages(err.response.data.message)

      console.log('out prisma')
      console.log(out)

      const finalOut = []
      for (let i = 0; i < out?.length; i++) {
        let errorDescription = extractTextMessageSecondOcorrency(
          out[i],
          '\u001b[0m\r\n\u001b[0m',
          'Building',
        )
        let errorMessage = extractTextMessage(out[i], 'error[', '\n')
        errorMessage = convertAnsiToHtml(errorMessage)
        errorDescription = convertAnsiToHtml(errorDescription)

        console.log('mesnagem enviando pra pegar')
        console.log(out[i])
        let lineError = extractTextMessageAndRemoveItems(
          out[i],
          '[0m\r\n\u001b[0m\u001b[1m\u001b[38;5;12m',
          '\u001b[0m ',
        )
        lineError = Number(lineError)
        console.log('lineError')

        console.log({ errorDescription, errorMessage, lineError })
        finalOut.unshift({
          errorDescription,
          errorMessage,
          lineError,
          type: 'error',
        })
      }
      console.log('outs:')
      console.log(finalOut)
      setConsoleLogs(finalOut)
    }
    setIsLoadingCompilation(false)
  }

  async function deployContract() {
    setOpenModalDeploy(false)
    setIsLoadingCompilation(true)

    const chain = selected.value
    const { userSessionToken } = parseCookies()

    const data = {
      walletId: blockchainWalletsSelected.value,
      contractId: blockchainContractSelected?.id,
      environment: selected.value.toLowerCase(),
    }

    try {
      const res = await callAxiosBackend(
        'post',
        '/blockchain/functions/deploySorobanContract',
        userSessionToken,
        data,
      )

      const newLogs = [...consoleLogs]
      newLogs.unshift({
        type: 'deploy',
        contractName: blockchainContractSelected?.name,
        desc: `Address ${res.contractAddress}`,
        createdAt: String(new Date()),
      })
      setConsoleLogs(newLogs)

      const newContracts = [...blockchainContracts]
      const cntIndex = newContracts.findIndex(
        (cnt) => cnt.id === blockchainContractSelected?.id,
      )
      newContracts[cntIndex].currentAddress = res.contractAddress
      newContracts[cntIndex].currentChain = chain

      setBlockchainContracts(newContracts)
      setBlockchainContractSelected(newContracts[cntIndex])
    } catch (err) {
      console.log(err)
      console.log('Error: ' + err.response.data.message)

      const newLogs = [...consoleLogs]
      newLogs.unshift({
        type: 'deployError',
        desc: err.response.data.message,
        contractName: blockchainContractSelected?.name,
        createdAt: String(new Date()),
      })
      setConsoleLogs(newLogs)
    }
    setIsLoadingCompilation(false)
  }

  async function callContract(functionName: string, functionParams: string[]) {
    setIsContractCallLoading(false)

    const { userSessionToken } = parseCookies()

    const data = {
      walletId: blockchainWalletsSelected.value,
      contractAddress: blockchainContractSelected?.currentAddress,
      environment: selected.value.toLowerCase(),
      functionName,
      functionParams,
    }

    try {
      const res = await callAxiosBackend(
        'post',
        '/blockchain/functions/callSorobanContract',
        userSessionToken,
        data,
      )

      const newLogs = [...consoleLogs]
      newLogs.unshift({
        type: 'contractCall',
        title: `${functionName} -> ${res}`,
        contractAddress:
          'CCN4QMR5U3YLBXXFFWKRYQGLYOWY6VAMU6BKC6FJFOHBBTCN6DJXPK55',
        desc: `Address ${res.contractAddress}`,
        createdAt: String(new Date()),
      })
      setConsoleLogs(newLogs)

      // const newContracts = [...blockchainContracts]
      // const cntIndex = newContracts.findIndex(
      //   (cnt) => cnt.id === blockchainContractSelected?.id,
      // )
      // newContracts[cntIndex].address = res.contractAddress
      // newContracts[cntIndex].chain = chain

      // setBlockchainContracts(newContracts)
      // setBlockchainContractSelected(newContracts[cntIndex])
    } catch (err) {
      console.log(err)
      console.log('Error: ' + err.response.data.message)

      const newLogs = [...consoleLogs]
      newLogs.unshift({
        type: 'deployError',
        desc: err.response.data.message,
        contractName: blockchainContractSelected?.name,
        createdAt: String(new Date()),
      })
      setConsoleLogs(newLogs)
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

  async function saveContract(id: string) {
    setIsSavingContract(true)
    const { userSessionToken } = parseCookies()

    const data = {
      id: id,
      code: blockchainContracts?.find((cntc) => cntc?.id === id).code,
    }

    try {
      const res = await callAxiosBackend(
        'put',
        '/blockchain/functions/saveContractCode',
        userSessionToken,
        data,
      )
      const contracts = [...blockchainContracts]
      const contractInx = contracts.findIndex((item) => item.id === id)
      contracts[contractInx].updatedAt = String(new Date())
      setBlockchainContracts(contracts)
    } catch (err) {
      console.log(err)
      toast.error(`Error saving contract: ${err.response.data.message}`)
    }
    setIsSavingContract(false)
  }

  const saveContracts = (contractId) => {
    dispatch({ type: 'ADD_CONTRACT', payload: contractId })
    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveContractsUpdate()
    }, 1500)
  }

  const saveContractsUpdate = () => {
    contractsToBeSaved.forEach((contractId) => {
      saveContract(contractId)
    })
  }

  useEffect(() => {
    return () => {
      clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (blockchainContracts?.length > 0) {
      setBlockchainContractSelected(blockchainContracts[0])
    }
  }, [isLoadingContracts])

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
          <Sidebar
            blockchainContractSelected={blockchainContractSelected}
            blockchainContracts={blockchainContracts}
            blockchainWallets={blockchainWallets}
            blockchainWalletsDropdown={blockchainWalletsDropdown}
            blockchainWalletsSelected={blockchainWalletsSelected}
            contractName={contractName}
            contractRename={contractRename}
            id={id}
            isLoadingContracts={isLoadingContracts}
            isLoadingNewContract={isLoadingNewContract}
            nameRef={nameRef}
            openCode={openCode}
            openConsole={openConsole}
            openContracts={openContracts}
            selected={selected}
            setBlockchainContractSelected={setBlockchainContractSelected}
            setBlockchainContracts={setBlockchainContracts}
            setBlockchainWalletsSelected={setBlockchainWalletsSelected}
            setContractName={setContractName}
            setContractRename={setContractRename}
            setIsLoadingContracts={setIsLoadingContracts}
            setIsLoadingNewContract={setIsLoadingNewContract}
            setOpenCode={setOpenCode}
            setOpenConsole={setOpenConsole}
            setOpenContracts={setOpenContracts}
            setSelected={setSelected}
          />
          {blockchainContracts?.length > 0 ? (
            <>
              {openCode && (
                <div className="w-full min-w-[60%] max-w-[80%]">
                  <div className="flex w-full justify-between">
                    <div className="relative flex gap-x-4 text-[14px]">
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
                      {languageSelectorOpen && (
                        <div
                          className="absolute top-[35px] !z-[999999]"
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
                    </div>

                    <div className="mb-2 flex items-center gap-x-3">
                      <div
                        onClick={() => {
                          compileContract()
                          // toast.success('contracts ' + contractsToBeSaved)
                        }}
                        className={`${
                          isLoading
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
                      >
                        Compile
                      </div>

                      <div
                        onClick={() => {
                          if (contractInspections?.length > 0) {
                            setOpenModalDeploy(true)
                          }
                        }}
                        className={`${
                          isLoading
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] ${
                          contractInspections?.length === 0 &&
                          '!cursor-default !bg-[#35428a77] !text-[#ffffffab]'
                        }`}
                      >
                        Deploy
                      </div>

                      <div
                        onClick={() => {
                          setOpenModalImport(true)
                        }}
                        className={`${
                          isLoading
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] ${
                          contractInspections?.length === 0 && '!cursor-default !bg-[#35428a77] !text-[#ffffffab]'
                        }`}
                      >
                        Import
                      </div>
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
                      value={blockchainContractSelected?.code}
                      language={language}
                      onMount={(editor) => {
                        onMount(editor)
                      }}
                      onChange={(value) => {
                        if (!isLoadingCompilation) {
                          const newBlockchainContracts = [
                            ...blockchainContracts,
                          ]
                          const index = newBlockchainContracts.findIndex(
                            (blc) => blc.id === blockchainContractSelected?.id,
                          )
                          newBlockchainContracts[index].code = value
                          setBlockchainContracts(newBlockchainContracts)
                          setBlockchainContractSelected(
                            newBlockchainContracts[index],
                          )
                          saveContracts(blockchainContractSelected?.id)
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
                        Last save:{' '}
                        {String(
                          new Date(blockchainContractSelected?.updatedAt),
                        )}
                      </div>
                    )}
                    <DeployContractModal
                      isOpen={openModalDeploy}
                      onUpdateM={() => {
                        deployContract()
                      }}
                      onClose={() => {
                        setOpenModalDeploy(false)
                      }}
                      contract={blockchainContractSelected}
                      environment={selected.value}
                      wallet={blockchainWalletsSelected.value}
                      walletBalance={
                        blockchainWallets.find(
                          (obj) => obj.id === blockchainWalletsSelected.value,
                        ).balance
                      }
                      onUpdateContractFunction={(value) => {
                        const newContractInspections = [...contractInspections]
                        newContractInspections[isCallingFunctionModal] = value
                        setContractInspections(newContractInspections)
                      }}
                    />
                    <ImportContractModal
                      isOpen={openModalDeploy}
                      onUpdateM={(value) => {
                        const newContracts = [...blockchainContracts]
                        const cntIndex = newContracts.findIndex(
                          (cnt) => cnt.id === blockchainContractSelected?.id,
                        )
                        newContracts[cntIndex].currentAddress = value
                        newContracts[cntIndex].currentChain = selected.value
                        setBlockchainContracts(newContracts)
                        setBlockchainContractSelected(newContracts[cntIndex])
                      }}
                      onClose={() => {
                        setOpenModalDeploy(false)
                      }}
                      contract={blockchainContractSelected}
                      environment={selected.value}
                    />
                  </div>
                </div>
              )}

              {(openContracts || openConsole) && (
                <div className="grid h-[76vh] w-full gap-y-[1vh] text-[13px]">
                  {openContracts && (
                    <div className="h-[38vh] max-h-[38vh] w-full overflow-y-auto rounded-xl bg-[#1D2144] px-4   py-4 scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md ">
                      <div className="flex justify-between">
                        <div className="flex gap-x-[5px]">
                          <img
                            alt="ethereum avatar"
                            src="/images/depin/document.svg"
                            className="w-[16px]"
                          ></img>
                          <div className="font-medium">Contract</div>
                        </div>
                        {blockchainContractSelected?.currentAddress && (
                          <div className="flex items-center gap-x-5">
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  blockchainContractSelected?.currentAddress,
                                )
                                toast.success('Address copied')
                              }}
                            >
                              {transformString(
                                blockchainContractSelected?.currentAddress,
                                7,
                              )}
                            </div>
                            <div className="flex items-center gap-x-1">
                              <img
                                alt="ethereum avatar"
                                src="/images/depin/chain.svg"
                                className="my-auto w-[20px]"
                              ></img>
                              <div className="text-[#c5c4c4]">
                                {blockchainContractSelected?.currentChain}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-[20px] grid gap-y-[12px]">
                        {contractInspections?.map((cntIns, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              if (!cntIns?.isOpen) {
                                const newContractInspects = [
                                  ...contractInspections,
                                ]
                                newContractInspects[index].isOpen =
                                  !newContractInspects[index].isOpen
                                setContractInspections(newContractInspects)
                              }
                            }}
                            className={`${
                              !cntIns?.isOpen &&
                              'w-fit cursor-pointer !py-[5px]'
                            } relative rounded-lg border-[1px] border-transparent bg-[#dbdbdb1e] px-[10px] py-[10px] hover:border-[#dbdbdb42]`}
                          >
                            <div className="flex gap-x-[8px]">
                              <div className="2xl:text-sm">
                                {cntIns?.functionName}
                              </div>
                              <img
                                alt="ethereum avatar"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const newContractInspects = [
                                    ...contractInspections,
                                  ]
                                  newContractInspects[index].isOpen =
                                    !newContractInspects[index].isOpen
                                  setContractInspections(newContractInspects)
                                }}
                                src="/images/header/arrow-gray.svg"
                                className={`w-[12px]  cursor-pointer rounded-full transition-transform duration-150 ${
                                  cntIns?.isOpen && 'rotate-180'
                                }`}
                              ></img>
                              {cntIns?.isOpen && (
                                <img
                                  alt="ethereum avatar"
                                  src="/images/depin/open.svg"
                                  onClick={() => {
                                    setIsCallingFunctionModal(index)
                                  }}
                                  className="absolute right-2 top-2 w-[21px] cursor-pointer"
                                ></img>
                              )}
                            </div>
                            {cntIns?.isOpen && (
                              <div className="mb-1 w-full px-2">
                                <div
                                  className="mt-2 whitespace-pre-wrap text-[#c5c4c4]"
                                  dangerouslySetInnerHTML={{
                                    __html: cleanDocs(cntIns?.docs),
                                  }}
                                />
                                <div className="mb-4 mt-2 grid gap-y-3 ">
                                  {cntIns?.inputs?.map(
                                    (cntInsInput, indexInput) => (
                                      <div key={indexInput}>
                                        <div className="mb-1 flex items-center justify-between text-base font-light">
                                          <div className="">
                                            {cntInsInput?.name}
                                          </div>
                                          <div className="text-xs text-[#c5c4c4]">
                                            {cntInsInput?.type}
                                          </div>
                                        </div>

                                        <input
                                          type="text"
                                          id="workspaceName"
                                          name="workspaceName"
                                          value={cntInsInput?.value}
                                          onChange={(e) => {
                                            if (!isLoading) {
                                              const newContractInspections = [
                                                ...contractInspections,
                                              ]
                                              newContractInspections[
                                                index
                                              ].inputs[indexInput].value =
                                                e.target.value
                                              setContractInspections(
                                                newContractInspections,
                                              )
                                            }
                                          }}
                                          className="w-full rounded-md border border-transparent px-3 py-1 text-base placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
                                        />
                                      </div>
                                    ),
                                  )}
                                </div>
                                <div className="flex gap-x-5">
                                  <div
                                    onClick={() => {
                                      if (
                                        !blockchainContractSelected.currentAddress
                                      ) {
                                        const newContractInspections = [
                                          ...contractInspections,
                                        ]
                                        newContractInspections[
                                          index
                                        ].transactError = true
                                        setContractInspections(
                                          newContractInspections,
                                        )
                                        return
                                      } else {
                                        const newContractInspections = [
                                          ...contractInspections,
                                        ]
                                        newContractInspections[
                                          index
                                        ].transactError = false
                                        setContractInspections(
                                          newContractInspections,
                                        )
                                      }
                                      if (!isContractCallLoading) {
                                        const finalCntInsInput = []

                                        for (
                                          let i = 0;
                                          i < cntIns?.inputs?.length;
                                          i++
                                        ) {
                                          finalCntInsInput.push({
                                            paramName: cntIns?.inputs[i].name,
                                            value: cntIns?.inputs[i].value,
                                          })
                                        }
                                        callContract(
                                          cntIns?.functionName,
                                          finalCntInsInput,
                                        )
                                      }
                                    }}
                                    className={`${
                                      isContractCallLoading
                                        ? 'animate-pulse !bg-[#35428a]'
                                        : 'cursor-pointer  hover:bg-[#35428a]'
                                    }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
                                  >
                                    Transact
                                  </div>
                                  {cntIns?.transactError && (
                                    <div className="text-xs font-medium text-[#cc5563]">
                                      Deploy / Import your contract to call this
                                      function
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <NewCallFunctionModal
                        isOpen={isCallingFunctionModal >= 0}
                        onUpdateM={() => {
                          console.log('')
                        }}
                        onClose={() => {
                          setIsCallingFunctionModal(-1)
                        }}
                        contractFunction={
                          contractInspections[isCallingFunctionModal]
                        }
                        onUpdateContractFunction={(value) => {
                          const newContractInspections = [
                            ...contractInspections,
                          ]
                          newContractInspections[isCallingFunctionModal] = value
                          setContractInspections(newContractInspections)
                        }}
                      />
                    </div>
                  )}
                  {openConsole && (
                    <div className="h-[38vh] max-h-[38vh] w-full overflow-y-auto rounded-xl bg-[#1D2144] px-4   py-4 scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md ">
                      <div className="flex gap-x-[5px]">
                        <img
                          alt="ethereum avatar"
                          src="/images/depin/terminal.svg"
                          className="w-[16px]"
                        ></img>
                        <div className="font-medium">Console</div>
                      </div>
                      <div className="mt-[20px] grid gap-y-[12px]">
                        {consoleLogs?.map((cnslLog, index) => (
                          <>
                            {cnslLog?.type === 'error' && (
                              <div
                                onMouseEnter={() => {
                                  onMount(editorRef.current, cnslLog?.lineError)
                                }}
                                onMouseLeave={() => {
                                  onMount(editorRef.current)
                                }}
                                key={index}
                                onClick={() => {
                                  if (!cnslLog?.isOpen) {
                                    const newConsoles = [...consoleLogs]
                                    newConsoles[index].isOpen =
                                      !newConsoles[index].isOpen
                                    setConsoleLogs(newConsoles)
                                  }
                                }}
                                className={`${
                                  !cnslLog?.isOpen && 'cursor-pointer'
                                } rounded-lg border-[1px] border-transparent bg-[#dbdbdb1e] px-[10px] py-[5px] hover:border-[#dbdbdb42]`}
                              >
                                <div className="flex  justify-between">
                                  <div className="flex gap-x-[8px]">
                                    <img
                                      alt="ethereum avatar"
                                      src="/images/depin/warning.svg"
                                      className="w-[20px]"
                                    ></img>
                                    <div
                                      className="whitespace-pre-wrap"
                                      dangerouslySetInnerHTML={{
                                        __html: cnslLog?.errorMessage,
                                      }}
                                    />
                                  </div>

                                  <img
                                    alt="ethereum avatar"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const newConsoles = [...consoleLogs]
                                      newConsoles[index].isOpen =
                                        !newConsoles[index].isOpen
                                      setConsoleLogs(newConsoles)
                                    }}
                                    src="/images/header/arrow-gray.svg"
                                    className={`w-[12px]  cursor-pointer rounded-full transition-transform duration-150 ${
                                      cnslLog?.isOpen && 'rotate-180'
                                    }`}
                                  ></img>
                                </div>
                                {cnslLog?.isOpen && (
                                  <div
                                    className="whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{
                                      __html: cnslLog?.errorDescription,
                                    }}
                                  />
                                )}
                              </div>
                            )}
                            {cnslLog?.type === 'compile' && (
                              <div
                                key={index}
                                onClick={() => {
                                  if (!cnslLog?.isOpen) {
                                    const newConsoles = [...consoleLogs]
                                    newConsoles[index].isOpen =
                                      !newConsoles[index].isOpen
                                    setConsoleLogs(newConsoles)
                                  }
                                }}
                                className={`${
                                  !cnslLog?.isOpen && 'cursor-pointer'
                                } rounded-lg border-[1px] border-transparent bg-[#dbdbdb1e] px-[10px] py-[8px] hover:border-[#dbdbdb42]`}
                              >
                                <div className="flex justify-between">
                                  <div>
                                    Contract {cnslLog?.contractName} compiled
                                  </div>
                                  <img
                                    alt="ethereum avatar"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const newConsoles = [...consoleLogs]
                                      newConsoles[index].isOpen =
                                        !newConsoles[index].isOpen
                                      setConsoleLogs(newConsoles)
                                    }}
                                    src="/images/header/arrow-gray.svg"
                                    className={`w-[12px]  cursor-pointer rounded-full transition-transform duration-150 ${
                                      cnslLog?.isOpen && 'rotate-180'
                                    }`}
                                  ></img>
                                </div>
                                {cnslLog?.isOpen && (
                                  <div className="mt-3">
                                    <div className="flex items-center gap-x-3">
                                      <div className="mt-[1px] text-[#c5c4c4]">
                                        Wasm:{' '}
                                        {cnslLog.wasm.substring(0, 10) +
                                          '...' +
                                          cnslLog.wasm.slice(-10)}
                                      </div>
                                      <img
                                        // ref={editRef}
                                        alt="ethereum avatar"
                                        src="/images/workspace/copy.svg"
                                        className="w-[18px] cursor-pointer rounded-full"
                                        // onMouseEnter={() => setIsCopyInfoOpen(canister.id)}
                                        // onMouseLeave={() => setIsCopyInfoOpen(null)}
                                        onClick={(event) => {
                                          event.stopPropagation()
                                          navigator.clipboard.writeText(
                                            cnslLog.wasm,
                                          )
                                          toast.success('Wasm copied')
                                        }}
                                      ></img>
                                    </div>
                                    <div className="mt-3 flex items-center gap-x-3">
                                      <div className="mt-[1px] text-[#c5c4c4]">
                                        Compiled at:{' '}
                                        {String(
                                          new Date(
                                            cnslLog?.createdAt,
                                          ).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          }),
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="mx-auto flex w-full items-center">
              <div className="mx-auto pb-14">
                <img
                  alt="ethereum avatar"
                  src="/images/depin/documents.svg"
                  className="mx-auto mb-5 w-[30px]"
                ></img>
                <div
                  onClick={async () => {
                    if (!isLoadingNewContract) {
                      const newContract: BlockchainContractProps =
                        await createNewContract()
                      const newCnts = [...blockchainContracts, newContract]
                      setBlockchainContracts(newCnts)
                    }
                  }}
                  className={`mx-auto ${
                    isLoadingNewContract
                      ? 'animate-pulse'
                      : 'animate-bounce cursor-pointer'
                  }  rounded-[5px]  bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]`}
                >
                  Create a new contract
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default MainPage
