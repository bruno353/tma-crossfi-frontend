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
import { UserWorkspaceProps } from '@/types/workspace'
import UserWorkspaceInfoModal from './UserWorkspaceInfoModal'
import DeleteUserWorkspaceModal from './DeleteUserWorkspaceModal'
import DeleteWorkspace from './DeleteWorkspaceModal'
import LeaveWorkspace from './LeaveWorkspaceModal'

export interface WorkspaceSettingsI {
  id: string
  isUserAdmin: boolean
  onUpdate(): void
}

const WorkspaceSettings = ({
  id,
  isUserAdmin,
  onUpdate,
}: WorkspaceSettingsI) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteWorkspaceOpen, setIsDeleteWorkspaceOpen] =
    useState<boolean>(false)
  const [isLeaveWorkspaceOpen, setIsLeaveWorkspaceOpen] =
    useState<boolean>(false)

  const menuRef = useRef(null)
  const menuRef2 = useRef(null)

  const closeMenu = () => {
    setIsDeleteWorkspaceOpen(false)
    setIsLeaveWorkspaceOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Clicked outside of the menu, so close it
        closeMenu()
      }
    }

    // Add event listener when the menu is open
    if (isDeleteWorkspaceOpen || isLeaveWorkspaceOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      // Remove event listener when the menu is closed
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDeleteWorkspaceOpen, isLeaveWorkspaceOpen])

  return (
    <div className="pb-[80px] text-[14px] text-[#C5C4C4]">
      <div className="mt-[50px] text-[18px] font-medium">
        <div className="grid gap-y-[50px]">
          <div>
            <div>Leave workspace</div>
            <div className="mt-[10px] max-w-[600px] rounded-md border-[1px] border-[#cc5563] p-[20px] text-[14px] font-normal text-[#cc5563]">
              You are going to leave the workspace and are not going be able to
              interact with it anymore
            </div>
            <div className="relative w-fit">
              <div
                className={`${
                  isLoading
                    ? 'animate-pulse bg-[#cc556350]'
                    : 'cursor-pointer  hover:bg-[#cc556350]'
                }  mt-[20px] flex w-fit items-center rounded-[5px] border-[1px]  border-[#cc5563] p-[2px] px-[10px] text-center text-[12px] text-[#cc5563] 2xl:text-[14px] `}
                onClick={() => {
                  setIsLeaveWorkspaceOpen(true)
                }}
              >
                Leave Workspace
              </div>
              {isLeaveWorkspaceOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-0 z-50 translate-x-[110%]"
                >
                  <LeaveWorkspace workspaceId={id} onUpdateM={onUpdate} />{' '}
                </div>
              )}
            </div>
          </div>
          {isUserAdmin && (
            <div>
              <div>Delete workspace</div>
              <div className="mt-[10px] max-w-[600px] rounded-md border-[1px] border-[#cc5563] p-[20px] text-[14px] font-normal text-[#cc5563]">
                Permanently remove your Team and all of its contents from the
                Accelar platform. This action is not reversible — please
                continue with caution.
              </div>
              <div className="relative w-fit">
                <div
                  className={`${
                    isLoading
                      ? 'animate-pulse bg-[#cc556350]'
                      : 'cursor-pointer  hover:bg-[#cc556350]'
                  }  mt-[20px] flex w-fit items-center rounded-[5px] border-[1px]  border-[#cc5563] p-[2px] px-[10px] text-center text-[12px] text-[#cc5563] 2xl:text-[14px] `}
                  onClick={() => {
                    setIsDeleteWorkspaceOpen(true)
                  }}
                >
                  Delete Workspace
                </div>
                {isDeleteWorkspaceOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-0 z-50 translate-x-[110%]"
                  >
                    <DeleteWorkspace workspaceId={id} onUpdateM={onUpdate} />{' '}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkspaceSettings
