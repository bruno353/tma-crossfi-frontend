import { AutomationWorkflowProps } from '@/types/automation'
import { NetworkIDE } from '@/types/blockchain-app'
import { ChannelProps, ConversationProps } from '@/types/chat'
import { UserProps } from '@/types/user'
import { WorkspaceProps } from '@/types/workspace'
import React, { createContext, useState } from 'react'

interface CreateContextProps {
  children: React.ReactNode
}

interface CreateUserContextProps {
  user: UserProps | undefined
  setUser: (user: UserProps | undefined) => void

  channels: ChannelProps[] | undefined
  setChannels: (channels: ChannelProps[] | undefined) => void

  dm: ChannelProps | undefined
  setDm: (channels: ChannelProps | undefined) => void

  channel: ChannelProps | undefined
  setChannel: (channels: ChannelProps | undefined) => void

  conversation: ConversationProps | undefined
  setConversation: (conversation: ConversationProps | undefined) => void

  conversations: ConversationProps[] | undefined
  setConversations: (conversations: ConversationProps[] | undefined) => void

  automationWorkflowNodeSelected: string | undefined
  setAutomationWorkflowNodeSelected: (
    automationWorkflowNodeSelected: string | undefined,
  ) => void

  ideChain: NetworkIDE | undefined
  setIDEChain: (ideChain: NetworkIDE | undefined) => void

  automationWorkflowSelected: AutomationWorkflowProps | undefined
  setAutomationWorkflowSelected: (
    automationWorkflowSelected: AutomationWorkflowProps | undefined,
  ) => void

  nodeIsLoading: string | undefined
  setNodeIsLoading: (nodeIsLoading: string | undefined) => void

  nodeHasChange: string | undefined
  setNodeHasChange: (nodeHasChange: string | undefined) => void

  minimize: boolean | undefined
  setMinimize: (minimize: boolean | undefined) => void

  isDeployingNewDepinFeature: boolean | undefined
  setIsDeployingNewDepingFeature: (minimize: boolean | undefined) => void

  reactFlowEdges: any | undefined
  setReactFlowEdges: (reactFlowEdges: any | undefined) => void

  workspace: WorkspaceProps | undefined
  setWorkspace: (workspace: WorkspaceProps | undefined) => void
}

export const AccountContext = createContext({} as CreateUserContextProps)

export default function AccountContextProvider({
  children,
}: CreateContextProps) {
  const [user, setUser] = useState<UserProps>()
  const [channels, setChannels] = useState<ChannelProps[]>()
  const [minimize, setMinimize] = useState<boolean>(false)
  const [isDeployingNewDepinFeature, setIsDeployingNewDepingFeature] =
    useState<boolean>(false)
  const [channel, setChannel] = useState<ChannelProps>()
  const [conversation, setConversation] = useState<ConversationProps>()
  const [conversations, setConversations] = useState<ConversationProps[]>()
  const [automationWorkflowNodeSelected, setAutomationWorkflowNodeSelected] =
    useState<string>('')
  const [automationWorkflowSelected, setAutomationWorkflowSelected] =
    useState<AutomationWorkflowProps>()
  const [nodeIsLoading, setNodeIsLoading] = useState<string>('')
  const [nodeHasChange, setNodeHasChange] = useState<string>('')
  const [ideChain, setIDEChain] = useState<NetworkIDE>(NetworkIDE.STELLAR)

  const [reactFlowEdges, setReactFlowEdges] = useState<any>([])

  const [dm, setDm] = useState<ChannelProps>()
  const [workspace, setWorkspace] = useState<WorkspaceProps>()

  return (
    <AccountContext.Provider
      value={{
        user,
        setUser,
        isDeployingNewDepinFeature,
        setIsDeployingNewDepingFeature,
        ideChain,
        setIDEChain,
        nodeHasChange,
        setNodeHasChange,
        automationWorkflowSelected,
        setAutomationWorkflowSelected,
        minimize,
        setMinimize,
        dm,
        setDm,
        channel,
        setChannel,
        channels,
        setChannels,
        conversation,
        setConversation,
        conversations,
        setConversations,
        workspace,
        setWorkspace,
        automationWorkflowNodeSelected,
        setAutomationWorkflowNodeSelected,
        nodeIsLoading,
        setNodeIsLoading,
        reactFlowEdges,
        setReactFlowEdges,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}
