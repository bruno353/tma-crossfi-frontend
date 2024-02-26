// export interface LLMInstanceProps {
//   id: string
//   url: string
//   name: string
//   typeTemplate: string
//   workspaceId: string
//   llmAppId: string
//   // eslint-disable-next-line no-use-before-define
//   llmApp: LLMAppProps
//   createdAt: string
//   updatedAt: string

import { ICPWalletsProps } from './blockchain-app'

// }
enum NodeActionWorkflowType {
  CALL_CANISTER,
}
enum NodeTriggerWorkflowType {
  CRON,
}

export interface NodeTriggerWorkflowProps {
  id: string
  type: NodeTriggerWorkflowType
  value: string
  workflowId: string
  createdAt: string
  updatedAt: string
}

export interface NodeActionWorkflowProps {
  id: any
  type: NodeActionWorkflowType
  value: string
  workflowId: string
  createdAt: string
  updatedAt: string
}

export interface AutomationWorkflowProps {
  id: string
  name: string
  nodeTriggerWorkflow?: NodeTriggerWorkflowProps
  nodeActionWorkflow: NodeActionWorkflowProps[] | []
  nodesActionPosition: string[]
  icpWallets: ICPWalletsProps[]
  createdAt: string
  updatedAt: string
}
