export enum TelegramAppType {
  GAME = 'GAME',
  UTILITY = 'UTILITY',
  WEB3 = 'WEB3',
}

enum TelegramChain {
  CROSSFI = 'CROSSFI',
}

export interface TelegramAppProps {
  name: string
  logoUrl: string
  telegramUrl: string
  chain: TelegramChain
  category: TelegramAppType
  subcategories: string
}
