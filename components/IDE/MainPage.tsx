/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
// imports
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
  ContractInspectionInputsI,
  NetworkIDE,
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
  wait,
} from '@/utils/functions'
import Sidebar from './Modals/Sidebar'
import * as StellarSdk from '@stellar/stellar-sdk'
import NewCallFunctionModal from './Modals/CallFunctionModal'
import DeployContractModal from './Modals/DeployContractModal'
import ImportContractModal from './Modals/ImportContractModal'
import BotHelperModal from './Modals/BotHelperModal'
import {
  deployContractFreighter,
  transactionContractFreighter,
} from './Funcs/soroban-contract-deployer'
import {
  setAllowed,
  isAllowed,
  getUserInfo,
  getNetwork,
} from '@stellar/freighter-api'
import { nativeToScVal, Networks } from '@stellar/stellar-sdk'
import {
  CHAIN_TO_TEMPLATE,
  LANGUAGE_VERSIONS_CROSSFI,
  LANGUAGE_VERSIONS_STELLAR,
} from '@/types/consts/ide'
import ContractsABIRender from './Components/ContractsABIRender'

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

export const optionsNetworkToPassphrase = {
  TESTNET: Networks.TESTNET,
  MAINNET: Networks.PUBLIC,
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

export const optionsNetworkCrossfi = [
  {
    name: 'Testnet',
    value: 'Testnet',
  },
]

export const crossfiNetworkToRpc = {
  Testnet: 'https://tendermint-rpc.testnet.ms',
}

export const crossfiNetworkEVMToRpc = {
  Testnet: 'https://rpc.testnet.ms',
}

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
  const { workspace, user, ideChain, setIDEChain } = useContext(AccountContext)
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
    editor.deltaDecorations(decorationIds, [])
    setDecorationIds([])

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

  async function writeCode(
    cntIndex: number,
    finalV: string,
    contractId: string,
  ) {
    console.log('Chamando write code')
    if (cntIndex < 0 || cntIndex >= blockchainContracts?.length) {
      console.log('tem problema de index')
      return
    }

    let index = 0
    let textToBuild = ''

    const intervalId = setInterval(async () => {
      if (index < finalV?.length) {
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
        await wait(500)
        saveContract(contractId)
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

  useEffect(() => {
    async function run() {
      getContracts()
      getData('Testnet')
      if (ideChain === NetworkIDE.STELLAR) {
        setLanguage('rust')
      } else if (ideChain === NetworkIDE.CROSSFI) {
        setLanguage('sol')
      }
      setIsLoading(false)
    }
    run()
  }, [ideChain])

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
      contractId: blockchainContractSelected?.id,
      code: blockchainContractSelected?.code,
    }

    if (ideChain === NetworkIDE.STELLAR) {
      try {
        const res = await callAxiosBackend(
          'post',
          '/blockchain/functions/compileContract',
          userSessionToken,
          data,
        )
        const newContracts = [...blockchainContracts]
        const cntIndex = newContracts.findIndex(
          (cnt) => cnt.id === blockchainContractSelected?.id,
        )
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

        newContracts[cntIndex].consoleLogs = newContracts[
          cntIndex
        ].consoleLogs.filter((cntfilter) => {
          return cntfilter.type !== 'error' && cntfilter.type !== 'deployError'
        })

        setBlockchainContracts(newContracts)
        setBlockchainContractSelected(newContracts[cntIndex])
      } catch (err) {
        console.log(err)
        console.log('Error: ' + err.response.data.message)
        const out = extractAllErrorMessages(err.response.data.message)

        const newContracts = [...blockchainContracts]
        const cntIndex = newContracts.findIndex(
          (cnt) => cnt.id === blockchainContractSelected?.id,
        )

        newContracts[cntIndex].contractInspections = []
        newContracts[cntIndex].currentAddress = null
        newContracts[cntIndex].currentChain = null

        newContracts[cntIndex].consoleLogs =
          newContracts[cntIndex].consoleLogs ?? []

        newContracts[cntIndex].consoleLogs = newContracts[
          cntIndex
        ].consoleLogs.filter((cntfilter) => {
          return cntfilter.type !== 'error' && cntfilter.type !== 'deployError'
        })

        for (let i = 0; i < out?.length; i++) {
          let errorDescription = extractTextMessageSecondOcorrency(
            out[i],
            '\u001b[0m\r\n\u001b[0m',
            'Building',
          )
          let errorMessage = extractTextMessage(out[i], 'error[', '\n')
          errorMessage = convertAnsiToHtml(errorMessage)
          errorDescription = convertAnsiToHtml(errorDescription)

          let lineError = extractTextMessageAndRemoveItems(
            out[i],
            '[0m\r\n\u001b[0m\u001b[1m\u001b[38;5;12m',
            '\u001b[0m ',
          )
          lineError = Number(lineError)

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
    } else if (ideChain === NetworkIDE.CROSSFI) {
      try {
        const res = await callAxiosBackend(
          'post',
          '/blockchain/functions/compileContract',
          userSessionToken,
          data,
        )
        const newContracts = [...blockchainContracts]
        const cntIndex = newContracts.findIndex(
          (cnt) => cnt.id === blockchainContractSelected?.id,
        )
        newContracts[cntIndex].consoleLogs =
          newContracts[cntIndex].consoleLogs ?? []

        newContracts[cntIndex].contractABIs = res.contractABIs

        newContracts[cntIndex].consoleLogs.unshift({
          type: 'compile',
          contractName: blockchainContractSelected?.name,
          createdAt: String(new Date()),
        })

        newContracts[cntIndex].consoleLogs = newContracts[
          cntIndex
        ].consoleLogs.filter((cntfilter) => {
          return cntfilter.type !== 'error' && cntfilter.type !== 'deployError'
        })

        setBlockchainContracts(newContracts)
        setBlockchainContractSelected(newContracts[cntIndex])
      } catch (err) {
        console.log(err)
        console.log('Error: ' + err.response.data.message)
        const out = extractAllErrorMessages(err.response.data.message)

        const newContracts = [...blockchainContracts]
        const cntIndex = newContracts.findIndex(
          (cnt) => cnt.id === blockchainContractSelected?.id,
        )

        newContracts[cntIndex].contractInspections = []
        newContracts[cntIndex].currentAddress = null
        newContracts[cntIndex].currentChain = null

        newContracts[cntIndex].consoleLogs =
          newContracts[cntIndex].consoleLogs ?? []

        newContracts[cntIndex].consoleLogs = newContracts[
          cntIndex
        ].consoleLogs.filter((cntfilter) => {
          return cntfilter.type !== 'error' && cntfilter.type !== 'deployError'
        })

        for (let i = 0; i < out?.length; i++) {
          let errorDescription = extractTextMessageSecondOcorrency(
            out[i],
            '\u001b[0m\r\n\u001b[0m',
            'Building',
          )
          let errorMessage = extractTextMessage(out[i], 'error[', '\n')
          errorMessage = convertAnsiToHtml(errorMessage)
          errorDescription = convertAnsiToHtml(errorDescription)

          let lineError = extractTextMessageAndRemoveItems(
            out[i],
            '[0m\r\n\u001b[0m\u001b[1m\u001b[38;5;12m',
            '\u001b[0m ',
          )
          lineError = Number(lineError)

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
    }

    setIsLoadingCompilation(false)
  }

  async function deployContractSoroban() {
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
        newContracts[cntIndex].ideContractDeploymentHistories.unshift(
          res['history'],
        )

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
        const addressRes = await deployContractFreighter(
          contractWasmBuffer,
          selected.value.toUpperCase(),
          optionsNetworkToPassphrase[selected.value.toUpperCase()],
        )

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
  }

  // abiValue should be like: {"abi":[{"type":"function","name":"s_balances","inputs":[{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"stake","inputs":[{"name":"amount","type":"uint256","internalType":"uint256"},{"name":"token","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"stake2","inputs":[{"name":"amount","type":"uint256","internalType":"uint256"},{"name":"token","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"error","name":"TransferFailed","inputs":[]}],"bytecode":{"object":"0x6080604052348015600f57600080fd5b506102488061001f6000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80630bd314f3146100465780637acb775714610046578063ab32eb691461006e575b600080fd5b610059610054366004610181565b61009c565b60405190151581526020015b60405180910390f35b61008e61007c3660046101ad565b60006020819052908152604090205481565b604051908152602001610065565b336000908152602081905260408120805484919083906100bd9084906101cf565b90915550506040516323b872dd60e01b8152336004820152306024820152604481018490526000906001600160a01b038416906323b872dd906064016020604051808303816000875af1158015610118573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061013c91906101f0565b90508061015c576040516312171d8360e31b815260040160405180910390fd5b90505b92915050565b80356001600160a01b038116811461017c57600080fd5b919050565b6000806040838503121561019457600080fd5b823591506101a460208401610165565b90509250929050565b6000602082840312156101bf57600080fd5b6101c882610165565b9392505050565b8082018082111561015f57634e487b7160e01b600052601160045260246000fd5b60006020828403121561020257600080fd5b8151801515811461015c57600080fdfea2646970667358221220342c22510447cbfd64a4882fe969adfe36d875fe26e92f98e54d39b6e22c4f4764736f6c634300081a0033","sourceMap":"141:643:21:-:0;;;;;;;;;;;;;;;;;;;","linkReferences":{}},"deployedBytecode":{"object":"0x608060405234801561001057600080fd5b50600436106100415760003560e01c80630bd314f3146100465780637acb775714610046578063ab32eb691461006e575b600080fd5b610059610054366004610181565b61009c565b60405190151581526020015b60405180910390f35b61008e61007c3660046101ad565b60006020819052908152604090205481565b604051908152602001610065565b336000908152602081905260408120805484919083906100bd9084906101cf565b90915550506040516323b872dd60e01b8152336004820152306024820152604481018490526000906001600160a01b038416906323b872dd906064016020604051808303816000875af1158015610118573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061013c91906101f0565b90508061015c576040516312171d8360e31b815260040160405180910390fd5b90505b92915050565b80356001600160a01b038116811461017c57600080fd5b919050565b6000806040838503121561019457600080fd5b823591506101a460208401610165565b90509250929050565b6000602082840312156101bf57600080fd5b6101c882610165565b9392505050565b8082018082111561015f57634e487b7160e01b600052601160045260246000fd5b60006020828403121561020257600080fd5b8151801515811461015c57600080fdfea2646970667358221220342c22510447cbfd64a4882fe969adfe36d875fe26e92f98e54d39b6e22c4f4764736f6c634300081a0033","sourceMap":"141:643:21:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;508:274;;;;;;:::i;:::-;;:::i;:::-;;;616:14:22;;609:22;591:41;;579:2;564:18;508:274:21;;;;;;;;175:45;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;980:25:22;;;968:2;953:18;175:45:21;834:177:22;508:274:21;597:10;571:4;586:22;;;;;;;;;;:32;;612:6;;586:22;571:4;;586:32;;612:6;;586:32;:::i;:::-;;;;-1:-1:-1;;643:61:21;;-1:-1:-1;;;643:61:21;;670:10;643:61;;;1445:51:22;690:4:21;1512:18:22;;;1505:60;1581:18;;;1574:34;;;628:12:21;;-1:-1:-1;;;;;643:26:21;;;;;1418:18:22;;643:61:21;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;628:76;;719:7;714:37;;735:16;;-1:-1:-1;;;735:16:21;;;;;;;;;;;714:37;768:7;-1:-1:-1;508:274:21;;;;;:::o;14:173:22:-;82:20;;-1:-1:-1;;;;;131:31:22;;121:42;;111:70;;177:1;174;167:12;111:70;14:173;;;:::o;192:254::-;260:6;268;321:2;309:9;300:7;296:23;292:32;289:52;;;337:1;334;327:12;289:52;373:9;360:23;350:33;;402:38;436:2;425:9;421:18;402:38;:::i;:::-;392:48;;192:254;;;;;:::o;643:186::-;702:6;755:2;743:9;734:7;730:23;726:32;723:52;;;771:1;768;761:12;723:52;794:29;813:9;794:29;:::i;:::-;784:39;643:186;-1:-1:-1;;;643:186:22:o;1016:222::-;1081:9;;;1102:10;;;1099:133;;;1154:10;1149:3;1145:20;1142:1;1135:31;1189:4;1186:1;1179:15;1217:4;1214:1;1207:15;1619:277;1686:6;1739:2;1727:9;1718:7;1714:23;1710:32;1707:52;;;1755:1;1752;1745:12;1707:52;1787:9;1781:16;1840:5;1833:13;1826:21;1819:5;1816:32;1806:60;;1862:1;1859;1852:12","linkReferences":{}},"methodIdentifiers":{"s_balances(address)":"ab32eb69","stake(uint256,address)":"7acb7757","stake2(uint256,address)":"0bd314f3"},"rawMetadata":"{\"compiler\":{\"version\":\"0.8.26+commit.8a97fa7a\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[],\"name\":\"TransferFailed\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"s_balances\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"}],\"name\":\"stake\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"}],\"name\":\"stake2\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}],\"devdoc\":{\"kind\":\"dev\",\"methods\":{},\"version\":1},\"userdoc\":{\"kind\":\"user\",\"methods\":{},\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/Counter.sol\":\"StakeContract\"},\"evmVersion\":\"paris\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@openzeppelin/=lib/openzeppelin-contracts/\",\":@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/\",\":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/\",\":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/\",\":forge-std/=lib/forge-std/src/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/\"]},\"sources\":{\"lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol\":{\"keccak256\":\"0xc6a8ff0ea489379b61faa647490411b80102578440ab9d84e9a957cc12164e70\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://0ea104e577e63faea3b69c415637e99e755dcbf64c5833d7140c35a714d6d90c\",\"dweb:/ipfs/Qmau6x4Ns9XdyynRCNNp3RhLqijJjFm7z5fyZazfYFGYdq\"]},\"src/Counter.sol\":{\"keccak256\":\"0x781d8ef5e98b9f804e9766da61ee3fc5071b1784f867d55d9b03553ee9c7c511\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://242c990ec13156f4e1beb3b56f6486bcd87f0387d43c2a924fefc99127ff9e43\",\"dweb:/ipfs/QmfLybFw9s1VY2yUCovPPdhtmGikPvyhoFFTfeJnyzMT1M\"]}},\"version\":1}","metadata":{"compiler":{"version":"0.8.26+commit.8a97fa7a"},"language":"Solidity","output":{"abi":[{"inputs":[],"type":"error","name":"TransferFailed"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","name":"s_balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}]},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"token","type":"address"}],"stateMutability":"nonpayable","type":"function","name":"stake","outputs":[{"internalType":"bool","name":"","type":"bool"}]},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"token","type":"address"}],"stateMutability":"nonpayable","type":"function","name":"stake2","outputs":[{"internalType":"bool","name":"","type":"bool"}]}],"devdoc":{"kind":"dev","methods":{},"version":1},"userdoc":{"kind":"user","methods":{},"version":1}},"settings":{"remappings":["@openzeppelin/=lib/openzeppelin-contracts/","@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/","ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/","erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/","forge-std/=lib/forge-std/src/","openzeppelin-contracts/=lib/openzeppelin-contracts/"],"optimizer":{"enabled":true,"runs":200},"metadata":{"bytecodeHash":"ipfs"},"compilationTarget":{"src/Counter.sol":"StakeContract"},"evmVersion":"paris","libraries":{}},"sources":{"lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol":{"keccak256":"0xc6a8ff0ea489379b61faa647490411b80102578440ab9d84e9a957cc12164e70","urls":["bzz-raw://0ea104e577e63faea3b69c415637e99e755dcbf64c5833d7140c35a714d6d90c","dweb:/ipfs/Qmau6x4Ns9XdyynRCNNp3RhLqijJjFm7z5fyZazfYFGYdq"],"license":"MIT"},"src/Counter.sol":{"keccak256":"0x781d8ef5e98b9f804e9766da61ee3fc5071b1784f867d55d9b03553ee9c7c511","urls":["bzz-raw://242c990ec13156f4e1beb3b56f6486bcd87f0387d43c2a924fefc99127ff9e43","dweb:/ipfs/QmfLybFw9s1VY2yUCovPPdhtmGikPvyhoFFTfeJnyzMT1M"],"license":"MIT"}},"version":1},"id":21}
  function abiToContractInspection(abiValue: any) {
    const parsedAbiValue = JSON.parse(JSON.parse(abiValue))
    const contractInspections: ContractInspectionI[] = []

    const functions: any = parsedAbiValue.abi

    console.log('abi value')
    console.log(parsedAbiValue)

    console.log('functions abi')
    console.log(functions)

    if (!Array.isArray(functions)) {
      console.log('its not an array')
      return
    }

    for (let i = 0; i < functions?.length; i++) {
      if (functions[i]['type'] === 'function') {
        const functionInputs: ContractInspectionInputsI[] = []
        for (let j = 0; j < functions[i]['inputs']?.length; j++) {
          functionInputs.push({
            name: functions[i]['inputs'][j]['name'],
            type: functions[i]['inputs'][j]['type'],
          })
        }
        contractInspections.push({
          functionName: functions[i]['name'],
          inputs: functionInputs,
          outputsArray: [],
          stateMutability: functions[i]['stateMutability'],
        })
      }
    }

    return contractInspections
  }

  async function deployContractCrossfi(contractABIName: string) {
    const chain = selected.value
    const { userSessionToken } = parseCookies()

    if (walletProvider === TypeWalletProvider.ACCELAR) {
      const data = {
        walletId: blockchainWalletsSelected.value,
        contractId: blockchainContractSelected?.id,
        environment: selected.value.toLowerCase(),
        abiName: contractABIName,
      }

      try {
        const res = await callAxiosBackend(
          'post',
          '/blockchain/functions/deployCrossfiContract',
          userSessionToken,
          data,
        )
        console.log('response da api')
        console.log(res)
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
        newContracts[cntIndex].ideContractDeploymentHistories.unshift(
          res['history'],
        )

        const insp = abiToContractInspection(
          blockchainContractSelected?.contractABIs?.find(
            (cntABI) => cntABI?.name === contractABIName,
          )?.content,
        )
        newContracts[cntIndex].contractInspections = insp

        console.log('the contrac inspections')
        console.log(insp)

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
        const addressRes = await deployContractFreighter(
          contractWasmBuffer,
          selected.value.toUpperCase(),
          optionsNetworkToPassphrase[selected.value.toUpperCase()],
        )

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
  }

  async function deployContract(contractABIName?: string) {
    setOpenModalDeploy(false)
    setIsLoadingCompilation(true)

    if (ideChain === NetworkIDE.STELLAR) {
      await deployContractSoroban()
    } else if (ideChain === NetworkIDE.CROSSFI) {
      await deployContractCrossfi(contractABIName)
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

    if (ideChain === NetworkIDE.STELLAR) {
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
        for (let i = 0; i < res?.length; i++) {
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
    } else if (ideChain === NetworkIDE.CROSSFI) {
      let rpc = ''
      if (environment === 'Testnet') {
        rpc = '&evmCrossfiRPC=https://rpc.testnet.ms'
      }

      try {
        const res = await callAxiosBackend(
          'get',
          `/blockchain/functions/getWorkspaceWallets?id=${id}&network=CROSSFI${rpc}`,
          userSessionToken,
        )
        const walletsToSet = []
        for (let i = 0; i < res?.length; i++) {
          walletsToSet.push({
            name: transformString(res[i].evmCrossfiWalletPubK, 5),
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
        `/blockchain/functions/getContracts?id=${id}&network=${ideChain}`,
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
      network: ideChain,
      code: CHAIN_TO_TEMPLATE[ideChain],
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
      setLanguage('javascript')
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
        }, 1000)
      }
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
      setBlockchainContractSelected(newCnts[cntIndex])
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
    setLanguage('loading')
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
    console.log('save contract was called')
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

  function walletToReturn() {
    if (walletProvider !== TypeWalletProvider.ACCELAR) {
      return '0x'
    }

    if (ideChain === NetworkIDE.STELLAR) {
      const wallet = blockchainWallets.find(
        (obj) => obj.id === blockchainWalletsSelected.value,
      )?.stellarWalletPubK
      return wallet
    } else if (ideChain === NetworkIDE.CROSSFI) {
      const wallet = blockchainWallets.find(
        (obj) => obj.id === blockchainWalletsSelected.value,
      )?.evmCrossfiWalletPubK
      return wallet
    }
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
                      <div className="max-w-[200px] overflow-x-auto whitespace-nowrap">
                        {blockchainContractSelected?.name}
                      </div>
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
                            LANGUAGE_VERSIONS={
                              ideChain === NetworkIDE.STELLAR
                                ? LANGUAGE_VERSIONS_STELLAR
                                : LANGUAGE_VERSIONS_CROSSFI
                            }
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
                            !blockchainWalletsSelected &&
                            publickey === 'Wallet not Connected..'
                          ) {
                            toast.error('Connect a wallet to continue')
                            return
                          }
                          if (
                            blockchainContractSelected?.contractInspections
                              ?.length > 0 ||
                            blockchainContractSelected?.contractABIs?.length > 0
                          ) {
                            setOpenModalDeploy(true)
                          }
                        }}
                        className={`${
                          isLoading || isLoadingCompilation
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] ${
                          !blockchainContractSelected?.contractInspections &&
                          !blockchainContractSelected?.contractABIs &&
                          '!cursor-default !bg-[#35428a77] !text-[#ffffffab]'
                        }`}
                      >
                        Deploy
                      </div>

                      <div
                        onClick={() => {
                          if (
                            !blockchainWalletsSelected &&
                            publickey === 'Wallet not Connected..'
                          ) {
                            toast.error('Connect a wallet to continue')
                            return
                          }
                          if (
                            blockchainContractSelected?.contractInspections
                              ?.length > 0 ||
                            blockchainContractSelected?.contractABIs?.length > 0
                          ) {
                            setOpenModalImport(true)
                          }
                        }}
                        className={`${
                          isLoading || isLoadingCompilation
                            ? 'animate-pulse !bg-[#35428a]'
                            : 'cursor-pointer  hover:bg-[#35428a]'
                        }  w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] ${
                          !blockchainContractSelected?.contractInspections &&
                          !blockchainContractSelected?.contractABIs &&
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
                      onUpdateM={(value) => {
                        deployContract(value)
                      }}
                      onClose={() => {
                        setOpenModalDeploy(false)
                      }}
                      contract={blockchainContractSelected}
                      environment={selected.value}
                      wallet={walletToReturn()}
                      walletFreighter={connect}
                      walletProvider={walletProvider}
                      walletBalance={
                        blockchainWallets.find(
                          (obj) => obj.id === blockchainWalletsSelected.value,
                        )?.balance || '0'
                      }
                      contractABIs={blockchainContractSelected?.contractABIs}
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
                      onUpdateM={async (response, contractId) => {
                        console.log('Chamando on update bot')
                        const finalV = getValueBetweenStrings(
                          response,
                          '```rust\n',
                          '```',
                        )
                        const newContracts = [...blockchainContracts]
                        const cntIndex = newContracts.findIndex(
                          (cnt) => cnt.id === contractId,
                        )
                        setOpenModalBotHelper(false)
                        await writeCode(cntIndex, finalV, contractId)
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
                    <div
                      className={`h-[40vh] w-full overflow-y-auto rounded-xl bg-[#1D2144] px-4 py-4 scrollbar-thin   scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:h-[40.5vh] ${
                        !openConsole && '!h-full 2xl:!h-full'
                      }`}
                    >
                      <div className="grid justify-between gap-y-2 2xl:flex">
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
                      <div className="mt-[10px] grid gap-y-[12px] 2xl:mt-[20px]">
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
                                      onClick={async () => {
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
                                          if (
                                            walletProvider ===
                                              TypeWalletProvider?.ACCELAR &&
                                            blockchainWalletsSelected
                                          ) {
                                            const finalCntInsInput = []

                                            for (
                                              let i = 0;
                                              i < cntIns?.inputs?.length;
                                              i++
                                            ) {
                                              finalCntInsInput.push({
                                                paramName:
                                                  cntIns?.inputs[i].name,
                                                value: cntIns?.inputs[i].value,
                                              })
                                            }
                                            callContract(
                                              cntIns?.functionName,
                                              finalCntInsInput,
                                            )
                                          } else if (
                                            walletProvider ===
                                              TypeWalletProvider?.FREIGHTER &&
                                            publickey
                                          ) {
                                            const contractId =
                                              blockchainContractSelected?.id
                                            const address =
                                              blockchainContractSelected?.currentAddress
                                            const finalValues = []
                                            const finalCntInsInput = []
                                            for (
                                              let i = 0;
                                              i < cntIns?.inputs?.length;
                                              i++
                                            ) {
                                              finalCntInsInput.push({
                                                paramName:
                                                  cntIns?.inputs[i].name,
                                                value: cntIns?.inputs[i].value,
                                              })
                                            }
                                            for (
                                              let i = 0;
                                              i < cntIns?.inputs?.length;
                                              i++
                                            ) {
                                              // se tipagem comecar com i ou u, significa que é i32 ou u64 por exemplo, dai botar  aprimeira letra pt amaisucula
                                              let type = cntIns?.inputs[i].type
                                              let value =
                                                cntIns?.inputs[i].value
                                              if (
                                                cntIns?.inputs[i].type?.charAt(
                                                  0,
                                                ) === 'U' ||
                                                cntIns?.inputs[i].type?.charAt(
                                                  0,
                                                ) === 'I'
                                              ) {
                                                type =
                                                  cntIns?.inputs[
                                                    i
                                                  ].type.toLowerCase()
                                                value = Number(
                                                  cntIns?.inputs[i].value,
                                                )
                                              }
                                              finalValues.push(
                                                nativeToScVal(value, {
                                                  type,
                                                }),
                                              )
                                            }
                                            const returnValue =
                                              await transactionContractFreighter(
                                                cntIns?.functionName,
                                                blockchainContractSelected?.currentAddress,
                                                selected.value.toUpperCase(),
                                                optionsNetworkToPassphrase[
                                                  selected.value.toUpperCase()
                                                ],
                                                finalValues,
                                              )
                                            const newContracts = [
                                              ...blockchainContracts,
                                            ]
                                            const cntIndex =
                                              newContracts.findIndex(
                                                (cnt) => cnt.id === contractId,
                                              )
                                            newContracts[
                                              cntIndex
                                            ].consoleLogs.unshift({
                                              type: 'contractCall',
                                              functionName:
                                                cntIns?.functionName,
                                              args: finalCntInsInput.map(
                                                (param) => param.value,
                                              ),
                                              responseValue:
                                                JSON.parse(returnValue),
                                              desc: address,
                                              createdAt: String(new Date()),
                                            })

                                            setBlockchainContracts(newContracts)
                                            setBlockchainContractSelected(
                                              newContracts[cntIndex],
                                            )
                                          }
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
                        {blockchainContractSelected?.contractABIs?.length >
                          0 && (
                          <div className="max-w-[100%] overflow-hidden">
                            <div className="mb-2 mt-3">ABIs</div>
                            <ContractsABIRender
                              blockchainContractSelected={
                                blockchainContractSelected
                              }
                              setBlockchainContractSelected={(value) => {
                                const newBlockchainContracts = [
                                  ...blockchainContracts,
                                ]
                                const cntIndex =
                                  newBlockchainContracts.findIndex(
                                    (cnt) => cnt.id === value.id,
                                  )
                                newBlockchainContracts[cntIndex] = value
                                setParamsToContracts(
                                  newBlockchainContracts,
                                  cntIndex,
                                )
                              }}
                            />
                          </div>
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
                    <div
                      className={`h-[40vh] w-full max-w-[400px] overflow-y-auto rounded-xl bg-[#1D2144] px-4 py-4 scrollbar-thin   scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:h-[40.5vh]  ${
                        !openContracts && '!h-full 2xl:!h-full'
                      }`}
                    >
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
                            <div
                              className="w-full max-w-[98%] 2xl:max-w-[70%]"
                              key={index}
                            >
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
                                      className={`ml-1 w-[12px] cursor-pointer rounded-full transition-transform duration-150 ${
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
                                      className={`ml-1 w-[12px] cursor-pointer rounded-full transition-transform duration-150 ${
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
                                      {cnslLog?.wasm && (
                                        <div className="flex items-center gap-x-3">
                                          <div className="mt-[1px] text-[#c5c4c4]">
                                            Wasm:{' '}
                                            {cnslLog?.wasm?.substring(0, 10) +
                                              '...' +
                                              cnslLog?.wasm?.slice(-10)}
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
                                                cnslLog?.wasm,
                                              )
                                              toast.success('Wasm copied')
                                            }}
                                          ></img>
                                        </div>
                                      )}
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
                      setBlockchainContractSelected(newContract)
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
