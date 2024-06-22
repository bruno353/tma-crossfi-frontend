/* eslint-disable @next/next/no-img-element */
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import { parseCookies } from 'nookies'
import { deleteMessage } from '@/utils/api'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { CHAIN_SPECS } from '@/types/consts/ide'
import { NetworkIDE } from '@/types/blockchain-app'

export interface MenuI {
  onUpdateM(value: NetworkIDE): void
}

const SelectChainModal = ({ onUpdateM }: MenuI) => {
  const [isLoading, setIsLoading] = useState(false)

  const chains = Object.entries(CHAIN_SPECS)

  return (
    <>
      <div className="h-full w-[180px] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] pb-2 text-[14px] font-normal text-[#c5c4c4]">
        <div className="my-[7px] h-[1px] w-full bg-[#33323e]"></div>
        <div className="max-h-[250px] overflow-y-auto pr-3 scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
          {chains.map(([chain, specs], index) => (
            <div
              onClick={() => {
                onUpdateM(specs.value)
              }}
              key={index}
              className="my-2 flex cursor-pointer gap-x-[5px] rounded-[5px] p-[5px] hover:bg-[#c5c5c510]"
            >
              <img
                alt="ethereum avatar"
                src={specs.imgSource}
                className={specs.imgStyle}
              ></img>
              <div className="font-medium">{specs.text}</div>
            </div>
          ))}
        </div>
        <div className="my-[7px] h-[0.5px] w-full bg-[#33323e]"></div>
      </div>
    </>
  )
}

export default SelectChainModal
