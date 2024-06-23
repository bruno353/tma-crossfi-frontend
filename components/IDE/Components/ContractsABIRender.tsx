/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useEffect, useRef, useState, useContext } from 'react'
import Dropdown, { ValueObject } from '../../Modals/Dropdown'
import {
  BlockchainContractProps,
  BlockchainWalletProps,
} from '@/types/blockchain-app'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export interface MenuI {
  blockchainContractSelected: BlockchainContractProps
  setBlockchainContractSelected(value: BlockchainContractProps): void
}

const ContractsABIRender = ({
  blockchainContractSelected,
  setBlockchainContractSelected,
}: MenuI) => {
  return (
    <div className="">
      {blockchainContractSelected?.contractABIs?.map((cntABI, index) => (
        <div
          key={index}
          onClick={() => {
            if (!cntABI.isOpen) {
              const newBlockchainContractSelected = {
                ...blockchainContractSelected,
              }
              newBlockchainContractSelected.contractABIs[index].isOpen = true
              setBlockchainContractSelected(newBlockchainContractSelected)
            }
          }}
          className={`${
            !cntABI?.isOpen && 'cursor-pointer'
          } max-w-[100%] rounded-lg border-[1px] border-transparent bg-[#dbdbdb1e] px-[10px] py-[8px] hover:border-[#dbdbdb42]`}
        >
          <div className="flex justify-between">
            <div>{cntABI?.name}</div>
            <img
              alt="ethereum avatar"
              onClick={(e) => {
                e.stopPropagation()
                const newBlockchainContractSelected = {
                  ...blockchainContractSelected,
                }
                newBlockchainContractSelected.contractABIs[index].isOpen =
                  !newBlockchainContractSelected.contractABIs[index].isOpen
                setBlockchainContractSelected(newBlockchainContractSelected)
              }}
              src="/images/header/arrow-gray.svg"
              className={`w-[12px]  cursor-pointer rounded-full transition-transform duration-150 ${
                cntABI?.isOpen && 'rotate-180'
              }`}
            ></img>
          </div>
          {cntABI.isOpen && (
            <div className="mt-2 flex justify-between gap-x-4 px-2 ">
              <div className="line-clamp-3 max-w-[100%] overflow-hidden">
                {JSON.parse(cntABI?.content)}
              </div>
              <img
                // ref={editRef}
                alt="ethereum avatar"
                src="/images/workspace/copy.svg"
                className="w-[18px] cursor-pointer rounded-full"
                // onMouseEnter={() => setIsCopyInfoOpen(canister.id)}
                // onMouseLeave={() => setIsCopyInfoOpen(null)}
                onClick={(event) => {
                  event.stopPropagation()
                  navigator.clipboard.writeText(JSON.parse(cntABI?.content))
                  toast.success('ABI copied')
                }}
              ></img>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ContractsABIRender
