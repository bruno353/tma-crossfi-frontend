'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import { parseCookies } from 'nookies'
import { deleteMessage } from '@/utils/api'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { LANGUAGE_VERSIONS } from '@/types/consts/ide'

export interface MenuI {
  onUpdateM(value: string): void
}

const SelectLanguageModal = ({ onUpdateM }: MenuI) => {
  const [isLoading, setIsLoading] = useState(false)

  const languages = Object.entries(LANGUAGE_VERSIONS)

  return (
    <>
      <div className="h-full w-[300px] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] pb-2 text-[14px] font-normal text-[#c5c4c4]">
        <div className="my-[7px] h-[1px] w-full bg-[#33323e]"></div>
        <div className="max-h-[250px] overflow-y-auto pr-3 scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
          {languages.map(([language, version], index) => (
            <div
              key={index}
              onClick={() => {
                if (version !== 'soon') {
                  onUpdateM(language)
                }
              }}
              className={`my-[5px] flex  items-center gap-x-[12px] rounded-[5px] p-[5px] hover:bg-[#c5c5c510]  ${
                version !== 'soon' && 'cursor-pointer'
              }`}
            >
              <div className="overflow-hidden truncate text-ellipsis whitespace-nowrap text-[#c5c4c4]">
                {language} - <span className="text-[12px]">{version}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="my-[7px] h-[0.5px] w-full bg-[#33323e]"></div>
      </div>
    </>
  )
}

export default SelectLanguageModal
