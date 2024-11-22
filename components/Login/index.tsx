/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unknown-property */
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
import { parseCookies, destroyCookie, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
import Link from 'next/link'
import ReCAPTCHA from 'react-google-recaptcha'

import { createHash } from 'crypto'
import ScrollToTop from '../ScrollToTop/index'
import { SigninForm, SignupForm } from '@/types/user'
import { createUser, googleRedirect, loginUser } from '@/utils/api'
import { callAxiosBackend } from '@/utils/general-api'

// Define the interface for user data
interface UserData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code: string
  is_premium?: boolean
}

const SignUp = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(true)

  const [userData, setUserData] = useState<UserData | null>(null)
  const [initData, setInitData] = useState<any>(null)

  useEffect(() => {
    destroyCookie(undefined, 'userSessionToken', { path: '/' })
    destroyCookie(undefined, 'user', { path: '/' })
    setUser(null)
    return
    if (typeof window !== 'undefined') {
      // Verificar se está no navegador

      // Mova a importação do SDK para dentro do useEffect
      const initTelegram = async () => {
        try {
          const WebApp = (await import('@twa-dev/sdk')).default
          WebApp.ready()
          console.log('use effect telegram chamado')
          if (WebApp.initDataUnsafe.user) {
            console.log('possui WebApp.initDataUnsafe.user')
            setUserData(WebApp.initDataUnsafe.user as UserData)
          }
          const initData = WebApp.initData
          setInitData(JSON.stringify(initData))
          if (initData) {
            const res = await callAxiosBackend(
              'post',
              '/user/functions/telegram/auth',
              'userSessionToken',
              { initData: WebApp.initData }, // Envie como objeto
            )
            toast.success(res.sessionToken)
            setCookie(null, 'userSessionToken', res.sessionToken, {
              path: '/',
              maxAge: 30 * 24 * 60 * 60, // Exemplo de validade do cookie: 30 dias
              secure: true, // Recomendado para produção, garante que o cookie seja enviado apenas por HTTPS
              sameSite: 'strict', // Recomendado para evitar ataques de CSRF
            })
            setCookie(null, 'user', JSON.stringify(res), {
              path: '/',
              maxAge: 30 * 24 * 60 * 60, // Exemplo de validade do cookie: 30 dias
              secure: true, // Recomendado para produção, garante que o cookie seja enviado apenas por HTTPS
              sameSite: 'strict', // Recomendado para evitar ataques de CSRF
            })
            setUser(res)
            setIsLoading(false)
            push('/dashboard')
          }
        } catch (error) {
          console.error('Error initializing Telegram Web App:', error)
          toast.error(`Here Error: ${error}`)
        }
      }

      initTelegram()
    }
  }, [])

  const { push } = useRouter()

  const { user, setUser } = useContext(AccountContext)

  const validSchema = Yup.object().shape({
    email: Yup.string().max(500).required('Email is required'),
    password: Yup.string().max(500).required('Password is required'),
  })
  const {
    register,
    handleSubmit,
    setValue,
    control, // Adicione esta linha
    // eslint-disable-next-line no-unused-vars
    reset,
    formState: { errors },
  } = useForm<SigninForm>({
    resolver: yupResolver<any>(validSchema),
  })

  async function onSubmit(data: SigninForm) {
    console.log('oiii')
    setIsLoading(true)

    try {
      const res = await loginUser(data)
      setCookie(null, 'userSessionToken', res.sessionToken, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // Exemplo de validade do cookie: 30 dias
        secure: true, // Recomendado para produção, garante que o cookie seja enviado apenas por HTTPS
        sameSite: 'strict', // Recomendado para evitar ataques de CSRF
      })
      setCookie(null, 'user', JSON.stringify(res), {
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // Exemplo de validade do cookie: 30 dias
        secure: true, // Recomendado para produção, garante que o cookie seja enviado apenas por HTTPS
        sameSite: 'strict', // Recomendado para evitar ataques de CSRF
      })
      setUser(res)
      setIsLoading(false)
      push('/dashboard')
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }

  async function handleLoginGoogle(url: string) {
    setIsLoading(true)
    try {
      const user = await googleRedirect(url)
      if (user) {
        setCookie(null, 'userSessionToken', user['sessionToken'], {
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // Exemplo de validade do cookie: 30 dias
          secure: true, // Recomendado para produção, garante que o cookie seja enviado apenas por HTTPS
          sameSite: 'strict', // Recomendado para evitar ataques de CSRF
        })
        setCookie(null, 'user', JSON.stringify(user), {
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // Exemplo de validade do cookie: 30 dias
          secure: true, // Recomendado para produção, garante que o cookie seja enviado apenas por HTTPS
          sameSite: 'strict', // Recomendado para evitar ataques de CSRF
        })
        setUser(user)
        push('/dashboard')
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (code) {
      const url = window.location.href
      const loginIndex = url.indexOf('signin')
      console.log('getting length after login')
      const afterLogin = url.substring(loginIndex + 'signin'.length)

      console.log(afterLogin)
      handleLoginGoogle(afterLogin)
    }
  }, [])

  return (
    <>
      <section className="relative z-10 overflow-hidden pb-2 pt-2 lg:pt-[0px]">
        <div className="container">
          <form onSubmit={handleSubmit(onSubmit)} className="">
            <div className="-mx-4 flex flex-wrap">
              <div className="w-full px-4">
                <div className="mx-auto max-w-[500px] rounded-md bg-primary bg-opacity-5 px-6 py-10 dark:bg-dark sm:px-[60px]">
                  <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                    Sign in to your account
                  </h3>
                  <p className="mb-11 text-center text-base font-medium text-body-color">
                    Start the revolution
                  </p>
                  <div className="mb-6 flex w-full cursor-pointer items-center justify-center rounded-md bg-white p-3 text-base font-medium text-body-color shadow-one hover:text-primary dark:bg-[#242B51] dark:text-body-color dark:shadow-signUp dark:hover:text-white">
                    <span className="mr-3">
                      <img
                        alt="ethereum avatar"
                        src="/images/telegram/telegram_logo.png"
                        className="w-[25px] 2xl:w-[30px]"
                      ></img>
                    </span>
                    Auth with Telegram
                  </div>
                  <div className="mb-8 flex items-center justify-center">
                    <span className="hidden h-[1px] w-full max-w-[60px] bg-body-color sm:block"></span>
                    <p className="w-full px-5 text-center text-base font-medium text-body-color">
                      Or, sign in with your credentials
                    </p>
                    <span className="hidden h-[1px] w-full max-w-[60px] bg-body-color sm:block"></span>
                  </div>
                  <form>
                    <div className="mb-8">
                      <label
                        htmlFor="email"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        {' '}
                        Email{' '}
                        <p className="ml-[8px] text-[10px] font-normal text-[#ff0000]">
                          {errors.email?.message}
                        </p>
                      </label>
                      <input
                        type="email"
                        name="email"
                        disabled={isLoading}
                        maxLength={500}
                        placeholder="Enter your Email"
                        className="w-full rounded-md border border-transparent px-6 py-3 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                        {...register('email')}
                      />
                    </div>
                    <div className="mb-8">
                      <div className="mb-3 flex gap-x-[15px]">
                        <label
                          htmlFor="password"
                          className=" block text-sm font-medium text-dark dark:text-white"
                        >
                          {' '}
                          Password{' '}
                          <p className="ml-[8px] text-[10px] font-normal text-[#ff0000]">
                            {errors.password?.message}
                          </p>
                        </label>
                        {passwordVisibility ? (
                          <div
                            onClick={() => setPasswordVisibility(false)}
                            className="flex cursor-pointer items-center text-center"
                          >
                            <EyeSlash className="cursor-pointer text-[#C5C4C4]" />
                          </div>
                        ) : (
                          <div
                            onClick={() => setPasswordVisibility(true)}
                            className="flex cursor-pointer items-center text-center"
                          >
                            <Eye className="cursor-pointer text-[#C5C4C4]" />
                          </div>
                        )}
                      </div>

                      <div>
                        <input
                          type={passwordVisibility ? 'password' : 'text'}
                          disabled={isLoading}
                          maxLength={500}
                          name="password"
                          placeholder="Enter your Password"
                          className="w-full rounded-md border border-transparent px-6 py-3 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                          {...register('password')}
                        />
                      </div>
                    </div>
                    <div className="mb-6">
                      <button
                        onClick={handleSubmit(onSubmit)}
                        className={`flex w-full items-center justify-center rounded-md bg-primary px-9 py-4 text-base font-medium text-white transition duration-300 ease-in-out
                    ${
                      isLoading
                        ? 'animate-pulse cursor-default bg-[#5970da]'
                        : ' hover:bg-opacity-80 hover:shadow-signUp'
                    }`}
                      >
                        Sign in
                      </button>
                    </div>
                  </form>
                  <p className="mt-10 text-center text-base font-medium text-body-color">
                    Don't have an account? <br />
                    <Link
                      href="/signup"
                      className="text-primary hover:underline"
                    >
                      Sign up
                    </Link>
                  </p>
                  <p className="mt-6 text-center text-base font-medium text-body-color">
                    Forgot your password? <br />
                    <Link
                      href="/recover-password"
                      className="text-primary hover:underline"
                    >
                      Recover password
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default SignUp
