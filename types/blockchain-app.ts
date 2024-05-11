import { UserProps } from './user'

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

export interface BlockchainWalletProps {
  id: string
  icpWalletId: string
  icpWalletPubKId: string
  icpWalletPubKPrincipal: string
  stellarWalletPubK: string
  stellarWalletPrivK: string
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
  icpWallets: ICPWalletsProps[]
  createdAt: string
  updatedAt: string
}
