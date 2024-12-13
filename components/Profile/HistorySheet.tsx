import React, { useState, useRef, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'

const HistorySheet = ({ isOpen, onClose }) => {
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
            <h3 className="text-2xl font-bold text-white">Wallet history</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 rounded-full p-2 hover:bg-white/10"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mt-6 space-y-6 pb-4">
            {/* Transactions */}
            <div className="mt-2 space-y-2">
              {recentAddresses.map((address) => (
                <button
                  key={address}
                  className="text-gray-300 block w-full rounded-lg p-2 text-left text-sm hover:bg-white/5"
                >
                  {address}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistorySheet
