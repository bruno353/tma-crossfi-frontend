import { UserProps } from './user'
import { UserWorkspaceProps } from './workspace'

export interface ICPWalletsProps {
  id: string
  name: string
  walletId: string
  balance: string
  blockchainWalletId: string
  createdAt: string
  updatedAt: string
}

export interface ICPCanisterProps {
  id: string
  url: string
  name: string
  canisterId: string
  typeTemplate: string
  workspaceId: string
  blockchainAppId: string
  balance: string
  icpWallet: ICPWalletsProps
  // eslint-disable-next-line no-use-before-define
  blockchainApp: BlockchainAppProps
  createdAt: string
  updatedAt: string
}

export interface ConsoleError {
  type: 'error'
  errorDescription: string
  errorMessage: string
  lineError: number
  isOpen?: boolean
}

export interface ConsoleCompile {
  type: 'compile'
  contractName: string
  wasm?: string
  createdAt: string
  desc?: string
  isOpen?: boolean
}

export interface ConsoleContractCall {
  type: 'contractCall'
  functionName: string
  args: string[]
  responseValue: any
  createdAt: string
  stateMutability?: string // this is for abi of evm contracts: view; nonpayable; payable
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
  renderHTML?: boolean
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
  name?: string
  type?: string
  value?: any
}

export interface ContractInspectionI {
  functionName: string
  inputs: ContractInspectionInputsI[]
  outputsArray: string[]
  stateMutability?: string // this is for abi of evm contracts: view; nonpayable; payable
  payableValue?: string // if its a payable function
  transactError?: boolean
  isOpen?: boolean
  docs?: string
}

export interface ABIConstructorI {
  name: string
  type: string
  value?: any
}

export interface ContractABII {
  name: string
  content: any
  isOpen?: boolean
  constructor?: ABIConstructorI[]
}

export interface BlockchainWalletProps {
  id: string
  icpWalletId: string
  icpWalletPubKId: string
  icpWalletPubKPrincipal: string
  stellarWalletPubK: string
  stellarWalletPrivK: string
  fraxtalWalletPubK: string
  crossfiWalletPubK: string
  evmWalletPubK: string
  evmCrossfiWalletPubK: string
  balance: string
  name: string
  network: string
  workspaceId: string
  ICPWallets: ICPWalletsProps[]
  createdAt: string
  updatedAt: string
}

export enum NetworkIDE {
  STELLAR = 'STELLAR',
  CROSSFI = 'CROSSFI',
  EDUCHAIN = 'EDUCHAIN',
}

export interface BlockchainAppProps {
  id: string
  name: string
  network: string
  ICPCanister: ICPCanisterProps[]
  icpWallets: ICPWalletsProps[]
  createdAt: string
  updatedAt: string
}

export interface BlockchainContractDeploymentHistoryProps {
  id: string
  contractAddress?: string
  chain?: string
  ideContractId?: string
  userWorkspaceId?: string
  userWorkspace?: UserWorkspaceProps
  createdAt?: string
  updatedAt?: string
}

export interface BlockchainContractProps {
  id: string | undefined
  name?: string
  network: string
  code?: string
  wasm?: any
  currentAddress?: string
  currentChain?: string
  currentContractABIName?: string
  ideContractDeploymentHistories: BlockchainContractDeploymentHistoryProps[]
  consoleLogs: ConsoleLog[]
  contractInspections?: ContractInspectionI[] // Soroban inspetions
  contractABIs?: ContractABII[] // EVM abis
  createdAt?: string
  updatedAt?: string
}
