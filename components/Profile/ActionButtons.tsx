import React, { useState } from 'react'
import { Send, Wallet, CreditCard, ScrollText } from 'lucide-react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SendTokenSheet from './SendTokenSheet'

const ActionButtons = ({ walletAddress }) => {
  const [showSendSheet, setShowSendSheet] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      toast.success('Address copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy address')
    }
  }

  return (
    <div className="my-6">
      <div className="flex justify-center gap-x-8">
        {/* Send Button */}
        <button
          onClick={() => setShowSendSheet(true)}
          className="text-gray-300 flex flex-col items-center gap-2 transition-colors hover:text-white"
        >
          <div className="rounded-xl bg-[#1d21448e] p-2 hover:bg-[#2a2f5a]">
            <Send size={20} />
          </div>
          <span className="text-xs">Send</span>
        </button>

        {/* Receive Button */}
        <button
          onClick={handleCopyAddress}
          className="text-gray-300 flex flex-col items-center gap-2 transition-colors hover:text-white"
        >
          <div className="rounded-xl bg-[#1d21448e] p-2 hover:bg-[#2a2f5a]">
            <Wallet size={20} />
          </div>
          <span className="text-xs">Receive</span>
        </button>

        {/* Buy Button */}
        <button
          onClick={() => setShowBuyModal(true)}
          className="text-gray-300 flex flex-col items-center gap-2 transition-colors hover:text-white"
        >
          <div className="rounded-xl bg-[#1d21448e] p-2 hover:bg-[#2a2f5a]">
            <CreditCard size={20} />
          </div>
          <span className="text-xs">Buy</span>
        </button>
        <button
          onClick={() => setShowBuyModal(true)}
          className="text-gray-300 flex flex-col items-center gap-2 transition-colors hover:text-white"
        >
          <div className="rounded-xl bg-[#1d21448e] p-2 hover:bg-[#2a2f5a]">
            <ScrollText size={20} />
          </div>
          <span className="text-xs">History</span>
        </button>
      </div>

      <SendTokenSheet
        isOpen={showSendSheet}
        onClose={() => setShowSendSheet(false)}
      />

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[90%] max-w-md rounded-2xl bg-[#1d2144] p-6">
            <h3 className="mb-4 text-xl font-bold">Buy Tokens</h3>
            {/* Add your buy form here */}
            <button
              onClick={() => setShowBuyModal(false)}
              className="mt-4 w-full rounded-lg bg-[#2a2f5a] py-2 hover:bg-[#363d6d]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActionButtons
