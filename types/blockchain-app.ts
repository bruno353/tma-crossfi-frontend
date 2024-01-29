import { UserProps } from './user'

export interface ICPCanisterProps {
  id: string
  url: string
  canisterId: string
  type: string
  workspaceId: string
  blockchainAppId: string
  createdAt: string
  updatedAt: string
}

export interface BlockchainWalletsProps {
  id: string
  icpWalletId: string
  icpWalletPubKId: string
  icpWalletPubKPrincipal: string
  name: string
  network: string
  workspaceId: string
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
