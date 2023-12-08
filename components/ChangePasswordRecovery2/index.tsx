/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useState, FC, useContext, useEffect } from 'react'
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
import {
  createUser,
  emailRecoverPassword,
  recoverPassword,
  recoverPasswordIdIsValid,
} from '@/utils/api'

const ChangePasswordRecoveryFinal = (id: any) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isValid, setIsValid] = useState<boolean>(false)
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(true)

  const { push } = useRouter()

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
    formState: { errors },
  } = useForm<RecoverPassword>({
    resolver: yupResolver<any>(validSchema),
  })

  async function onSubmit(data: RecoverPassword) {
    setIsLoading(true)

    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match.')
      setIsLoading(false)
      return
    }

    const { confirmPassword, ...finalData } = data

    const final = {
      objectId: id,
      ...finalData,
    }
    try {
      await recoverPassword(final)
      setIsLoading(false)
      toast.error(`Success`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      push('/signin')
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }

  async function checkId(id: any) {
    setIsLoading(true)
    const data = {
      objectId: id,
    }

    try {
      await recoverPasswordIdIsValid(data)
      setIsLoading(false)
      setIsValid(true)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      push('/signin')
    }
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (id) {
      console.log(id)
      console.log(id.id)
      checkId(id.id)
    } else {
      push('/signin')
    }
  }, [id])

  if (!isValid) {
    return (
      <>
        <section className="relative z-10 grid h-full w-full gap-y-[30px] overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
          <div className="container h-40 w-96 animate-pulse bg-dark px-0 pb-12"></div>
          <div className="container h-40 w-96 animate-pulse bg-dark px-0 pb-12"></div>
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
                          New password{' '}
                          <p className="ml-[8px] text-[10px] font-normal text-[#ff0000]">
                            {errors.newPassword?.message}
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
                          {...register('newPassword')}
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
                        Change new password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default ChangePasswordRecoveryFinal
