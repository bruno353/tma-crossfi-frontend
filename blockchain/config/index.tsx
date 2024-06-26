import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage, http } from 'wagmi'
import { mainnet, bscTestnet, sepolia } from 'wagmi/chains'

export const projectId = 'a8a94eaa29bf7b1d3a0d94172c58e6ac'

const crossfiTestnet = {
  id: 4157,
  name: 'CrossFi Testnet',
  network: 'crossfi',
  nativeCurrency: {
    name: 'XFI',
    symbol: 'XFI',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.ms'],
    },
    public: {
      http: ['https://rpc.testnet.ms'],
    },
  },
  blockExplorers: {
    default: { name: 'CrossfiScan', url: 'https://scan.testnet.ms' },
  },
  testnet: true,
}

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

export const wagmiConfig = defaultWagmiConfig({
  chains: [mainnet, sepolia, bscTestnet, crossfiTestnet], // required
  projectId, // required
  metadata, // required
  ssr: true,
  transports: {
    [crossfiTestnet.id]: http('https://rpc.testnet.ms'),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  enableWalletConnect: true, // Optional - true by default
  enableInjected: true, // Optional - true by default
  enableEIP6963: true, // Optional - true by default
  enableCoinbase: true, // Optional - true by default
})
