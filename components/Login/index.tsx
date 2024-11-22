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
      <section className="relative z-10 mt-auto overflow-hidden bg-yellow pb-2 pt-2 lg:pt-[0px]">
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
                  <div className="mb-6 flex w-full items-center justify-center rounded-md bg-white p-3 text-base font-medium text-body-color shadow-one hover:text-primary dark:bg-[#242B51] dark:text-body-color dark:shadow-signUp dark:hover:text-white">
                    <span className="mr-3">
                      <img
                        alt="ethereum avatar"
                        src="/images/telegram/telegram_logo.png"
                        className="w-[25px] 2xl:w-[30px]"
                      ></img>
                    </span>
                    <label>Loading with Telegram</label>
                    <svg
                      aria-hidden="true"
                      className="my-auto ml-3 h-6 w-6 animate-spin fill-[#273687] text-[#242B51]"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                  </div>
                  <p className="mt-20 text-center text-base font-medium text-body-color">
                    How does Crossfi Apps Center works? <br />
                    <Link
                      href="/signup"
                      className="text-primary hover:underline"
                    >
                      Check it
                    </Link>
                  </p>
                  <p className="mt-6 text-center text-base font-medium text-body-color">
                    <Link
                      href="/recover-password"
                      className="text-primary hover:underline"
                    >
                      Powered by Accelar
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
