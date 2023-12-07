/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Eye, EyeSlash } from 'phosphor-react'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { confirmEmailUser } from '@/utils/api'

const EmailConfirmation = (id: any) => {
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false)

  const { push } = useRouter()

  async function confirmEmail(id: any) {
    const data = {
      id,
    }

    try {
      await confirmEmailUser(data)
      setIsConfirmed(true)
      toast.success(`Success`)
    } catch (err) {
      console.log(err)
      toast.error(`An error occurred`)
      push('/login')
    }
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (id) {
      console.log('search for the task info')
      console.log('received value')
      console.log(id)
      console.log(id.id)
      confirmEmail(id.id)
    } else {
      console.log('no id')
      push('/login')
    }
  }, [id])

  if (!isConfirmed) {
    return (
      <section className="px-32 py-16 text-black md:py-20 lg:pt-40">
        <div className="container h-40 animate-pulse px-0 pb-12">
          <div className="mr-10 w-full animate-pulse bg-[#dfdfdf]"></div>
          <div className="w-full animate-pulse bg-[#dfdfdf]"></div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-[180px] lg:pt-[180px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[500px] rounded-md bg-primary bg-opacity-5 px-6 py-10 dark:bg-dark sm:p-[60px]">
                <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                  Email confirmed succesfully!{' '}
                </h3>
                <div className="mt-[50px]">
                  <a href="/login">
                    <button
                      className={`flex w-full items-center justify-center rounded-md bg-primary px-9 py-4 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-opacity-80 hover:shadow-signUp
                    `}
                    >
                      Proceed to Login
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default EmailConfirmation
