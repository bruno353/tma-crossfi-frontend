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
import { EmailRecoverPassword, SignupForm, RecoverPassword } from '@/types/user'
import { createUser, emailRecoverPassword } from '@/utils/api'

const RecoverPassword = (id: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isValid, setIsValid] = useState<boolean>(false)
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(true)

  const validSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(8, 'Min of 8 digits')
      .max(500)
      .required('Password is required'),
    confirmPassword: Yup.string().max(500).required('Password is required'),
  })
  const {
    register,
    handleSubmit,
    setValue,
    control, // Adicione esta linha
    // eslint-disable-next-line no-unused-vars
    reset,
    formState: { errors },
  } = useForm<RecoverPassword>({
    resolver: yupResolver<any>(validSchema),
  })

  async function onSubmit(data: RecoverPassword) {
    setIsLoading(true)

    const final = {
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
                    Enter your new password
                  </p>
                  <form>
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
                          disabled={isLoading}
                          maxLength={500}
                          name="password"
                          placeholder="Enter your Password"
                          className="w-full rounded-md border border-transparent px-6 py-3 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                          {...register('password')}
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
                        <p className="ml-[8px] text-[10px] font-normal text-[#ff0000]">
                          {errors.confirmPassword?.message}
                        </p>
                      </label>
                      <input
                        type={passwordVisibility ? 'password' : 'text'}
                        name="password"
                        disabled={isLoading}
                        maxLength={500}
                        placeholder="Confirm your Password"
                        className="w-full rounded-md border border-transparent px-6 py-3 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                        {...register('confirmPassword')}
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

export default RecoverPassword
