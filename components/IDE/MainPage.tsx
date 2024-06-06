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

import { retrievePublicKey, checkConnection } from './Funcs/freighter'
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
  ConsoleCompile,
  ConsoleLog,
  ContractInspectionI,
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
import BotHelperModal from './Modals/BotHelperModal'
import { deployContractFreighter } from './Funcs/soroban-contract-deployer'
import {
  setAllowed,
  isAllowed,
  getUserInfo,
  getNetwork,
} from '@stellar/freighter-api'

export const cleanDocs = (docs) => {
  return docs?.replace(/(\r\n\s+|\n\s+)/g, '\n').trim()
}

export enum TypeWalletProvider {
  ACCELAR,
  FREIGHTER,
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

  const [walletProvider, setWalletProvider] = useState<TypeWalletProvider>(
    TypeWalletProvider.ACCELAR,
  )

  const monaco = useMonaco()
  const [selected, setSelected] = useState<ValueObject>(optionsNetwork[0])
  const [openModalDeploy, setOpenModalDeploy] = useState(false)
  const [openModalImport, setOpenModalImport] = useState(false)
  const [isLoadingWallets, setIsLoadingWallets] = useState(false)

  const [openModalBotHelper, setOpenModalBotHelper] = useState(false)

  const [openCode, setOpenCode] = useState(true)
  const [openContracts, setOpenContracts] = useState(true)
  const [openConsole, setOpenConsole] = useState(true)

  const [infoBotOpen, setInfoBotOpen] = useState(false)

  const [isContractCallLoading, setIsContractCallLoading] = useState<any>(false)

  const [consoleCompile, setConsoleCompile] = useState<ConsoleCompile[]>([])

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

  async function writeCode(cntIndex: number, finalV: string) {
    if (cntIndex < 0 || cntIndex >= blockchainContracts.length) {
      return
    }

    let index = 0
    let textToBuild = ''

    const intervalId = setInterval(() => {
      if (index < finalV.length) {
        textToBuild = textToBuild + finalV.charAt(index)

        setBlockchainContracts((prevContracts) => {
          const newContracts = [...prevContracts]
          newContracts[cntIndex].code = textToBuild
          setBlockchainContractSelected(newContracts[cntIndex])
          return newContracts
        })

        index++
      } else {
        clearInterval(intervalId)
      }
    }, 5)
  }

  const [connect, setConnected] = useState('Connect Wallet')
  const [publickey, setPublicKey] = useState('Wallet not Connected..')

  useEffect(() => {
    if (publickey !== 'Wallet not Connected..') {
      setConnected(publickey)
    }
  }, [publickey])

  async function connectWallet() {
    if (await checkConnection()) {
      const publicKey = await retrievePublicKey()
      setPublicKey(publicKey)
    }
  }

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
      console.log('passei')
      const newContracts = [...blockchainContracts]
      const cntIndex = newContracts.findIndex(
        (cnt) => cnt.id === blockchainContractSelected?.id,
      )
      console.log('passei 123')
      newContracts[cntIndex].wasm = res.contractWasm.data

      newContracts[cntIndex].consoleLogs =
        newContracts[cntIndex].consoleLogs ?? []

      newContracts[cntIndex].contractInspections = res.contractInspection

      newContracts[cntIndex].consoleLogs.unshift({
        type: 'compile',
        contractName: blockchainContractSelected?.name,
        wasm: JSON.stringify(res.contractWasm.data),
        createdAt: String(new Date()),
      })
      console.log('passei 12345')

      setBlockchainContracts(newContracts)
      setBlockchainContractSelected(newContracts[cntIndex])

      // console.log('starting deploy')
      // console.log(typeof res.contractWasm.data)
      // console.log(res.contractWasm.data)
      // console.log('tratamentw')
      // const contractWasmBuffer = Buffer.from(res.contractWasm.data)
      // console.log(contractWasmBuffer)
      // console.log(typeof contractWasmBuffer)
      // console.log('pr')
      // console.log(contractWasmBuffer.toString('hex')) // Exibir como string hexadecimal
      // console.log(typeof contractWasmBuffer.toString('hex'))
      // console.log('213453421')
      // console.log(contractWasmBuffer.toString('base64')) // Exibir como string base64
      // console.log(typeof contractWasmBuffer.toString('base64'))

      // await deployContract(contractWasmBuffer)
      // deploySmartContract(contractWasmBuffer)
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

      const newContracts = [...blockchainContracts]
      const cntIndex = newContracts.findIndex(
        (cnt) => cnt.id === blockchainContractSelected?.id,
      )

      newContracts[cntIndex].consoleLogs =
        newContracts[cntIndex].consoleLogs ?? []

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
        console.log(errorDescription)

        console.log({ errorDescription, errorMessage, lineError })
        newContracts[cntIndex].consoleLogs.unshift({
          errorDescription,
          errorMessage,
          lineError,
          type: 'error',
        })
      }

      setBlockchainContracts(newContracts)
      setBlockchainContractSelected(newContracts[cntIndex])
    }
    setIsLoadingCompilation(false)
  }

  async function deployContract() {
    setOpenModalDeploy(false)
    setIsLoadingCompilation(true)

    const chain = selected.value
    const { userSessionToken } = parseCookies()

    if (walletProvider === TypeWalletProvider.ACCELAR) {
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
        const newContracts = [...blockchainContracts]
        const cntIndex = newContracts.findIndex(
          (cnt) => cnt.id === blockchainContractSelected?.id,
        )
        newContracts[cntIndex].currentAddress = res.contractAddress
        newContracts[cntIndex].currentChain = chain
        newContracts[cntIndex].consoleLogs.unshift({
          type: 'deploy',
          contractName: blockchainContractSelected?.name,
          desc: `${res.contractAddress}`,
          createdAt: String(new Date()),
        })

        setBlockchainContracts(newContracts)
        setBlockchainContractSelected(newContracts[cntIndex])
      } catch (err) {
        console.log(err)
        console.log('Error: ' + err.response.data.message)

        const newContracts = [...blockchainContracts]
        const cntIndex = newContracts.findIndex(
          (cnt) => cnt.id === blockchainContractSelected?.id,
        )
        const errorDescription = convertAnsiToHtml(err.response.data.message)
        console.log(errorDescription)

        newContracts[cntIndex].consoleLogs.unshift({
          type: 'deployError',
          desc: errorDescription,
          contractName: blockchainContractSelected?.name,
          createdAt: String(new Date()),
        })

        setBlockchainContracts(newContracts)
        setBlockchainContractSelected(newContracts[cntIndex])
      }
    } else if (walletProvider === TypeWalletProvider.FREIGHTER) {
      try {
        const contractWasmBuffer = Buffer.from(blockchainContractSelected.wasm)
        const addressRes = await deployContractFreighter(contractWasmBuffer)

        const newContracts = [...blockchainContracts]
        const cntIndex = newContracts.findIndex(
          (cnt) => cnt.id === blockchainContractSelected?.id,
        )
        newContracts[cntIndex].currentAddress = addressRes
        newContracts[cntIndex].currentChain = chain
        newContracts[cntIndex].consoleLogs.unshift({
          type: 'deploy',
          contractName: blockchainContractSelected?.name,
          desc: `${addressRes}`,
          createdAt: String(new Date()),
        })

        setBlockchainContracts(newContracts)
        setBlockchainContractSelected(newContracts[cntIndex])
      } catch (err) {
        toast.error(err)
      }
    }

    setIsLoadingCompilation(false)
  }

  async function callContract(
    functionName: string,
    functionParams: { paramName: string; value: string }[],
  ) {
    setIsContractCallLoading(functionName)

    const address = blockchainContractSelected?.currentAddress

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
      const newContracts = [...blockchainContracts]
      const cntIndex = newContracts.findIndex(
        (cnt) => cnt.id === blockchainContractSelected?.id,
      )
      newContracts[cntIndex].consoleLogs.unshift({
        type: 'contractCall',
        functionName,
        args: functionParams.map((param) => param.value),
        responseValue: JSON.parse(res.value),
        desc: address,
        createdAt: String(new Date()),
      })

      setBlockchainContracts(newContracts)
      setBlockchainContractSelected(newContracts[cntIndex])
    } catch (err) {
      console.log(err)
      console.log('Error: ' + err.response.data.message)

      const newContracts = [...blockchainContracts]
      const cntIndex = newContracts.findIndex(
        (cnt) => cnt.id === blockchainContractSelected?.id,
      )
      newContracts[cntIndex].consoleLogs.unshift({
        type: 'deployError',
        desc: err.response.data.message,
        contractName: blockchainContractSelected?.name,
        createdAt: String(new Date()),
      })

      setBlockchainContracts(newContracts)
      setBlockchainContractSelected(newContracts[cntIndex])
    }
    setIsContractCallLoading(false)
  }

  async function getData(environment?: string) {
    setIsLoadingWallets(true)
    const { userSessionToken } = parseCookies()

    let rpc = ''
    if (environment === 'Testnet') {
      rpc = '&sorobanRPC=https://horizon-testnet.stellar.org'
    }

    try {
      const res = await callAxiosBackend(
        'get',
        `/blockchain/functions/getWorkspaceWallets?id=${id}&network=STELLAR${rpc}`,
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
    setIsLoadingWallets(false)
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
      res.consoleLogs = []
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
    getData('Testnet')
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

  function getContractSelectedIndex() {
    const newContracts = [...blockchainContracts]
    const cntIndex = blockchainContracts.findIndex(
      (cnt) => cnt.id === blockchainContractSelected?.id,
    )
    return cntIndex
  }

  function setParamsToContracts(
    newContracts: BlockchainContractProps[],
    cntIndex: number,
  ) {
    setBlockchainContracts(newContracts)
    setBlockchainContractSelected(newContracts[cntIndex])
  }

  function saveContractsUpdate() {
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
      <section className="relative z-10 max-h-[calc(100vh-6rem)] overflow-hidden px-[20px] pb-16 text-[16px]  md:pb-20 lg:pb-28 lg:pt-[40px] 2xl:max-h-[calc(100vh-8rem)]">
        <div className=" flex gap-x-[10px] text-[#fff]">
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
            isLoadingWallets={isLoadingWallets}
            getData={(value) => {
              getData(value)
            }}
            walletProvider={walletProvider}
            setWalletProvider={setWalletProvider}
            connectWallet={connectWallet}
            connect={connect}
          />
          {blockchainContracts?.length > 0 ? (
            <>
              {openCode && (
                <div className="w-full min-w-[60%]">
                  <div className="flex w-full justify-between">
                    <div className="relative flex items-center gap-x-4 text-[14px]">
                      <div>{blockchainContractSelected?.name}</div>
                      <div
                        onClick={() => setLanguageSelectorOpen(true)}
                        className="my-auto mb-2 flex w-fit cursor-pointer items-center gap-x-[7px] rounded-md pl-2 pr-3 text-[14px] font-normal text-[#c5c4c4] hover:bg-[#c5c5c510]"
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
                      {(isLoading || isLoadingCompilation) && (
                        <svg
                          aria-hidden="true"
                          className="mr-3 h-6 w-6 animate-spin fill-[#273687] text-[#fff]"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                      )}
                      <div
                        onClick={async () => {
                          const network = await getNetwork()
                          console.log(network)
                          // toast.success('contracts ' + contractsToBeSaved)
                        }}
                        className={`${
                          isLoading || isLoadingCompilation
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
                      >
                        networ
                      </div>
                      <div
                        onClick={async () => {
                          console.log(await getUserInfo())
                          // toast.success('contracts ' + contractsToBeSaved)
                        }}
                        className={`${
                          isLoading || isLoadingCompilation
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
                      >
                        userInfo
                      </div>
                      <div
                        onClick={async () => {
                          console.log(await isAllowed())
                          await setAllowed()
                          // toast.success('contracts ' + contractsToBeSaved)
                        }}
                        className={`${
                          isLoading || isLoadingCompilation
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
                      >
                        requestAccess
                      </div>
                      <div
                        onClick={() => {
                          connectWallet()
                          // toast.success('contracts ' + contractsToBeSaved)
                        }}
                        className={`${
                          isLoading || isLoadingCompilation
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
                      >
                        connectWallet
                      </div>
                      <div
                        onClick={() => {
                          compileContract()
                          // toast.success('contracts ' + contractsToBeSaved)
                        }}
                        className={`${
                          isLoading || isLoadingCompilation
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
                      >
                        Compile
                      </div>

                      <div
                        onClick={() => {
                          console.log(
                            blockchainContractSelected?.contractInspections,
                          )
                          if (
                            blockchainContractSelected?.contractInspections
                              ?.length > 0
                          ) {
                            setOpenModalDeploy(true)
                          }
                        }}
                        className={`${
                          isLoading || isLoadingCompilation
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] ${
                          (!blockchainContractSelected?.contractInspections ||
                            blockchainContractSelected?.contractInspections
                              ?.length === 0) &&
                          '!cursor-default !bg-[#35428a77] !text-[#ffffffab]'
                        }`}
                      >
                        Deploy
                      </div>

                      <div
                        onClick={() => {
                          if (
                            blockchainContractSelected?.contractInspections
                              ?.length > 0
                          ) {
                            setOpenModalDeploy(true)
                          }
                        }}
                        className={`${
                          isLoading || isLoadingCompilation
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] ${
                          (!blockchainContractSelected?.contractInspections ||
                            blockchainContractSelected?.contractInspections
                              ?.length > 0) &&
                          '!cursor-default !bg-[#35428a77] !text-[#ffffffab]'
                        }`}
                      >
                        Import
                      </div>
                    </div>
                  </div>
                  <div
                    className={`editor-container relative h-[76vh] w-full 2xl:h-[78vh] ${
                      isLoadingCompilation && 'animate-pulse'
                    }`}
                  >
                    <Editor
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
                    <div className="absolute bottom-3 right-4 rounded-full px-[4px] pb-[4px] pt-[2px] hover:bg-[#dbdbdb1e] 2xl:bottom-4 2xl:right-6">
                      <div className="relative">
                        <img
                          onMouseEnter={() => {
                            setInfoBotOpen(true)
                          }}
                          onMouseLeave={() => {
                            setInfoBotOpen(false)
                          }}
                          onClick={(event) => {
                            event.stopPropagation()
                            setOpenModalBotHelper(true)
                          }}
                          alt="ethereum avatar"
                          src="/images/depin/bot.svg"
                          className=" w-[35px] cursor-pointer"
                        ></img>
                        {infoBotOpen && (
                          <div className="absolute top-0 flex w-[100px] -translate-x-[100%] -translate-y-[100%]  items-center  justify-center   rounded-[6px] bg-[#060621]  px-[10px]  py-[5px] text-center text-[14px]">
                            Accelar Bot
                          </div>
                        )}
                      </div>
                    </div>
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
                      wallet={
                        walletProvider === TypeWalletProvider.ACCELAR
                          ? blockchainWallets.find(
                              (obj) =>
                                obj.id === blockchainWalletsSelected.value,
                            ).stellarWalletPubK
                          : '0x'
                      }
                      walletFreighter={connect}
                      walletProvider={walletProvider}
                      walletBalance={
                        blockchainWallets.find(
                          (obj) => obj.id === blockchainWalletsSelected.value,
                        )?.balance || '0'
                      }
                    />
                    <ImportContractModal
                      isOpen={openModalImport}
                      onUpdateM={(value) => {
                        const newContracts = [...blockchainContracts]
                        const cntIndex = newContracts.findIndex(
                          (cnt) => cnt.id === blockchainContractSelected?.id,
                        )
                        newContracts[cntIndex].currentAddress = value
                        newContracts[cntIndex].currentChain = selected.value
                        setBlockchainContracts(newContracts)
                        setBlockchainContractSelected(newContracts[cntIndex])
                        setOpenModalImport(false)
                      }}
                      onClose={() => {
                        setOpenModalImport(false)
                      }}
                      contract={blockchainContractSelected}
                      environment={selected.value}
                    />
                    <BotHelperModal
                      isOpen={openModalBotHelper}
                      onUpdateM={(response, contractId) => {
                        const finalV = getValueBetweenStrings(
                          response,
                          '```rust\n',
                          '```',
                        )
                        const newContracts = [...blockchainContracts]
                        const cntIndex = newContracts.findIndex(
                          (cnt) => cnt.id === contractId,
                        )
                        writeCode(cntIndex, finalV)
                        saveContracts(contractId)
                        setOpenModalBotHelper(false)
                      }}
                      onClose={() => {
                        setOpenModalBotHelper(false)
                      }}
                      contract={blockchainContractSelected}
                      environment={selected.value}
                    />
                  </div>
                </div>
              )}
              {(openContracts || openConsole) && (
                <div className="grid h-[81vh] w-full max-w-[400px] gap-y-[1vh] text-[13px] 2xl:h-[82vh]">
                  {openContracts && (
                    <div className="h-[40vh] max-h-[40vh] w-full overflow-y-auto rounded-xl bg-[#1D2144] px-4 py-4 scrollbar-thin   scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:h-[40.5vh] 2xl:max-h-[40.5vh] ">
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
                        {blockchainContractSelected?.contractInspections?.map(
                          (cntIns, index) => (
                            <div
                              key={index}
                              onClick={() => {
                                if (!cntIns?.isOpen) {
                                  const newContracts = [...blockchainContracts]
                                  const cntIndex = newContracts.findIndex(
                                    (cnt) =>
                                      cnt.id === blockchainContractSelected?.id,
                                  )

                                  newContracts[cntIndex].contractInspections[
                                    index
                                  ].isOpen =
                                    !newContracts[cntIndex].contractInspections[
                                      index
                                    ].isOpen

                                  setBlockchainContracts(newContracts)
                                  setBlockchainContractSelected(
                                    newContracts[cntIndex],
                                  )
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

                                    const newContracts = [
                                      ...blockchainContracts,
                                    ]
                                    const cntIndex = newContracts.findIndex(
                                      (cnt) =>
                                        cnt.id ===
                                        blockchainContractSelected?.id,
                                    )

                                    newContracts[cntIndex].contractInspections[
                                      index
                                    ].isOpen =
                                      !newContracts[cntIndex]
                                        .contractInspections[index].isOpen

                                    setBlockchainContracts(newContracts)
                                    setBlockchainContractSelected(
                                      newContracts[cntIndex],
                                    )
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
                                                const newContracts = [
                                                  ...blockchainContracts,
                                                ]
                                                const cntIndex =
                                                  newContracts.findIndex(
                                                    (cnt) =>
                                                      cnt.id ===
                                                      blockchainContractSelected?.id,
                                                  )

                                                newContracts[
                                                  cntIndex
                                                ].contractInspections[
                                                  index
                                                ].inputs[indexInput].value =
                                                  e.target.value

                                                setBlockchainContracts(
                                                  newContracts,
                                                )
                                                setBlockchainContractSelected(
                                                  newContracts[cntIndex],
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
                                          const newContracts = [
                                            ...blockchainContracts,
                                          ]
                                          const cntIndex =
                                            newContracts.findIndex(
                                              (cnt) =>
                                                cnt.id ===
                                                blockchainContractSelected?.id,
                                            )

                                          newContracts[
                                            cntIndex
                                          ].contractInspections[
                                            index
                                          ].transactError = true

                                          setBlockchainContracts(newContracts)
                                          setBlockchainContractSelected(
                                            newContracts[cntIndex],
                                          )

                                          return
                                        } else {
                                          const newContracts = [
                                            ...blockchainContracts,
                                          ]
                                          const cntIndex =
                                            newContracts.findIndex(
                                              (cnt) =>
                                                cnt.id ===
                                                blockchainContractSelected?.id,
                                            )

                                          newContracts[
                                            cntIndex
                                          ].contractInspections[
                                            index
                                          ].transactError = false

                                          setBlockchainContracts(newContracts)
                                          setBlockchainContractSelected(
                                            newContracts[cntIndex],
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
                                      }  my-auto h-fit w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
                                    >
                                      Transact
                                    </div>
                                    {cntIns?.transactError && (
                                      <div className="text-xs font-medium text-[#cc5563]">
                                        Deploy or Import your contract to call
                                        this function
                                      </div>
                                    )}
                                    {isContractCallLoading ===
                                      cntIns?.functionName && (
                                      <svg
                                        aria-hidden="true"
                                        className="my-auto mr-3 h-5 w-5 animate-spin fill-[#273687] text-[#fff]"
                                        viewBox="0 0 100 101"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                          fill="currentColor"
                                        />
                                        <path
                                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                          fill="currentFill"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ),
                        )}
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
                          blockchainContractSelected?.contractInspections?.[
                            isCallingFunctionModal
                          ]
                        }
                        onUpdateContractFunction={(value) => {
                          const newContracts = [...blockchainContracts]
                          const cntIndex = newContracts.findIndex(
                            (cnt) => cnt.id === blockchainContractSelected?.id,
                          )

                          newContracts[cntIndex].contractInspections[
                            isCallingFunctionModal
                          ] = value

                          setBlockchainContracts(newContracts)
                          setBlockchainContractSelected(newContracts[cntIndex])
                        }}
                      />
                    </div>
                  )}
                  {openConsole && (
                    <div className="h-[40vh] max-h-[40vh] w-full max-w-[400px] overflow-y-auto rounded-xl bg-[#1D2144] px-4 py-4 scrollbar-thin   scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:h-[40.5vh] 2xl:max-h-[40.5vh] ">
                      <div className="flex gap-x-[5px]">
                        <img
                          alt="ethereum avatar"
                          src="/images/depin/terminal.svg"
                          className="w-[16px]"
                        ></img>
                        <div className="font-medium">Console</div>
                      </div>
                      <div className="mt-[20px] grid gap-y-[12px]">
                        {blockchainContractSelected?.consoleLogs?.map(
                          (cnslLog, index) => (
                            <div className="w-full max-w-[70%]" key={index}>
                              {cnslLog?.type === 'error' && (
                                <div
                                  onMouseEnter={() => {
                                    onMount(
                                      editorRef.current,
                                      cnslLog?.lineError,
                                    )
                                  }}
                                  onMouseLeave={() => {
                                    onMount(editorRef.current)
                                  }}
                                  key={index}
                                  onClick={() => {
                                    if (!cnslLog?.isOpen) {
                                      const newContracts = [
                                        ...blockchainContracts,
                                      ]
                                      const cntIndex =
                                        getContractSelectedIndex()
                                      newContracts[cntIndex].consoleLogs[
                                        index
                                      ].isOpen =
                                        !newContracts[cntIndex].consoleLogs[
                                          index
                                        ].isOpen
                                      setParamsToContracts(
                                        newContracts,
                                        cntIndex,
                                      )
                                    }
                                  }}
                                  className={`${
                                    !cnslLog?.isOpen && 'cursor-pointer'
                                  } max-w-[100%] rounded-lg border-[1px] border-transparent bg-[#dbdbdb1e] px-[10px] py-[5px] hover:border-[#dbdbdb42]`}
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
                                        const newContracts = [
                                          ...blockchainContracts,
                                        ]
                                        const cntIndex =
                                          getContractSelectedIndex()
                                        newContracts[cntIndex].consoleLogs[
                                          index
                                        ].isOpen =
                                          !newContracts[cntIndex].consoleLogs[
                                            index
                                          ].isOpen
                                        setParamsToContracts(
                                          newContracts,
                                          cntIndex,
                                        )
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
                              {cnslLog?.type === 'deployError' && (
                                <div
                                  key={index}
                                  onClick={() => {
                                    if (!cnslLog?.isOpen) {
                                      const newContracts = [
                                        ...blockchainContracts,
                                      ]
                                      const cntIndex =
                                        getContractSelectedIndex()
                                      newContracts[cntIndex].consoleLogs[
                                        index
                                      ].isOpen =
                                        !newContracts[cntIndex].consoleLogs[
                                          index
                                        ].isOpen
                                      setParamsToContracts(
                                        newContracts,
                                        cntIndex,
                                      )
                                    }
                                  }}
                                  className={`${
                                    !cnslLog?.isOpen && 'cursor-pointer'
                                  } w-full max-w-[100%] rounded-lg border-[1px] border-transparent bg-[#dbdbdb1e] px-[10px] py-[5px] hover:border-[#dbdbdb42]`}
                                >
                                  <div className="flex  justify-between">
                                    <div className="flex max-w-[80%] gap-x-[8px]">
                                      <img
                                        alt="ethereum avatar"
                                        src="/images/depin/warning.svg"
                                        className="w-[20px]"
                                      ></img>
                                      <div
                                        className={`${
                                          !cnslLog?.isOpen
                                            ? 'line-clamp-2'
                                            : 'max-w-[90%]'
                                        }`}
                                      >
                                        {cnslLog?.desc}
                                      </div>
                                    </div>

                                    <img
                                      alt="ethereum avatar"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const newContracts = [
                                          ...blockchainContracts,
                                        ]
                                        const cntIndex =
                                          getContractSelectedIndex()
                                        newContracts[cntIndex].consoleLogs[
                                          index
                                        ].isOpen =
                                          !newContracts[cntIndex].consoleLogs[
                                            index
                                          ].isOpen
                                        setParamsToContracts(
                                          newContracts,
                                          cntIndex,
                                        )
                                      }}
                                      src="/images/header/arrow-gray.svg"
                                      className={`w-[12px]  cursor-pointer rounded-full transition-transform duration-150 ${
                                        cnslLog?.isOpen && 'rotate-180'
                                      }`}
                                    ></img>
                                  </div>
                                  {/* {cnslLog?.isOpen && (
                                    <div className="">
                                      {cnslLog?.desc}
                                    </div>
                                  )} */}
                                </div>
                              )}
                              {cnslLog?.type === 'compile' && (
                                <div
                                  key={index}
                                  onClick={() => {
                                    if (!cnslLog?.isOpen) {
                                      const newContracts = [
                                        ...blockchainContracts,
                                      ]
                                      const cntIndex =
                                        getContractSelectedIndex()
                                      newContracts[cntIndex].consoleLogs[
                                        index
                                      ].isOpen =
                                        !newContracts[cntIndex].consoleLogs[
                                          index
                                        ].isOpen
                                      setParamsToContracts(
                                        newContracts,
                                        cntIndex,
                                      )
                                    }
                                  }}
                                  className={`${
                                    !cnslLog?.isOpen && 'cursor-pointer'
                                  } max-w-[100%] rounded-lg border-[1px] border-transparent bg-[#dbdbdb1e] px-[10px] py-[8px] hover:border-[#dbdbdb42]`}
                                >
                                  <div className="flex justify-between">
                                    <div>
                                      Contract {cnslLog?.contractName} compiled
                                    </div>
                                    <img
                                      alt="ethereum avatar"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const newContracts = [
                                          ...blockchainContracts,
                                        ]
                                        const cntIndex =
                                          getContractSelectedIndex()
                                        newContracts[cntIndex].consoleLogs[
                                          index
                                        ].isOpen =
                                          !newContracts[cntIndex].consoleLogs[
                                            index
                                          ].isOpen
                                        setParamsToContracts(
                                          newContracts,
                                          cntIndex,
                                        )
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
                              {cnslLog?.type === 'deploy' && (
                                <div
                                  key={index}
                                  onClick={() => {
                                    if (!cnslLog?.isOpen) {
                                      const newContracts = [
                                        ...blockchainContracts,
                                      ]
                                      const cntIndex =
                                        getContractSelectedIndex()
                                      newContracts[cntIndex].consoleLogs[
                                        index
                                      ].isOpen =
                                        !newContracts[cntIndex].consoleLogs[
                                          index
                                        ].isOpen
                                      setParamsToContracts(
                                        newContracts,
                                        cntIndex,
                                      )
                                    }
                                  }}
                                  className={`${
                                    !cnslLog?.isOpen && 'cursor-pointer'
                                  } max-w-[100%] rounded-lg border-[1px] border-transparent bg-[#dbdbdb1e] px-[10px] py-[8px] hover:border-[#dbdbdb42]`}
                                >
                                  <div className="flex justify-between">
                                    <div>
                                      Contract {cnslLog?.contractName} deployed
                                    </div>
                                    <img
                                      alt="ethereum avatar"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const newContracts = [
                                          ...blockchainContracts,
                                        ]
                                        const cntIndex =
                                          getContractSelectedIndex()
                                        newContracts[cntIndex].consoleLogs[
                                          index
                                        ].isOpen =
                                          !newContracts[cntIndex].consoleLogs[
                                            index
                                          ].isOpen
                                        setParamsToContracts(
                                          newContracts,
                                          cntIndex,
                                        )
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
                                          Address:{' '}
                                          {transformString(cnslLog?.desc, 8)}
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
                                              cnslLog.desc,
                                            )
                                            toast.success('Address copied')
                                          }}
                                        ></img>
                                      </div>
                                      <div className="mt-3 flex items-center gap-x-3">
                                        <div className="mt-[1px] text-[#c5c4c4]">
                                          Deployed at:{' '}
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
                              {cnslLog?.type === 'contractCall' && (
                                <div
                                  key={index}
                                  onClick={() => {
                                    if (!cnslLog?.isOpen) {
                                      const newContracts = [
                                        ...blockchainContracts,
                                      ]
                                      const cntIndex =
                                        getContractSelectedIndex()
                                      newContracts[cntIndex].consoleLogs[
                                        index
                                      ].isOpen =
                                        !newContracts[cntIndex].consoleLogs[
                                          index
                                        ].isOpen
                                      setParamsToContracts(
                                        newContracts,
                                        cntIndex,
                                      )
                                    }
                                  }}
                                  className={`${
                                    !cnslLog?.isOpen && 'cursor-pointer'
                                  } max-w-[100%] rounded-lg border-[1px] border-transparent bg-[#dbdbdb1e] px-[10px] py-[8px] hover:border-[#dbdbdb42]`}
                                >
                                  <div className="flex  justify-between gap-x-[20px]">
                                    <div
                                      className={`${
                                        !cnslLog?.isOpen
                                          ? 'line-clamp-2'
                                          : ' max-w-[90%]'
                                      }`}
                                    >
                                      {cnslLog?.functionName}(
                                      {cnslLog?.args.join(', ')}) {'-->'}{' '}
                                      {JSON.stringify(cnslLog?.responseValue)}
                                    </div>
                                    <img
                                      alt="ethereum avatar"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const newContracts = [
                                          ...blockchainContracts,
                                        ]
                                        const cntIndex =
                                          getContractSelectedIndex()
                                        newContracts[cntIndex].consoleLogs[
                                          index
                                        ].isOpen =
                                          !newContracts[cntIndex].consoleLogs[
                                            index
                                          ].isOpen
                                        setParamsToContracts(
                                          newContracts,
                                          cntIndex,
                                        )
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
                                          Address:{' '}
                                          {transformString(cnslLog?.desc, 8)}
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
                                              cnslLog.desc,
                                            )
                                            toast.success('Address copied')
                                          }}
                                        ></img>
                                      </div>
                                      <div className="mt-3 flex items-center gap-x-3">
                                        <div className="mt-[1px] text-[#c5c4c4]">
                                          Called at:{' '}
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
                            </div>
                          ),
                        )}
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
                      newContract.consoleLogs = []
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
