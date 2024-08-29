/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext, useRef } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { AccountContext } from '@/contexts/AccountContext'
import { CHAIN_SPECS } from '@/types/consts/ide'
import SelectChainModal from '../Modals/SelectChain'

export interface ModalI {
  onUpdateM(): void
}

const ChainSelector = ({ onUpdateM }: ModalI) => {
  const [isLoading, setIsLoading] = useState(null)
  const [isChainSelectorOpen, setIsChainSelectorOpen] = useState<boolean>(false)

  const { ideChain, setIDEChain } = useContext(AccountContext)

  const menuRef = useRef(null)

  useEffect(() => {
    console.log(ideChain)
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsChainSelectorOpen(false)
      }
    }

    if (isChainSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isChainSelectorOpen])

  return (
    <div className="relative ">
      <div
        onClick={() => {
          setIsChainSelectorOpen(true)
        }}
        className="flex cursor-pointer justify-between gap-x-[5px] rounded-md px-[10px] py-[5px] hover:bg-[#dbdbdb1e] "
      >
        <div className="flex gap-x-[5px]">
          <img
            alt="ethereum avatar"
            src={CHAIN_SPECS[ideChain]?.imgSource}
            className={CHAIN_SPECS[ideChain]?.imgStyle}
          ></img>
          <div className="font-medium">{CHAIN_SPECS[ideChain]?.text}</div>
        </div>

        <img
          alt="ethereum avatar"
          src="/images/header/arrow.svg"
          className="w-[7px]"
        ></img>
      </div>

      {isChainSelectorOpen && (
        <div className="absolute top-[35px] !z-[999999]" ref={menuRef}>
          <SelectChainModal
            onUpdateM={(value) => {
              setIDEChain(value)
              setIsChainSelectorOpen(false)
            }}
          />{' '}
        </div>
      )}
    </div>
  )
}

export default ChainSelector
