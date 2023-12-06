/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import nookies, { parseCookies, setCookie } from 'nookies'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { AccountContext } from '../../contexts/AccountContext'
import { EyeSlash, Eye } from 'phosphor-react'

type RegisterForm = {
  email: string
}

const RecoverPassword = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false)
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(true)
  const [wasSent, setWasSent] = useState<boolean>(false)

  const cookies = parseCookies()
  const userHasAnyCookie = cookies.userSessionToken

  const { push } = useRouter()

  const validSchema = Yup.object().shape({
    email: Yup.string()
      .required('Email is required')
      .email('Must be a valid email address'),
  })
  const {
    register,
    handleSubmit,
    setValue,
    control, // Adicione esta linha
    // eslint-disable-next-line no-unused-vars
    reset,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver<any>(validSchema),
  })

  async function recoverPassword(data: any) {
    console.log('chegou a password')
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/openmesh-experts/functions/emailRecoverPassword`,
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
        }
        setWasSent(true)
      })
    } catch (err) {
      toast.error(`An error occurred`)
    }
    setIsLoading(false)

    return dado
  }

  async function onSubmit(data: RegisterForm) {
    console.log('submitt update called')
    setIsLoading(true)

    const finalData = { email: data.email }

    try {
      await recoverPassword(finalData)
    } catch (err) {
      console.log(err)
      setIsLoading(false)
    }
  }

  if (wasSent) {
    return (
      <>
        <section className="border-b border-[#CFCFCF] px-32 pb-[53px] pt-[50px]">
          <div className="container">
            <div className="-mx-4 flex flex-wrap items-start">
              <div className="w-full px-4 lg:w-2/3">
                <div className="mb-1">
                  <h3 className="text-[15px] font-bold !leading-[150%] text-[#000000] lg:text-[24px]">
                    Recover password
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-12 mb-[0px] flex justify-center px-[20px] pt-[15px] text-center text-[11px]  font-medium !leading-[17px] text-[#000000] lg:mb-24 lg:px-[100px] lg:pt-[30px]  lg:text-[14px]">
          <div>
            <div className="text-[12px] font-normal !leading-[150%] text-[#000000] lg:mt-[25px] lg:text-[16px]">
              If this email is valid, a password recovery link has been sent to
              it.
            </div>
          </div>
        </section>
      </>
    )
  }

  if (!isPageLoading) {
    return (
      <>
        <section className="border-b border-[#CFCFCF] px-32 pb-[53px] pt-[50px]">
          <div className="container">
            <div className="-mx-4 flex flex-wrap items-start">
              <div className="w-full px-4 lg:w-2/3">
                <div className="mb-1">
                  <h3 className="text-[15px] font-bold !leading-[150%] text-[#000000] lg:text-[24px]">
                    Recover password
                  </h3>
                </div>
                <div className="mt-[15px] text-[#000]">
                  Enter your email below so we can send you a link to recover
                  your password.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-12 mb-[0px] px-[20px] pt-[15px] text-[11px]  font-medium !leading-[17px] text-[#000000] lg:mb-24 lg:px-[100px] lg:pt-[10px]  lg:text-[14px]">
          <div className="flex gap-x-[70px] lg:gap-x-[200px] lg:px-[150px]">
            <form onSubmit={handleSubmit(onSubmit)} className="">
              <div className="">
                <div>
                  <div id="emailId" className="">
                    <div id="passwordId" className="mt-[30px] lg:mt-[20px]">
                      <span className="flex flex-row">
                        Email
                        <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                          {errors.email?.message}
                        </p>
                      </span>
                      <div className="flex gap-x-[20px]">
                        <input
                          disabled={isLoading}
                          className="mt-[10px] h-[45px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]"
                          type={'text'}
                          maxLength={100}
                          placeholder=""
                          {...register('email')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {isLoading ? (
                <div className="mt-[60px] flex pb-[10px] lg:pb-60">
                  <button
                    disabled={true}
                    className={`h-[40px] w-[180px] rounded-[10px] border border-[#0354EC] bg-[#0354EC] bg-transparent py-[9px] px-[25px] text-[11px]  font-bold text-[#0354EC]  hover:bg-[#0354EC] hover:text-[#fff] lg:text-[14px]`}
                  >
                    <span className="">Recover password</span>
                  </button>
                  <svg
                    className="mt-1 animate-spin"
                    height="40px"
                    id="Icons"
                    version="1.1"
                    viewBox="0 0 80 80"
                    width="40px"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M58.385,34.343V21.615L53.77,26.23C50.244,22.694,45.377,20.5,40,20.5c-10.752,0-19.5,8.748-19.5,19.5S29.248,59.5,40,59.5  c7.205,0,13.496-3.939,16.871-9.767l-4.326-2.496C50.035,51.571,45.358,54.5,40,54.5c-7.995,0-14.5-6.505-14.5-14.5  S32.005,25.5,40,25.5c3.998,0,7.617,1.632,10.239,4.261l-4.583,4.583H58.385z" />
                  </svg>
                </div>
              ) : (
                <div className="mt-[60px] pb-60">
                  <button
                    type="submit"
                    onClick={handleSubmit(onSubmit)}
                    className={`h-[40px] w-[180px] rounded-[10px] border border-[#0354EC] bg-transparent py-[9px] px-[25px] text-[11px]  font-bold text-[#0354EC]  hover:bg-[#0354EC] hover:text-[#fff] lg:text-[14px]`}
                  >
                    <span className="">Recover password</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>
      </>
    )
  }
}

export default RecoverPassword
