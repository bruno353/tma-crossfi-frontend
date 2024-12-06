export enum TelegramAppType {
  GAME = 'GAME',
  UTILITY = 'UTILITY',
  WEB3 = 'WEB3',
}

enum TelegramChain {
  CROSSFI = 'CROSSFI',
}

export interface TelegramAppProps {
  id: string
  name: string
  desc: string
  logoUrl: string
  telegramUrl: string
  chain: TelegramChain
  category: TelegramAppType
  subcategories: string[]
}

export interface TelegramWalletProps {
  id: string
  name: string
  address: string
  chain: TelegramChain
  createdAt: string
  updatedAt: string
  usdBalance: string
}
