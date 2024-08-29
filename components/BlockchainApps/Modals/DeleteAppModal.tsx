'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import { parseCookies } from 'nookies'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { deleteApp } from '@/utils/api-blockchain'

export interface MenuI {
  id: string
  onUpdateM(): void
}

const DeleteAppModal = ({ id, onUpdateM }: MenuI) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleDeleteApp = async (id: string) => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()
    const data = {
      id,
    }

    try {
      await deleteApp(data, userSessionToken)
      onUpdateM()
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  return (
    <>
      <div className="h-full w-[300px] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[12px] font-normal text-[#c5c4c4]">
        <div className="grid gap-y-[10px]">
          <div>You are deleting this app</div>
          <div
            className={`${
              isLoading
                ? 'animate-pulse bg-[#cc556350]'
                : 'cursor-pointer  hover:bg-[#cc556350]'
            }  mt-[5px] flex w-fit items-center rounded-[5px] border-[1px]  border-[#cc5563] p-[2px] px-[10px] text-center text-[12px] text-[#cc5563] `}
            onClick={() => {
              handleDeleteApp(id)
            }}
          >
            Delete
          </div>
        </div>
      </div>
    </>
  )
}

export default DeleteAppModal
