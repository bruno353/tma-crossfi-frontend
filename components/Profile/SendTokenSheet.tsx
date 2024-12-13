import React, { useState, useRef, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'

const SendTokenSheet = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1)
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [recentAddresses] = useState(['0x1234...5678', '0x8765...4321'])

  const sheetRef = useRef(null)
  const dragRef = useRef(null)
  const dragStartY = useRef(0)
  const currentY = useRef(0)

  // No início do componente, adicione a lista de tokens disponíveis
  const availableTokens = [
    {
      name: 'Crossfi',
      symbol: 'XFI',
      image: '/images/telegram/xfi.webp',
      address: '0x123...', // Endereço do contrato, não mostrado no UI
    },
    // Adicione mais tokens conforme necessário
  ]

  // Adicione um estado para controlar a visibilidade do dropdown
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false)

  // Modifique a seleção de token para usar o objeto completo
  const [selectedToken, setSelectedToken] = useState(availableTokens[0])

  // E então modifique a seção de Token Selection para:

  // Adicione este useEffect
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)'
      sheetRef.current.style.transition = 'transform 0.3s ease-out'
      sheetRef.current.style.animation = 'slideUp 0.3s ease-out'
      currentY.current = 0
      dragStartY.current = 0
    }
  }, [isOpen])

  const handleClose = () => {
    setStep(1) // Reseta o step para a primeira tela
    onClose() // Fecha o modal
  }
  // Resto do código continua igual...

  const handleDragStart = (e) => {
    dragStartY.current = e.touches[0].clientY
    currentY.current = 0
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none'
      sheetRef.current.style.animation = 'none' // Remove a animação durante o drag
    }
  }

  const handleDrag = (e) => {
    if (!dragStartY.current) return
    const delta = e.touches[0].clientY - dragStartY.current
    if (delta < 0) return // Prevent dragging upwards
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

  if (!isOpen) return null

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
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

        {/* Content */}
        <div className="h-full overflow-y-auto px-6 pt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Send Tokens</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 rounded-full p-2 hover:bg-white/10"
            >
              <X size={24} />
            </button>
          </div>

          {step === 1 && (
            <div className="mt-6 space-y-6 pb-4">
              {/* Token Selection */}
              <div>
                <div
                  onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                  className="flex cursor-pointer items-center justify-between rounded-lg bg-white/5 px-4 py-1 hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedToken.image}
                      alt={selectedToken.symbol}
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <p className="text-white">{selectedToken.name}</p>
                      <p className="text-gray-400 text-sm">
                        {selectedToken.symbol}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`text-gray-400 transition-transform duration-200 ${
                      isTokenDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {/* Token Dropdown */}
                {isTokenDropdownOpen && (
                  <div className="absolute left-0 right-0 mx-6 mt-2 overflow-hidden rounded-lg bg-[#2a2f5a] shadow-lg">
                    <div className="max-h-[200px] overflow-y-auto">
                      {availableTokens.map((token) => (
                        <div
                          key={token.symbol}
                          onClick={() => {
                            setSelectedToken(token)
                            setIsTokenDropdownOpen(false)
                          }}
                          className={`flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors hover:bg-white/5 ${
                            selectedToken.symbol === token.symbol
                              ? 'bg-white/10'
                              : ''
                          }`}
                        >
                          <img
                            src={token.image}
                            alt={token.symbol}
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <p className="text-white">{token.name}</p>
                            <p className="text-gray-400 text-sm">
                              {token.symbol}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* To Address */}
              <div>
                <label className="text-gray-400 mb-2 block text-sm">To</label>
                <input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="Enter wallet address"
                  className="placeholder:text-gray-500 focus:ring-purple-500 w-full rounded-lg bg-white/5 px-4 py-2 text-white focus:outline-none focus:ring-2"
                />
                {/* Recent addresses */}
                {recentAddresses.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-gray-400 text-sm">Recent</p>
                    {recentAddresses.map((address) => (
                      <button
                        key={address}
                        onClick={() => setToAddress(address)}
                        className="text-gray-300 block w-full rounded-lg p-2 text-left text-sm hover:bg-white/5"
                      >
                        {address}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="text-gray-400 mb-2 block text-sm">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="placeholder:text-gray-500 focus:ring-purple-500 w-full rounded-lg bg-white/5 px-4 py-2 text-white focus:outline-none focus:ring-2"
                />
              </div>

              {/* Next Button */}
              <button
                onClick={() => setStep(2)}
                disabled={!toAddress || !amount}
                className="hover:bg-primary-dark mt-8 inline-block h-fit w-full rounded bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 space-y-6">
              {/* Confirmation details */}
              <div className="rounded-lg bg-white/5 p-4">
                <h4 className="text-lg font-medium text-white">
                  Transaction Details
                </h4>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">From</span>
                    <span className="text-white">Your Wallet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">To</span>
                    <span className="text-white">{toAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-white">{amount} XFI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Fee</span>
                    <span className="text-white">~0.001 ETH</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="border-purple-500 text-purple-500 w-1/2 rounded-lg border py-4"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    // Handle send transaction
                    console.log('Sending transaction...')
                  }}
                  className="from-purple-500 to-purple-700 w-1/2 rounded-lg bg-gradient-to-r py-4 text-white"
                >
                  Confirm Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SendTokenSheet
