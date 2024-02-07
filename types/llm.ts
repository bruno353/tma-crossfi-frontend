export interface LLMInstanceProps {
  id: string
  url: string
  name: string
  typeTemplate: string
  workspaceId: string
  llmAppId: string
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
