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
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css' // import styles
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import nookies, { parseCookies, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'

import { createHash } from 'crypto'
import ScrollToTop from '../ScrollToTop/index';

type LoginForm = {
  email: string
  password: string
}

const SignUp = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(true)

  const { push } = useRouter()

  const { user, setUser } = useContext(AccountContext)

  const validSchema = Yup.object().shape({
    email: Yup.string().max(500).required('Email is required'),
    password: Yup.string()
      .min(8, 'Min of 8 digits')
      .max(500)
      .required('Password is required'),
  })
  const {
    register,
    handleSubmit,
    setValue,
    control, // Adicione esta linha
    // eslint-disable-next-line no-unused-vars
    reset,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver<any>(validSchema),
  })

  async function loginUser(data: any) {
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/openmesh-experts/functions/login`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      },
      data,
    }

    let dado

    await axios(config).then(function (response) {
      if (response.data) {
        dado = response.data
        console.log('api response')
        console.log(dado)
      }
    })

    return dado
  }

  async function onSubmit(data: LoginForm) {
    setIsLoading(true)
    console.log('called login')
    const finalData = {
      ...data,
    }
    try {
      const res = await loginUser(finalData)
      console.log(res)
      console.log('setting the cookies')
      setCookie(null, 'userSessionToken', res.sessionToken)
      nookies.set(null, 'userSessionToken', res.sessionToken)
      console.log('setting user')
      setUser(res)
      console.log('setting false')
      setIsLoading(false)
      push('/oec')
    } catch (err) {
      console.log(err)
      if (err.response.data.message === 'Unconfirmed Email') {
        toast.error('Unconfirmed email')
      } else if (err.response.data.message === 'User disabled') {
        toast.error(
          'Please allow 24 to 48 hours for the community to approve your application',
        )
      } else {
        toast.error('Incorrect credentials')
      }
      const element = document.getElementById('emailId')
      element.scrollIntoView({ behavior: 'smooth' })
      console.log('the error')
      console.log(err.response.data.message)
      setIsLoading(false)
    }
  }

  return (
    <>
      <section className="mt-12 mb-[0px] px-[20px] pt-[50px]  text-[11px] font-medium !leading-[17px] text-[#000000] lg:mb-24 lg:px-[100px]  lg:text-[14px]">
        <div className="mx-auto flex w-fit justify-center rounded-[8px] border border-[#cacaca] p-[100px]">
          <form onSubmit={handleSubmit(onSubmit)} className="">
            <div className="">
              <div>
                <div id="emailId" className="">
                  <div className="">
                    <span className="flex flex-row">
                      Email
                      <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                        {errors.email?.message}
                      </p>
                    </span>
                    <input
                      disabled={isLoading}
                      className="mt-[10px] h-[50px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]"
                      type="text"
                      maxLength={500}
                      placeholder=""
                      {...register('email')}
                    />
                  </div>
                  <div className="mt-[20px]">
                    <span className="flex flex-row">
                      Password
                      <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                        {errors.password?.message}
                      </p>
                    </span>
                    <div className="flex">
                      <input
                        disabled={isLoading}
                        className="mt-[10px] mr-[20px] h-[50px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]"
                        type={passwordVisibility ? 'password' : 'text'}
                        maxLength={500}
                        placeholder=""
                        {...register('password')}
                      />
                      {passwordVisibility ? (
                        <div
                          onClick={() => setPasswordVisibility(false)}
                          className="flex cursor-pointer items-center text-center"
                        >
                          <EyeSlash className="cursor-pointer" />
                        </div>
                      ) : (
                        <div
                          onClick={() => setPasswordVisibility(true)}
                          className="flex cursor-pointer items-center text-center"
                        >
                          <Eye className="cursor-pointer" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {isLoading ? (
              <div className="mt-[30px] flex">
                <button
                  disabled={true}
                  className=" cursor-pointer items-center rounded-[5px] border  border-[#000] bg-transparent py-[8px] px-[25px] text-[13px] font-bold !leading-[19px] text-[#575757] hover:bg-[#ececec] lg:text-[16px]"
                  onClick={handleSubmit(onSubmit)}
                >
                  <span className="">Sign in</span>
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
              <div className="mt-[30px]">
                <button
                  type="submit"
                  className=" cursor-pointer items-center rounded-[5px] border  border-[#000] bg-transparent py-[8px] px-[25px] text-[13px] font-bold !leading-[19px] text-[#575757] hover:bg-[#ececec] lg:text-[16px]"
                  onClick={handleSubmit(onSubmit)}
                >
                  <span className="">Sign in</span>
                </button>
              </div>
            )}
            <div className="lg:mt-[50px]">
              Does not have an account yet?{' '}
              <a
                href={`${
                  process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                    ? `${process.env.NEXT_PUBLIC_BASE_URL}/oec/register`
                    : '/register'
                }`}
                className="border-b-1 cursor-pointer border-b text-[#3253FE]"
              >
                Create account
              </a>
            </div>
            <div className="lg:mt-[20px]">
              Forgot your password?{' '}
              <a
                href={`${
                  process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                    ? `${process.env.NEXT_PUBLIC_BASE_URL}/oec/recover-password`
                    : '/recover-password'
                }`}
                className="border-b-1 cursor-pointer border-b text-[#3253FE]"
              >
                Recover password
              </a>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default SignUp
