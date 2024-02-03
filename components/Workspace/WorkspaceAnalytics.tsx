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
import { SmileySad } from 'phosphor-react'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import {
  changeUserWorkspaceRole,
  createWorkspace,
  inviteUserToWorkspace,
  updateWorkspace,
  updateWorkspaceLogo,
} from '@/utils/api'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { UserWorkspaceProps, WorkspaceProps } from '@/types/workspace'
import UserWorkspaceInfoModal from './UserWorkspaceInfoModal'
import DeleteUserWorkspaceModal from './DeleteUserWorkspaceModal'
import ICPInfoModal from './ICPInfoModal'
import { transformString } from '@/utils/functions'

export interface WorkspaceMembersI {
  workspace: WorkspaceProps
  isUserAdmin: boolean
  onUpdate(): void
}

const WorkspaceAnalytics = ({
  workspace,
  isUserAdmin,
  onUpdate,
}: WorkspaceMembersI) => {
  const [memberEmailToAdd, setMemberEmailToAdd] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState<any>()
  const [isUserModalOpen, setIsUserModalOpen] = useState<any>()

  const [selected, setSelected] = useState<any>('normal')

  const menuRef = useRef(null)

  return (
    <div className="pb-[80px] text-[14px] text-[#C5C4C4]">
      <div className="mt-[50px] flex items-center justify-center text-[16px] font-light">
        <div>
          <SmileySad size={32} className="text-blue-500 mx-auto  mb-2" />
          <div className="mt-[30px]">No data source connected yet</div>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceAnalytics
