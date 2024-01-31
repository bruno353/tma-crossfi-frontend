import { UserProps } from './user'

export interface ICPCanisterProps {
  id: string
  url: string
  canisterId: string
  typeTemplate: string
  workspaceId: string
  blockchainAppId: string
  createdAt: string
  updatedAt: string
}

export interface ICPWalletsProps {
  id: string
  name: string
  walletId: string
  balance: string
  blockchainWalletId: string
  createdAt: string
  updatedAt: string
}

export interface BlockchainWalletProps {
  id: string
  icpWalletId: string
  icpWalletPubKId: string
  icpWalletPubKPrincipal: string
  balance: string
  name: string
  network: string
  workspaceId: string
  ICPWallets: ICPWalletsProps[]
  createdAt: string
  updatedAt: string
}

export interface BlockchainAppProps {
  id: string
  name: string
  network: string
  ICPCanister: ICPCanisterProps[]
  createdAt: string
  updatedAt: string
}
