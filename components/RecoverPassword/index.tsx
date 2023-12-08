/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useState, FC, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Eye, EyeSlash } from 'phosphor-react'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { AccountContext } from '../../contexts/AccountContext'
import Link from 'next/link'
import ReCAPTCHA from 'react-google-recaptcha'
import { EmailRecoverPassword, SignupForm } from '@/types/user'
import { createUser, emailRecoverPassword } from '@/utils/api'

const SignUp = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [recoverCreated, setRecoverCreated] = useState<boolean>(false)
  const [isRecaptchaValidated, setIsRecaptchaValidated] =
    useState<boolean>(false)
  const [googleRecaptchaToken, setGoogleRecaptchaToken] = useState()

  function onChange(value) {
    console.log('Captcha value:', value)
    setIsRecaptchaValidated(true)
    setGoogleRecaptchaToken(value)
  }

  const validSchema = Yup.object().shape({
    email: Yup.string().max(500).required('Email is required'),
  })
  const {
    register,
    handleSubmit,
    setValue,
    control, // Adicione esta linha
    // eslint-disable-next-line no-unused-vars
    reset,
    formState: { errors },
  } = useForm<EmailRecoverPassword>({
    resolver: yupResolver<any>(validSchema),
  })

  async function onSubmit(data: EmailRecoverPassword) {
    setIsLoading(true)

    const final = {
      googleRecaptchaToken,
      ...data,
    }
    try {
      await emailRecoverPassword(final)
      setIsLoading(false)
      setRecoverCreated(true)
      toast.error(`Success`)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }

  if (recoverCreated) {
    return (
      <>
        <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-[180px] lg:pt-[180px]">
          <div className="container">
            <div className="-mx-4 flex flex-wrap">
              <div className="w-full px-4">
                <div className="mx-auto max-w-[500px] rounded-md bg-primary bg-opacity-5 px-6 py-10 dark:bg-dark sm:p-[60px]">
                  <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                    Password recovery created!
                  </h3>
                  <p className="mt-[20px] text-center text-xl font-medium text-body-color">
                    Check your email to proceed with the password recovery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
        <div className="container">
          <form onSubmit={handleSubmit(onSubmit)} className="">
            <div className="-mx-4 flex flex-wrap">
              <div className="w-full px-4">
                <div className="mx-auto max-w-[500px] rounded-md bg-primary bg-opacity-5 px-6 py-10 dark:bg-dark sm:p-[60px]">
                  <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                    Recover your password
                  </h3>
                  <p className="mb-11 text-center text-base font-medium text-body-color">
                    Enter your email below so we can send you a link with
                    instructions
                  </p>
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
                    <div className="mb-8 w-[50px]">
                      <ReCAPTCHA
                        sitekey="6Ld9YR0pAAAAAPaq2xBLMZXyfPdAKMCik2cBVbJ4"
                        onChange={onChange}
                      />
                    </div>
                    <div className="mb-6">
                      <button
                        disabled={!isRecaptchaValidated}
                        onClick={handleSubmit(onSubmit)}
                        className={`flex w-full items-center justify-center rounded-md bg-primary px-9 py-4 text-base font-medium text-white transition duration-300 ease-in-out
                    ${
                      isLoading
                        ? 'animate-pulse cursor-default bg-[#5970da]'
                        : ' hover:bg-opacity-80 hover:shadow-signUp'
                    }`}
                      >
                        Recover
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
