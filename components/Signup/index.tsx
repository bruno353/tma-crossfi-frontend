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
import nookies, { parseCookies, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
import Link from 'next/link'
import ReCAPTCHA from 'react-google-recaptcha'

import { createHash } from 'crypto'
import ScrollToTop from '../ScrollToTop/index'

type LoginForm = {
  email: string
  password: string
}

const SignUp = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(true)
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false)
  const [isRecaptchaValidated, setIsRecaptchaValidated] =
    useState<boolean>(true)
  const [googleRecaptchaToken, setGoogleRecaptchaToken] = useState()

  function onChange(value) {
    console.log('Captcha value:', value)
    setIsRecaptchaValidated(true)
    setGoogleRecaptchaToken(value)
  }

  const handleCheckboxChange = (event) => {
    setIsCheckboxChecked(event.target.checked)
  }

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
      <section className="relative z-10 overflow-hidden pt-36 pb-16 md:pb-20 lg:pt-[180px] lg:pb-28">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[500px] rounded-md bg-primary bg-opacity-5 py-10 px-6 dark:bg-dark sm:p-[60px]">
                <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                  Create account
                </h3>
                <p className="mb-11 text-center text-base font-medium text-body-color">
                  Free & Fast
                </p>
                <button className="mb-6 flex w-full items-center justify-center rounded-md bg-white p-3 text-base font-medium text-body-color shadow-one hover:text-primary dark:bg-[#242B51] dark:text-body-color dark:shadow-signUp dark:hover:text-white">
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
                  Sign up with Google
                </button>
                <div className="mb-8 flex items-center justify-center">
                  <span className="hidden h-[1px] w-full max-w-[60px] bg-body-color sm:block"></span>
                  <p className="w-full px-5 text-center text-base font-medium text-body-color">
                    Or, register with your email
                  </p>
                  <span className="hidden h-[1px] w-full max-w-[60px] bg-body-color sm:block"></span>
                </div>
                <form>
                  <div className="mb-8">
                    <label
                      htmlFor="name"
                      className="mb-3 block text-sm font-medium text-dark dark:text-white"
                    >
                      {' '}
                      Name{' '}
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                    />
                  </div>
                  <div className="mb-8">
                    <label
                      htmlFor="email"
                      className="mb-3 block text-sm font-medium text-dark dark:text-white"
                    >
                      {' '}
                      Email{' '}
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your Email"
                      className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
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
                      </label>
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

                    <div>
                      <input
                        type={passwordVisibility ? 'password' : 'text'}
                        name="password"
                        placeholder="Enter your Password"
                        className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                      />
                    </div>
                  </div>
                  <div className="mb-8">
                    <label
                      htmlFor="password"
                      className="mb-3 block text-sm font-medium text-dark dark:text-white"
                    >
                      {' '}
                      Confirm password{' '}
                    </label>
                    <input
                      type={passwordVisibility ? 'password' : 'text'}
                      name="password"
                      placeholder="Confirm your Password"
                      className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                    />
                  </div>
                  <div className="mb-8 flex">
                    <label
                      htmlFor="checkboxLabel"
                      className="flex cursor-pointer select-none text-sm font-medium text-body-color"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isCheckboxChecked}
                          onChange={handleCheckboxChange}
                          id="checkboxLabel"
                          className="sr-only"
                        />
                        <div className="box mr-4 mt-1 flex h-5 w-5 items-center justify-center rounded border border-body-color border-opacity-20 dark:border-white dark:border-opacity-10">
                          <span className="opacity-0">
                            <svg
                              width="11"
                              height="8"
                              viewBox="0 0 11 8"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                                fill="#3056D3"
                                stroke="#3056D3"
                                strokeWidth="0.4"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <span>
                        By creating account means you agree to the
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          {' '}
                          Terms and Conditions{' '}
                        </a>
                        , and our
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          {' '}
                          Privacy Policy{' '}
                        </a>
                      </span>
                    </label>
                  </div>
                  <ReCAPTCHA
                    sitekey="6Ld9YR0pAAAAAPaq2xBLMZXyfPdAKMCik2cBVbJ4"
                    onChange={onChange}
                  />
                  <div className="mb-6">
                    <button className="flex w-full items-center justify-center rounded-md bg-primary py-4 px-9 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-opacity-80 hover:shadow-signUp">
                      Sign up
                    </button>
                  </div>
                </form>
                <p className="text-center text-base font-medium text-body-color">
                  Already have an account? <br />
                  <Link href="/signin" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default SignUp
