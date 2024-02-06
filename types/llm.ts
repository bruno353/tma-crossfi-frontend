export interface LLMInstance {
  id: string
  name: string
  url: string
  typeTemplate: string
  llmAppId: string
  createdAt: string
  updatedAt: string
}

export interface LLMAppProps {
  id: string
  name: string
  network: string
  llmInstances: LLMInstance[]
  createdAt: string
  updatedAt: string
}
