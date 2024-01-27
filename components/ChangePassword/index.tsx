/* eslint-disable @typescript-eslint/prefer-as-const */
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
  oldPassword: string
  password: string
  confirmPassword: string
}

type FileListProps = {
  files: File[]
  onRemove(index: number): void
}

const ChangePassword = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false)
  const [logoProfileHadChange, setLogoProfileHadChange] =
    useState<boolean>(false)
  const { user, setUser } = useContext(AccountContext)
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(true)

  const cookies = parseCookies()
  const userHasAnyCookie = cookies.userSessionToken

  const { push } = useRouter()

  const skillOptions = [
    'IoT',
    'Web development',
    'Consultancy',
    'UI / UX',
    'Marketing',
  ]

  const validSchema = Yup.object().shape({
    oldPassword: Yup.string().required('Password is required'),
    password: Yup.string().required('Password is required'),
    confirmPassword: Yup.string().required('Confirm password is required'),
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

  async function handleFileUploadIPFS() {
    const file = selectedFiles[0]
    const formData = new FormData()
    formData.append('file', file)

    // Configurações do axios para a API Pinata
    const pinataAxios = axios.create({
      baseURL: 'https://api.pinata.cloud/pinning/',
      headers: {
        pinata_api_key: `${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
        pinata_secret_api_key: `${process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    const response = await pinataAxios.post('pinFileToIPFS', formData)

    // O hash é o identificador exclusivo do arquivo no IPFS
    const ipfsHash = response.data.IpfsHash

    console.log('File uploaded to IPFS with hash', ipfsHash)

    return ipfsHash
  }

  async function updatePassword(data: any) {
    console.log('chegou a password')
    console.log(data)
    const { userSessionToken } = parseCookies()
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/openmesh-experts/functions/changePassword`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
        'X-Parse-Session-Token': userSessionToken,
        'Content-Type': 'application/json',
      },
      data,
    }

    let dado

    await axios(config).then(function (response) {
      if (response.data) {
        dado = response.data
        console.log(dado)
      }
    })

    return dado
  }

  async function onSubmit(data: RegisterForm) {
    console.log('submitt update called')
    setIsLoading(true)

    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match.')
      console.log('not right password')
      const element = document.getElementById('passwordId')
      element.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setIsLoading(true)

    const { confirmPassword, ...rest } = data

    const finalData = { oldPassword: rest.oldPassword, password: rest.password }

    try {
      const res = await updatePassword(finalData)
      toast.success('Password changed succesfully')
      await new Promise((resolve) => setTimeout(resolve, 2500))
      setIsLoading(false)
      push('/oec')
    } catch (err) {
      console.log(err)
      if (err.response.data.message === 'Email already in use') {
        toast.error('Email already in use')
        const element = document.getElementById('emailId')
        element.scrollIntoView({ behavior: 'smooth' })
      } else {
        toast.error('Incorrect password')
      }
      console.log(err.response.data.message)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsPageLoading(true)
    if (!userHasAnyCookie) {
      push('/oec')
    }
    setIsPageLoading(false)
  }, [user])

  if (isPageLoading) {
    return (
      <section className="px-32 py-16 text-black md:py-20 lg:pt-40">
        <div className="container flex h-60 animate-pulse px-0 pb-12">
          <div className="mr-10 w-3/4 animate-pulse bg-[#1d2144b0]"></div>
          <div className="w-1/4 animate-pulse bg-[#1d2144b0]"></div>
        </div>
        <div className="container h-96 animate-pulse bg-[#1d2144b0] pb-12"></div>
      </section>
    )
  }

  if (user && !isPageLoading) {
    return (
      <>
        <section className="border-b border-[#CFCFCF] px-32 pb-[53px] pt-[50px]">
          <div className="container">
            <div className="-mx-4 flex flex-wrap items-start">
              <div className="w-full px-4 lg:w-2/3">
                <div className="mb-1">
                  <h3 className="text-[15px] font-bold !leading-[150%] text-[#000000] lg:text-[24px]">
                    Change password
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mb-[0px] mt-12 px-[20px] pt-[15px] text-[11px]  font-medium !leading-[17px] text-[#000000] lg:mb-24 lg:px-[100px] lg:pt-[30px]  lg:text-[14px]">
          <div className="flex gap-x-[70px] lg:gap-x-[200px] lg:px-[150px]">
            <form onSubmit={handleSubmit(onSubmit)} className="">
              <div className="">
                <div>
                  <div id="emailId" className="">
                    <div id="passwordId" className="mt-[30px] lg:mt-[60px]">
                      <span className="flex flex-row">
                        Old password
                        <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                          {errors.oldPassword?.message}
                        </p>
                      </span>
                      <div className="flex gap-x-[20px]">
                        <input
                          disabled={isLoading}
                          className="mt-[10px] h-[45px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]"
                          type={passwordVisibility ? 'password' : 'text'}
                          maxLength={100}
                          placeholder=""
                          {...register('oldPassword')}
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
                    <div className="mt-[50px]">
                      <span className="flex flex-row">
                        New password
                        <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                          {errors.password?.message}
                        </p>
                      </span>
                      <input
                        disabled={isLoading}
                        className="mt-[10px] h-[45px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]"
                        type={passwordVisibility ? 'password' : 'text'}
                        maxLength={100}
                        placeholder=""
                        {...register('password')}
                      />
                    </div>
                    <div className="mt-[20px]">
                      <span className="flex flex-row">
                        Confirm password
                        <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                          {errors.confirmPassword?.message}
                        </p>
                      </span>
                      <input
                        disabled={isLoading}
                        className="mt-[10px] h-[45px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]"
                        type={passwordVisibility ? 'password' : 'text'}
                        maxLength={100}
                        placeholder=""
                        {...register('confirmPassword')}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {isLoading ? (
                <div className="mt-[60px] flex pb-[10px] lg:pb-60">
                  <button
                    disabled={true}
                    className=" mr-[15px] h-[50px] w-[250px] rounded-[10px] bg-[#7a89a5] px-[25px] py-[12px] text-[12px] font-bold text-white  lg:text-[16px]"
                    onClick={handleSubmit(onSubmit)}
                  >
                    <span className="">Change password</span>
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
                    className={`h-[50px] w-[250px] rounded-[10px] bg-[#0354EC] px-[25px] py-[12px] text-[12px] font-bold text-white  hover:bg-[#103881] lg:text-[16px]`}
                  >
                    <span className="">Change password</span>
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

export default ChangePassword
