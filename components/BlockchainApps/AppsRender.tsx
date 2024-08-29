/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Eye, EyeSlash, SmileySad } from 'phosphor-react'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { UserWorkspaceProps } from '@/types/workspace'
import { BlockchainAppProps } from '@/types/blockchain-app'
import { optionsNetwork } from './Modals/NewAppModal'
import EditAppModal from './Modals/EditAppModal'
import { formatDate } from '@/utils/functions'

export interface ModalI {
  apps: BlockchainAppProps[]
  isUserAdmin: boolean
  onUpdate(): void
}

const AppsRender = ({ apps, onUpdate, isUserAdmin }: ModalI) => {
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState<any>()
  const [isUserModalOpen, setIsUserModalOpen] = useState<any>()
  const [isEditInfoOpen, setIsEditInfoOpen] = useState<any>()
  const [isEditAppOpen, setIsEditAppOpen] = useState<any>()

  const { push } = useRouter()
  const pathname = usePathname()

  const menuRef = useRef(null)
  const editRef = useRef(null)

  const closeMenu = () => {
    setIsDeleteUserOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Clicked outside of the menu, so close it
        closeMenu()
      }
    }

    // Add event listener when the menu is open
    if (isDeleteUserOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      // Remove event listener when the menu is closed
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDeleteUserOpen])

  function handleClickApp(id: string, event) {
    console.log('cliquei no app ism')
    if (!editRef?.current?.contains(event.target)) {
      push(`${pathname}/${id}`)
    }
  }

  function NoAppsFound() {
    return (
      <div className="mx-auto w-fit items-center justify-center text-[15px] font-light">
        <SmileySad size={32} className="text-blue-500 mx-auto  mb-2" />
        <span>No Apps found, create your first App</span>
      </div>
    )
  }

  return (
    <div className="text-[14px] text-[#C5C4C4]">
      <div className=" text-[14px] font-normal">
        <div className="grid gap-y-[25px]">
          {apps?.length === 0 ? (
            NoAppsFound()
          ) : (
            <div className="">
              <div className="flex w-full rounded-t-md bg-[#c5c4c40e] px-[15px] py-[8px]">
                <div className="w-full max-w-[40%]">App name</div>
                <div className="w-full max-w-[30%]">Network</div>
                <div className="w-full max-w-[20%]">created at</div>
              </div>
              <div className="max-h-[calc(100vh-26rem)] overflow-y-auto rounded-b-md  border border-[#c5c4c41a] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:max-h-[calc(100vh-32rem)] ">
                {' '}
                {apps?.map((app, index) => (
                  <div
                    onClick={(event) => {
                      handleClickApp(app.id, event)
                    }}
                    key={index}
                    className={`flex items-center  ${
                      index !== apps?.length - 1 &&
                      'border-b-[1px] border-[#c5c4c41a]'
                    } cursor-pointer gap-x-[2px] px-[15px] py-[20px] text-[15px] font-normal hover:bg-[#7775840c]`}
                  >
                    <div className="w-full max-w-[40%] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                      {app.name}
                    </div>
                    <div className="flex w-full max-w-[30%] items-center gap-x-[7px]">
                      <img
                        src={
                          optionsNetwork.find((op) => {
                            return op.value === app.network
                          })?.imageSrc
                        }
                        alt="image"
                        className={
                          optionsNetwork.find((op) => {
                            return op.value === app.network
                          })?.imageStyle
                        }
                      />
                      <div className="overflow-hidden truncate text-ellipsis whitespace-nowrap">
                        {
                          optionsNetwork.find((op) => {
                            return op.value === app.network
                          })?.name
                        }
                      </div>
                    </div>
                    <div className="w-full max-w-[15%] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                      {formatDate(app.createdAt)}
                    </div>
                    <div className="relative ml-auto w-full max-w-[5%]">
                      {' '}
                      {isEditInfoOpen === app.id && (
                        <div className="absolute flex w-[100px] -translate-x-[100%] -translate-y-[20%]  items-center   justify-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                          Edit app
                        </div>
                      )}
                      {isUserAdmin && (
                        <img
                          ref={editRef}
                          alt="ethereum avatar"
                          src="/images/chat/pencil.svg"
                          className="w-[15px] cursor-pointer 2xl:w-[25px]"
                          onMouseEnter={() => setIsEditInfoOpen(app.id)}
                          onMouseLeave={() => setIsEditInfoOpen(null)}
                          onClick={(event) => {
                            event.stopPropagation()
                            setIsEditAppOpen(app.id)
                          }}
                        ></img>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {isEditAppOpen && (
        <EditAppModal
          isOpen={isEditAppOpen}
          onClose={() => {
            setIsEditAppOpen(false)
          }}
          onUpdateM={() => {
            onUpdate()
            setIsEditAppOpen(false)
          }}
          app={apps.find((app) => app.id === isEditAppOpen)}
          onDelete={() => {
            onUpdate()
            setIsEditAppOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default AppsRender
