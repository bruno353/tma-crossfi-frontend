export interface LLMInstanceProps {
  id: string
  url: string
  name: string
  typeTemplate: string
  workspaceId: string
  llmAppId: string
  // eslint-disable-next-line no-use-before-define
  llmApp: LLMAppProps
  createdAt: string
  updatedAt: string
}

export interface LLMAppProps {
  id: string
  name: string
  network: string
  llmInstances: LLMInstanceProps[]
  createdAt: string
  updatedAt: string
}
