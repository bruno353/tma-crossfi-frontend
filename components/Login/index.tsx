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
    if (typeof window !== 'undefined') {
      // Verificar se está no navegador

      // Mova a importação do SDK para dentro do useEffect
      const initTelegram = async () => {
        try {
          const WebApp = (await import('@twa-dev/sdk')).default
          console.log('use effect telegram chamado')
          if (WebApp.initDataUnsafe.user) {
            console.log('possui WebApp.initDataUnsafe.user')
            setUserData(WebApp.initDataUnsafe.user as UserData)
          }
          const initData = WebApp.initData
          setInitData(JSON.stringify(initData))

          const res = await callAxiosBackend(
            'post',
            '/user/functions/telegram/auth',
            'userSessionToken',
            JSON.stringify({ initData }),
          )
        } catch (error) {
          console.error('Error initializing Telegram Web App:', error)
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
                    Sign in to your my account {userData?.first_name} -{' '}
                    {userData?.id} - {userData?.username} and initData:{' '}
                    {initData}
                  </h3>
                  <p className="mb-11 text-center text-base font-medium text-body-color">
                    Start the revolution
                  </p>
                  <div
                    onClick={() =>
                      (window.location.href = `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/user/functions/google/login`)
                    }
                    className="mb-6 flex w-full cursor-pointer items-center justify-center rounded-md bg-white p-3 text-base font-medium text-body-color shadow-one hover:text-primary dark:bg-[#242B51] dark:text-body-color dark:shadow-signUp dark:hover:text-white"
                  >
                    <span className="mr-3">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_95:967)">
                          <path
                            d="M20.0001 10.2216C20.0122 9.53416 19.9397 8.84776 19.7844 8.17725H10.2042V11.8883H15.8277C15.7211 12.539 15.4814 13.1618 15.1229 13.7194C14.7644 14.2769 14.2946 14.7577 13.7416 15.1327L13.722 15.257L16.7512 17.5567L16.961 17.5772C18.8883 15.8328 19.9997 13.266 19.9997 10.2216"
                            fill="#4285F4"
                          />
                          <path
                            d="M10.2042 20.0001C12.9592 20.0001 15.2721 19.1111 16.9616 17.5778L13.7416 15.1332C12.88 15.7223 11.7235 16.1334 10.2042 16.1334C8.91385 16.126 7.65863 15.7206 6.61663 14.9747C5.57464 14.2287 4.79879 13.1802 4.39915 11.9778L4.27957 11.9878L1.12973 14.3766L1.08856 14.4888C1.93689 16.1457 3.23879 17.5387 4.84869 18.512C6.45859 19.4852 8.31301 20.0005 10.2046 20.0001"
                            fill="#34A853"
                          />
                          <path
                            d="M4.39911 11.9777C4.17592 11.3411 4.06075 10.673 4.05819 9.99996C4.0623 9.32799 4.17322 8.66075 4.38696 8.02225L4.38127 7.88968L1.19282 5.4624L1.08852 5.51101C0.372885 6.90343 0.00012207 8.4408 0.00012207 9.99987C0.00012207 11.5589 0.372885 13.0963 1.08852 14.4887L4.39911 11.9777Z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M10.2042 3.86663C11.6663 3.84438 13.0804 4.37803 14.1498 5.35558L17.0296 2.59996C15.1826 0.901848 12.7366 -0.0298855 10.2042 -3.6784e-05C8.3126 -0.000477834 6.45819 0.514732 4.8483 1.48798C3.2384 2.46124 1.93649 3.85416 1.08813 5.51101L4.38775 8.02225C4.79132 6.82005 5.56974 5.77231 6.61327 5.02675C7.6568 4.28118 8.91279 3.87541 10.2042 3.86663Z"
                            fill="#EB4335"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_95:967">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                    Sign in with Google
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
