import { UserWorkspaceProps } from './workspace'

export interface MessageProps {
  id: string
  content: string
  newMessageFromUser: boolean
  newMessageFromOtherUser: boolean
  fileUrl: string
  userWorkspaceId: boolean
  userWorkspace: UserWorkspaceProps
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
