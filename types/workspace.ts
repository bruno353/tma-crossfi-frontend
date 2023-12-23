import { UserProps } from './user'

export interface UserWorkspaceProps {
  id: string
  workspaceId: string
  userId: string
  user: UserProps
  role: string
  createdAt: string
  updatedAt: string
}

export interface WorkspaceProps {
  id: string
  name: string
  logoURL?: string
  finalURL?: string
  createdAt: string
  updatedAt: string
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
