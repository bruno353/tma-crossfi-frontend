import { UserWorkspaceProps } from './workspace'

export interface MessageProps {
  id: string
  content: string
  fileUrl: string
  userWorkspaceId: boolean
  channelId: any
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface ChannelProps {
  id: string
  name: string
  type: string
  isPrivate: boolean
  messages: MessageProps[]
  generalUsersWorkspace: UserWorkspaceProps[]
  createdAt: string
  updatedAt: string
}
