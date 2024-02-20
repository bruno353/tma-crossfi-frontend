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
  isDisable?: boolean
}

const Dropdown = ({
  optionSelected,
  options,
  onValueChange,
  isDisable,
}: ModalI) => {
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
      } w-full rounded-md  border  border-transparent  bg-[#242B51] px-6 py-2 text-body-color`}
      ref={dropdownRef}
    >
      <div
        onClick={() => {
          if (isDisable) {
            return
          }
          setIsOpen(!isOpen)
        }}
        className={`flex justify-between ${!isDisable && 'cursor-pointer'}`}
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
        <div className="absolute left-0 top-0 z-50 w-full translate-y-[45px] rounded-md  bg-[#242B51] transition">
          <div className="grid gap-y-[5px] px-1 py-1">
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  setIsOpen(false)
                  onValueChange(option)
                }}
                className={`flex cursor-pointer gap-x-[10px] rounded-md px-6 py-2  hover:bg-[#dbdbdb1e] ${
                  optionSelected.value === option.value && 'bg-[#dbdbdb1e]'
                }`}
              >
                {option.imageSrc && (
                  <img
                    src={option.imageSrc}
                    alt="image"
                    className={option.imageStyle}
                  />
                )}

                <div>{option.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dropdown
