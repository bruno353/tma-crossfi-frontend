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
import { Eye, EyeSlash, SmileySad } from 'phosphor-react'
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
import { getUserWorkspace } from '@/utils/api'
import { WorkspaceProps } from '@/types/workspace'

const Start = () => {
  return (
    <>
      <section className="relative z-10 w-full overflow-hidden pb-16 pt-36 text-[16px] md:pb-20 lg:pb-28 lg:pt-[180px]">
        <div className="container flex  text-[#fff] ">
          <div className="mx-auto">
            <img
              src="/images/workspace/chat.svg"
              alt="image"
              className="mx-auto mb-6 w-[42px] rounded-full 2xl:w-[52px]"
            />
            <div className="mx-auto text-[16px] 2xl:text-[18px]">
              Create or select a channel to start a conversation
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Start
