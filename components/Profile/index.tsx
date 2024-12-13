'use client'
import { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { parseCookies } from 'nookies'
import { callAxiosBackend } from '@/utils/general-api'
import { TelegramWalletProps } from '@/types/telegram'
import { AccountContext } from '../../contexts/AccountContext'
import { ChevronDown, Plus, Wallet, ArrowLeft } from 'lucide-react'
import CreateWalletView from './CreateWalletView'
import {
  loadLocalWallets,
  mergeWallets,
  CombinedWallet,
} from './local-db/DbManager'
import { Sparklines, SparklinesLine } from 'react-sparklines'
import TokenCard from './TokenCard'
import TokenCarousel from './TokenCarousel'
import { fetchTokensData, TokenData } from './TokensData'
import ActionButtons from './ActionButtons'

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [combinedWallets, setCombinedWallets] = useState<CombinedWallet[]>([])
  const [selectedWallet, setSelectedWallet] = useState<CombinedWallet>()
  const [showWalletList, setShowWalletList] = useState(false)
  const [showCreateWallet, setShowCreateWallet] = useState(false)
  const [tokens, setTokens] = useState<TokenData[]>([])

  // const tokens = [
  //   {
  //     title: 'Crossfi',
  //     symbol: 'XFI',
  //     priceDif: -20,
  //     priceArray: [5, 10, 5, 20, 25, 18, 12, 5, 1, 20, 30, 50, 10, 15, 0],
  //   },
  //   {
  //     title: 'Bitcoin',
  //     symbol: 'BTC',
  //     priceDif: -20,
  //     priceArray: [5, 10, 5, 20, 25, 18, 12, 5, 1, 20, 30, 50, 10, 15, 0],
  //   },
  // ]

  const tokenToImg = {
    XFI: {
      imgSource: '/images/telegram/xfi.webp',
      imgStyle: 'w-[30px] p-1 bg-[#4766EA] rounded-full flex-0',
    },
    BTC: {
      imgSource: '/images/telegram/bitcoin.png',
      imgStyle: 'w-[30px] p-1 bg-[#4766EA] rounded-full flex-0',
    },
  }

  const { user } = useContext(AccountContext)
  const { push } = useRouter()

  async function getData() {
    setIsLoading(true)
    try {
      const [walletData, tokensData] = await Promise.all([
        Promise.all([
          loadLocalWallets(),
          callAxiosBackend(
            'get',
            `/telegram/wallets`,
            parseCookies().userSessionToken,
          ),
        ]),
        fetchTokensData(),
      ])

      const [localWallets, backendResponse] = walletData

      // Atualizar wallets
      const backendWallets = backendResponse.map((wallet) => ({
        address: wallet.address,
        isLocal: false,
      }))
      const merged = mergeWallets(localWallets, backendWallets)
      setCombinedWallets(merged)
      setSelectedWallet(merged[0])

      // Atualizar tokens
      setTokens(tokensData)
    } catch (err) {
      console.error(err)
      toast.error(
        `Error: ${err?.response?.data?.message || 'Failed to fetch data'}`,
      )
    }
    setIsLoading(false)
  }

  useEffect(() => {
    getData()
  }, [])

  if (isLoading) {
    return (
      <div className="container grid w-full gap-y-[30px] text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="h-20 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
        <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
      </div>
    )
  }

  if (showCreateWallet) {
    return (
      <section className="relative z-10 overflow-hidden px-[10px] pb-16 text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <CreateWalletView
          onWalletCreated={() => {
            setShowCreateWallet(false)
            getData() // Refresh wallet list after creation
          }}
        />
      </section>
    )
  }

  if (showWalletList) {
    return (
      <section className="relative z-10 overflow-hidden px-[10px] pb-16 text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="container text-[#fff]">
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={() => setShowWalletList(false)}
              className="rounded-full p-2 hover:bg-[#1d21448e]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2>Select your wallet</h2>
          </div>
          <div className="space-y-4">
            {combinedWallets.map((wallet, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedWallet(wallet)
                  setShowWalletList(false)
                }}
                className="mx-auto flex w-full max-w-[220px] cursor-pointer items-center justify-between rounded-lg bg-[#1d21448e] p-3 py-4 transition-all hover:bg-[#2a2f5a]"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      wallet.isLocal ? 'bg-[#4646e7]' : 'bg-[#46e746]'
                    }`}
                    style={{
                      boxShadow: wallet.isLocal
                        ? '0 0 8px #4646e7'
                        : '0 0 8px #46e746',
                    }}
                  />
                  <div>
                    <p className="text-gray-400 text-sm">
                      {wallet.address.slice(0, 6)}...
                      {wallet.address.slice(-4)}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {wallet.isLocal ? 'Local Wallet' : 'Custodial Wallet'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowCreateWallet(true)}
            className="text-blue-400 hover:text-blue-300 mx-auto mt-6 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create new wallet
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="relative z-10 overflow-hidden px-[10px] pb-16 text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
      <div className="container text-[#fff]">
        <div className="flex justify-between">
          <div>Hello, {user.telegramUsername}</div>
        </div>
        <div className="mt-10">
          <div>
            <div className="text-sm text-body-color">Balance</div>
            <div>USD </div>
          </div>
        </div>
        {selectedWallet && (
          <div
            onClick={() => setShowWalletList(true)}
            className="mx-auto mt-10 flex w-full max-w-[180px] cursor-pointer items-center justify-between rounded-lg bg-[#1d21448e] p-3 transition-all hover:bg-[#2a2f5a]"
          >
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  selectedWallet.isLocal ? 'bg-[#4646e7]' : 'bg-[#46e746]'
                }`}
                style={{
                  boxShadow: selectedWallet.isLocal
                    ? '0 0 8px #4646e7'
                    : '0 0 8px #46e746',
                }}
              />
              <div>
                <p className="text-gray-400 text-sm">
                  {selectedWallet.address.slice(0, 6)}...
                  {selectedWallet.address.slice(-4)}
                </p>
              </div>
            </div>
            <ChevronDown className="text-gray-400 h-5 w-5" />
          </div>
        )}
        <ActionButtons walletAddress={selectedWallet?.address || ''} />{' '}
        <div className="mt-10">
          <TokenCarousel>
            {tokens.map((token, index) => (
              <TokenCard
                key={index}
                name={token.title}
                symbol={token.symbol}
                price={token.currentPrice} // Add your actual price
                priceChange={token.priceDif}
                priceArray={token.priceArray}
                icon={tokenToImg[token.symbol]?.imgSource} // Add your icon path
              />
            ))}
          </TokenCarousel>
        </div>
      </div>
    </section>
  )
}

export default Profile
