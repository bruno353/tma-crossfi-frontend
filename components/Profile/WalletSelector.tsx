import React, { useState } from 'react'
import { ChevronDown, Plus, Wallet } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const WalletSelector = ({ wallets, walletSelected, setWalletSelected }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {/* Dropdown Trigger */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="mt-2 flex w-full max-w-[280px] cursor-pointer items-center justify-between rounded-lg bg-[#1d2144] p-3 transition-all hover:bg-[#2a2f5a]"
      >
        <div className="flex items-center gap-2">
          <Wallet className="text-blue-400 h-5 w-5" />
          <div>
            <p className="text-gray-200 text-sm font-medium">
              {walletSelected?.name || 'Select Wallet'}
            </p>
            <p className="text-gray-400 text-xs">
              {walletSelected?.address?.slice(0, 6)}...
              {walletSelected?.address?.slice(-4)}
            </p>
          </div>
        </div>
        <ChevronDown className="text-gray-400 h-5 w-5" />
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0d1126] text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Wallet</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            {wallets?.map((wallet) => (
              <div
                key={wallet.address}
                onClick={() => {
                  setWalletSelected(wallet)
                  setIsModalOpen(false)
                }}
                className={`flex cursor-pointer items-center justify-between rounded-lg p-3 transition-all hover:bg-[#1d2144] ${
                  walletSelected?.address === wallet.address
                    ? 'bg-[#1d2144]'
                    : 'bg-[#141831]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wallet className="text-blue-400 h-5 w-5" />
                  <div>
                    <p className="font-medium">{wallet.name}</p>
                    <p className="text-gray-400 text-sm">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Wallet Button */}
            <button
              onClick={() => {
                // Implement new wallet creation logic
                console.log('Add new wallet')
              }}
              className="bg-blue-600 hover:bg-blue-700 flex w-full items-center gap-2 rounded-lg p-3 text-center transition-all"
            >
              <Plus className="h-5 w-5" />
              Add New Wallet
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WalletSelector
