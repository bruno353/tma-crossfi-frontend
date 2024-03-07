import { UserProps } from './user'

export enum WorkspaceType {
  DEVELOPMENT = 'DEVELOPMENT',
  FINANCIAL = 'FINANCIAL',
}

export interface UserWorkspaceProps {
  id: string
  workspaceId: string
  userId: string
  user: UserProps
  role: string
  workspace: any
  createdAt: string
  updatedAt: string
}

export interface WorkspaceProps {
  id: string
  name: string
  logoURL?: string
  finalURL?: string
  type: WorkspaceType
  createdAt: string
  updatedAt: string
  icpWalletPubKPrincipal: string
  icpWalletPubKId: string
  icpAccountBalance: string
  UserWorkspace: UserWorkspaceProps[]
  isUserAdmin: boolean
}

export interface WorkspaceInviteProps {
  id: string
  workspaceId: string
  accepted: boolean
  viewed: boolean
  role: string
  workspace: WorkspaceProps
  createdAt: string
  updatedAt: string
  user: UserProps
}
