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

const WorkspaceMembers = ({ onChangeModule }) => {
  const [memberEmailToAdd, setMemberEmailToAdd] = useState()
  const [isLoading, setIsLoading] = useState(null)
  const [selected, setSelected] = useState<any>()

  const optionsMembers = [
    {
      name: 'Member',
      value: 'normal',
    },
    {
      name: 'Admin',
      value: 'admin',
    },
  ]
  const handleInputChange = (e) => {
    if (!isLoading) {
      setMemberEmailToAdd(e.target.value)
    }
  }

  return (
    <div className="text-[14px] text-[#C5C4C4]">
      <div className="">
        <label htmlFor="workspaceName" className="mb-4 block text-[16px]">
          Invite members
        </label>
        <div className="flex gap-x-[20px] h-[40px]">
          <input
            type="text"
            id="workspaceName"
            name="workspaceName"
            maxLength={100}
            placeholder="john.doe@gmail.com"
            value={memberEmailToAdd}
            onChange={handleInputChange}
            className="w-[300px] rounded-md border border-transparent px-6 py-1 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp md:w-[400px]"
          />
          <select
            className="w-[100px] rounded-md bg-[#242B51] bg-transparent px-[5px]"
            onChange={(option) => setSelected(option.target.value)}
            value={selected}
          >
            {optionsMembers.map((option) => (
              <option key={option.name} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
          <div
              className={`${
                isLoading
                  ? 'animate-pulse bg-[#8e68e829]'
                  : 'cursor-pointer  hover:bg-[#8e68e829]'
              }  rounded-[5px] flex  text-center  border-[1px] border-[#642EE7] p-[2px] px-[10px] text-[14px] text-[#642EE7] `}
              onClick={() => {
              }}
            >
              Save
            </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceMembers
