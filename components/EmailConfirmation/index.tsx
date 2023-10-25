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
import Checkbox from '@material-ui/core/Checkbox'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'

const EmailConfirmation = (id: any) => {
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false)
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(true)
  const [pageRedirect, setPageRedirect] = useState<string>()

  const { push } = useRouter()

  async function confirmEmail(id: any) {
    const data = {
      id,
    }
    console.log(data)
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/openmesh-experts/functions/confirmEmail`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
        'Content-Type': 'application/json',
      },
      data,
    }

    let dado

    try {
      await axios(config).then(function (response) {
        if (response.data) {
          dado = response.data
          console.log(dado)
          if (dado.pageRedirect) {
            setPageRedirect(dado.pageRedirect)
          }
        }
        setIsConfirmed(true)
      })
    } catch (err) {
      toast.error(`An error occurred`)
      push('/oec')
    }

    return dado
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (id) {
      console.log('search for the task info on blockchain')
      console.log('received value')
      console.log(id)
      console.log(id.id)
      confirmEmail(id.id)
    } else {
      push('/oec')
    }
  }, [id])

  function renderRedirectButton() {
    if (pageRedirect) {
      return pageRedirect
    } else {
      return process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
        ? 'https://openmesh.network/oec/login'
        : '/login'
    }
  }

  if (!isConfirmed) {
    return (
      <section className="py-16 px-32 text-black md:py-20 lg:pt-40">
        <div className="container h-40 animate-pulse px-0 pb-12">
          <div className="mr-10 w-full animate-pulse bg-[#dfdfdf]"></div>
          <div className="w-full animate-pulse bg-[#dfdfdf]"></div>
        </div>
      </section>
    )
  }
  return (
    <>
      <section className="mt-12 mb-[0px] flex justify-center px-[20px] pt-[15px] text-center text-[11px]  font-medium !leading-[17px] text-[#000000] lg:mb-24 lg:px-[100px] lg:pt-[100px]  lg:text-[14px]">
        <div>
          <div className="text-[15px] font-bold !leading-[150%] text-[#000000] lg:text-[24px]">
            Email confirmed succesfully!
          </div>
          <div className="mt-[50px]">
            <a
              href={renderRedirectButton()}
              className="mx-auto flex w-fit cursor-pointer items-center rounded-[5px] border  border-[#0354EC] bg-transparent py-[11.5px] px-[24px] text-[16px] font-bold !leading-[19px] text-[#0354EC] hover:bg-[#0354EC] hover:text-[#fff]"
            >
              Proceed to Login
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default EmailConfirmation
