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
      <div
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        className="flex cursor-pointer justify-between"
      >
        <div className="flex justify-between gap-x-[10px]">
          {optionSelected.imageSrc && (
            <img
              src={optionSelected.imageSrc}
              alt="image"
              className={optionSelected.imageStyle}
            />
          )}

          <div>{optionSelected.name}</div>
        </div>
        <img
          alt="ethereum avatar"
          src="/images/header/arrow-gray.svg"
          className={`w-[10px] rounded-full transition-transform duration-200 ${
            isOpen && 'rotate-180'
          }`}
        ></img>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-0 z-50 w-full translate-y-[100%] rounded-md  bg-[#242B51] transition">
          <div className="py-1">
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  setIsOpen(false)
                  onValueChange(option)
                }}
                className={`flex cursor-pointer gap-x-[7.5px] px-4 py-2 hover:bg-[#dbdbdb1e] md:gap-x-[9px]  lg:gap-x-[10.5px] xl:gap-x-[12px] 2xl:gap-x-[15px] ${
                  optionSelected.value === option.value && 'bg-[#dbdbdb1e]'
                }`}
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