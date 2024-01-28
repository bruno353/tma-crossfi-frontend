/* eslint-disable no-unused-vars */

import { useEffect, useRef, useState } from 'react'

export type ValueObject = {
  name: string
  value: string
  imageSrc?: string
  imageStyle?: string
}

interface ModalI {
  optionSelected: ValueObject
  options: ValueObject[]
  onValueChange(value: ValueObject): void
}

const Dropdown = ({ optionSelected, options, onValueChange }: ModalI) => {
  const [isOpen, setIsOpen] = useState(false)

  const dropdownRef = useRef(null)

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      className={`relative ${
        isOpen && 'border-primary'
      } w-full rounded-md  border  border-transparent  bg-[#242B51] px-6 py-2 text-base text-body-color`}
      ref={dropdownRef}
    >
      <div className="flex">
        <button
          type="button"
          className={`inline-flex w-full items-center gap-x-[5px]
            ${isOpen ? '' : ''}`}
          id="options-menu"
          aria-haspopup="true"
          aria-expanded="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* <img
              src={`${
                process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                  ? process.env.NEXT_PUBLIC_BASE_PATH
                  : ''
              }${getSrcForValue(value)}`}
              alt="image"
              className={`my-auto w-[10px] md:w-[12px] lg:w-[14px] xl:w-[16px] 2xl:w-[20px]`}
            /> */}
          {optionSelected.name}
          <svg
            className="my-auto ml-auto w-[6px] lg:w-[9px]"
            viewBox="0 0 9 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4.5 7L0.602886 0.25L8.39711 0.25L4.5 7Z" fill="#676767" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  setIsOpen(false)
                  onValueChange(option)
                }}
                className="flex cursor-pointer gap-x-[7.5px] px-4 py-2 hover:bg-[#f7f5f5] md:gap-x-[9px]  lg:gap-x-[10.5px] xl:gap-x-[12px] 2xl:gap-x-[15px] "
              >
                {/* <img
                    src={`${
                      process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                        ? process.env.NEXT_PUBLIC_BASE_PATH
                        : ''
                    }${option.src}`}
                    alt="image"
                    className={`my-auto w-[10px] md:w-[12px] lg:w-[14px] xl:w-[16px] 2xl:w-[20px]`}
                  /> */}
                <div className=" transition" role="menuitem">
                  {option.name}
                </div>
                {option === optionSelected && (
                  <img
                    src={`${
                      process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                        ? process.env.NEXT_PUBLIC_BASE_PATH
                        : ''
                    }/images/dropdown/check.svg`}
                    alt="image"
                    className="ml-auto w-[20px]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dropdown
