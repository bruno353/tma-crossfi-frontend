/* eslint-disable @typescript-eslint/prefer-as-const */
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
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { getWorkspace } from '@/utils/api'
import nookies, { parseCookies, setCookie } from 'nookies'

const Workspace = (id: any) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { push } = useRouter()

  async function getData(id: any) {
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    let dado
    try {
      dado = await getWorkspace(data, userSessionToken)
    } catch (err) {
      toast.error(`Not a valid workspace`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      push('/dashboard')
    }

    return dado
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (id) {
      console.log(id)
      console.log(id.id)
      getData(id.id)
    } else {
      push('/dashboard')
    }
  }, [id])

  return (
    <>
      <div>testing</div>
    </>
  )
}

export default Workspace
