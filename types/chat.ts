import { UserWorkspaceProps } from './workspace'

export interface ChannelProps {
  id: string
  name: string
  type: string
  isPrivate: boolean
  messages: any
  generalUsersWorkspace: UserWorkspaceProps[]
  createdAt: string
  updatedAt: string
}
