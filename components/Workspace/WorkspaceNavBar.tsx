/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext, useRef } from 'react'
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
import {
  createWorkspace,
  updateWorkspace,
  updateWorkspaceLogo,
} from '@/utils/api'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'

export interface SubNavBarI {
  selected: string
  itensList: string[]
  onChange(string): void
}

const SubNavBar = ({ onChange, selected, itensList }: SubNavBarI) => {
  return (
    <div className="flex w-fit cursor-pointer  px-[15px] text-[#C5C4C4]">
      {itensList?.length > 0 &&
        itensList?.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              onChange(item)
            }}
            className={`border-b-[1.2px]  px-[15px] pb-[5px] hover:border-[#642EE7] ${
              selected === item
                ? 'border-[#642EE7] text-[#642EE7]'
                : 'border-[#908f8f]'
            }`}
          >
            {item}
          </div>
        ))}
    </div>
  )
}

export default SubNavBar
