export enum TypeDepinNetwork {
  FRAXTAL_MAINNET,
}

export enum TypeDepinStatus {
  QUEUE,
  LIVE,
  CLOSED,
}

export interface DepinDeploymentProps {
  id: string
  name?: string
  sdl?: string
  akashHash?: string
  tokenId?: string
  chainId?: string
  network?: TypeDepinNetwork
  depinFeature?: string
  status?: TypeDepinStatus
  workspaceId: string
  createdAt?: string
  updatedAt?: string
}
