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
      <div className="mt-[50px] text-[18px] font-medium">
        <div>My blockchain wallets</div>
        <div className="mt-[20px] grid gap-y-[25px]">
          <div className="flex items-center gap-x-[10px] text-[15px] font-normal">
            <div className="relative flex items-center gap-x-[10px]">
              <img
                alt="ethereum avatar"
                src="/images/workspace/icp.png"
                className="w-[35px] cursor-pointer rounded-full"
                onMouseEnter={() =>
                  setIsUserModalOpen(workspace.icpWalletPubKId)
                }
                onMouseLeave={() => setIsUserModalOpen(null)}
              ></img>
              <div className="flex w-[250px] gap-x-[15px] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                {transformString(workspace.icpWalletPubKId)}
                <img
                  alt="ethereum avatar"
                  src="/images/workspace/copy.svg"
                  className="w-[20px] cursor-pointer rounded-full"
                ></img>
              </div>
              {isUserModalOpen === workspace.icpWalletPubKId && (
                <div className="absolute -top-[10px] -translate-y-[100%] ">
                  <ICPInfoModal workspace={workspace} />
                </div>
              )}
            </div>
            <div>Balance: 0 ICP</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceAnalytics
