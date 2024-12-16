import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X, Copy, ArrowUpRight } from 'lucide-react'
import { toast } from 'react-toastify'
import { SmileySad } from 'phosphor-react'

// Tipos para as transações
interface Transaction {
  txhash: string
  timestamp: string
  logs: any
  isEVM: boolean
  body?: {
    messages: Array<{
      '@type': string
      data?: {
        value: string
      }
    }>
  }
}

const HistorySheet = ({ isOpen, onClose, userAddress }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const sheetRef = useRef(null)
  const dragRef = useRef(null)
  const dragStartY = useRef(0)
  const currentY = useRef(0)

  const observerTarget = useRef(null)

  // Funções de drag (igual ao SendTokenSheet)
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)'
      sheetRef.current.style.transition = 'transform 0.3s ease-out'
      sheetRef.current.style.animation = 'slideUp 0.3s ease-out'
      currentY.current = 0
      dragStartY.current = 0
    }
  }, [isOpen])

  const handleDragStart = (e) => {
    dragStartY.current = e.touches[0].clientY
    currentY.current = 0
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none'
      sheetRef.current.style.animation = 'none'
    }
  }

  const handleDrag = (e) => {
    if (!dragStartY.current) return
    const delta = e.touches[0].clientY - dragStartY.current
    if (delta < 0) return
    currentY.current = delta
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`
    }
  }

  const handleDragEnd = () => {
    if (currentY.current > 150) {
      onClose()
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)'
      sheetRef.current.style.transition = 'transform 0.3s ease-out'
    }
    dragStartY.current = 0
  }

  const fetchTransactions = async (page: number) => {
    console.log('fetching transactions')
    try {
      const response = await fetch(
        `https://xfiscan.com/api/1.0/txs?address=mx1l406j5nhr3tnrw5wgl4n27zmec5jny2spxzzh4&page=${page}&limit=20`,
      )
      const data = await response.json()

      if (data.docs?.length < 20) {
        console.log('setando como false')
        setHasMore(false)
      }
      console.log('passei fetch data docs')

      return data.docs || []
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transaction history')
      return []
    }
  }

  const scrollContainerRef = useRef(null)

  // Função para carregar mais transações
  const loadMoreTransactions = useCallback(async () => {
    console.log('loading more transactions')
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const nextPage = currentPage + 1
    const newTransactions = await fetchTransactions(nextPage)

    setTransactions((prev) => [...prev, ...newTransactions])
    setCurrentPage(nextPage)
    setIsLoadingMore(false)
  }, [currentPage, hasMore, isLoadingMore])

  // Carregar transações iniciais
  useEffect(() => {
    const initialLoad = async () => {
      if (!isOpen || !userAddress) return

      setIsLoading(true)
      const initialTransactions = await fetchTransactions(1)
      setTransactions(initialTransactions)
      setIsLoading(false)
    }

    initialLoad()
  }, [isOpen, userAddress])

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateClassic = (timestamp: string) => {
    const date = new Date(timestamp)

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${day}/${month}/${year} - ${hours}:${minutes}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  function formatTokenAmount(amountStr: string): string {
    // Se tiver múltiplos tokens (separados por vírgula)
    const amounts = amountStr.split(',')

    // Procura pelo valor em XFI
    const xfiAmount = amounts.find((amount) =>
      amount.toLowerCase().includes('xfi'),
    )

    if (!xfiAmount) return '0'

    // Remove o 'xfi' ou 'XFI' do final e converte para número
    const rawAmount = xfiAmount.replace(/xfi$/i, '').trim()
    // Converte de wei (18 casas decimais) para XFI
    const amount = Number(rawAmount) / Math.pow(10, 18)

    // Formata com 2 casas decimais
    return amount.toFixed(5)
  }

  if (!isOpen) return null

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={sheetRef}
        className="animate-slide-up fixed bottom-0 left-0 right-0 h-[82vh] rounded-t-[20px] bg-[#1d2144] transition-transform duration-300 ease-out"
        style={{
          transform: currentY.current
            ? `translateY(${currentY.current}px)`
            : 'translateY(0)',
        }}
      >
        {/* Drag handle */}
        <div
          ref={dragRef}
          className="absolute left-0 right-0 top-0 h-14 cursor-grab"
          onTouchStart={handleDragStart}
          onTouchMove={handleDrag}
          onTouchEnd={handleDragEnd}
        >
          <div className="bg-gray-500/30 mx-auto mt-2 h-1.5 w-12 rounded-full" />
        </div>

        {/* Header fixo */}
        <div className="absolute left-0 right-0 top-0 z-10 bg-[#1d2144] px-6 pt-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Transactions</h3>
            <button
              onClick={onClose}
              className="text-gray-400 rounded-full p-2 hover:bg-white/10"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          ref={scrollContainerRef}
          className="scroll-content h-full overflow-y-auto" // Adicione px-6 aqui
          style={{ paddingTop: '100px' }}
          onScroll={(e) => {
            const target = e.target as HTMLDivElement
            const bottom =
              target.scrollHeight - target.scrollTop - target.clientHeight
            console.log('bottom distance:', bottom)

            if (bottom < 100 && !isLoadingMore && hasMore) {
              loadMoreTransactions()
            }
          }}
        >
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="px-6 pb-20">
              {' '}
              {/* Adicione pb-20 aqui */}
              {transactions?.length > 0 ? (
                <div className="space-y-4 pb-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.txhash}
                      className="rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
                    >
                      <div className="flex flex-col">
                        {/* Hash e tipo de tx à esquerda */}
                        <div className="flex justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(tx.txhash)}
                              className="text-gray-400 flex items-center gap-1 text-sm hover:text-white"
                            >
                              <span>
                                {tx.txhash.slice(0, 6)}...{tx.txhash.slice(-4)}
                              </span>
                              <Copy size={14} />
                            </button>
                          </div>
                          <div className="text-gray-400 text-xs">
                            {formatDateClassic(tx.timestamp)}
                          </div>
                        </div>

                        {/* Tipo de tx e valor à direita */}
                        <div className="mt-1 flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-white">
                              {formatTokenAmount(
                                tx.logs?.[0]?.events
                                  ?.find(
                                    (e) =>
                                      e.type === 'transfer' ||
                                      e.type === 'coin_received',
                                  )
                                  ?.attributes?.find(
                                    (attr) => attr.key === 'amount',
                                  )?.value || '0',
                              )}{' '}
                              XFI
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`rounded-lg px-2 py-1 text-xs font-medium ${
                            tx.body?.messages[0]?.['@type']?.includes(
                              'MsgMultiSend',
                            )
                              ? 'bg-purple/20 text-purple'
                              : tx.body?.messages[0]?.['@type']?.includes(
                                  'MsgEthereumTx',
                                )
                              ? 'bg-orange/20 text-orange-400'
                              : 'bg-grey/20 text-grey'
                          }`}
                        >
                          {(() => {
                            const messageType =
                              tx.body?.messages[0]?.['@type']
                                ?.split('.')
                                .pop()
                                ?.replace('Msg', '')
                                .toLowerCase() || 'transfer'

                            return messageType === 'withdrawdelegatoreward'
                              ? 'claim'
                              : messageType
                          })()}{' '}
                        </span>
                        <a
                          href={`https://xfiscan.com/tx/${tx.txhash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple hover:text-purple/20"
                        >
                          <ArrowUpRight size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mx-auto mt-10 w-fit items-center justify-center text-[15px] font-light">
                  <SmileySad
                    size={32}
                    className="text-blue-500 mx-auto  mb-2"
                  />
                  <span>No transactions found</span>
                </div>
              )}
            </div>
          )}
          {hasMore && (
            <div ref={observerTarget} className="mb-4 flex justify-center py-4">
              {isLoadingMore && (
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistorySheet
