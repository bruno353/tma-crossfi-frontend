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

export interface DirectMessageProps {
  id: string
  content: string
  userWorkspaceId: string
  userWorkspace: UserWorkspaceProps
  deleted: boolean
  createdAt: string
  updatedAt: string
  hasNewMessages: boolean // IF THE USER HAS NEW MESSAGES UNREAD
}

export interface NewChannelMessageProps {
  workspaceId: string
  channelId: string
  message: MessageProps // Message type
  isPrivate: boolean
}

export interface ChannelProps {
  id: string
  name: string
  type: string
  workspaceId: string
  isPrivate: boolean
  messages: MessageProps[]
  generalUsersWorkspace: UserWorkspaceProps[]
  createdAt: string
  updatedAt: string
  hasNewMessages: boolean // IF THE USER HAS NEW MESSAGES UNREAD
}

export interface ConversationProps {
  id: string
  userWorkspaceOneId: string
  userWorkspaceOne: UserWorkspaceProps
  userWorkspaceTwoId: string
  userWorkspaceTwo: UserWorkspaceProps
  directMessages: DirectMessageProps[]
  createdAt: string
  updatedAt: string
  hasNewMessages: boolean // IF THE USER HAS NEW MESSAGES UNREAD
}
