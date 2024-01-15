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
  newMessageFromUser: boolean
  conversationId: string
  newMessageFromOtherUser: boolean
  userWorkspaceId: string
  userWorkspace: UserWorkspaceProps
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface NewChannelMessageProps {
  workspaceId: string
  channelId: string
  message: MessageProps // Message type
  isPrivate: boolean
}

export interface NewConversationMessageProps {
  workspaceId: string
  directMessageId: string
  secondMemberUserWorkspaceId: string
  message: DirectMessageProps // Message type
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
  tokenLiveKit?: string // Only for video or audio channels - tokenLiveKit
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
