'use client'
import { useEffect, useState, useContext } from 'react'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
import {
  acceptInviteUserToWorkspace,
  getCurrentUser,
  setInviteUserToWorkspaceViewed,
} from '@/utils/api'
import { usePathname, useRouter } from 'next/navigation'
import { UserProps } from '@/types/user'
import { WorkspaceInviteProps } from '@/types/workspace'
import InviteModal from './InviteModal'
import { formatDeadline } from '@/utils/functions'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export interface NotificationMenuI {
  user: UserProps
  workspaceInvites: WorkspaceInviteProps[]
  onSignOut(): void
}

const NotificationMenu = ({
  user,
  onSignOut,
  workspaceInvites,
}: NotificationMenuI) => {
  const [workspaceSelected, setWorkspaceSelected] =
    useState<WorkspaceInviteProps>()
  const [isLoading, setIsLoading] = useState(false)
  const [localWorkspacesViewed, setLocalWorkspacesViewed] = useState([]) // utilized to store locally when a workspace has been viewed

  const handleClickInvite = (workspace: WorkspaceInviteProps) => {
    if (!isLoading) {
      setWorkspaceSelected(workspace)
      handleSetInviteUserToWorkspaceViewed(workspace.id)
    }
  }

  const handleJoinWorkspace = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const data = {
      id: workspaceSelected.id,
    }

    try {
      await acceptInviteUserToWorkspace(data, userSessionToken)
      setIsLoading(false)
      toast.success(`Success`)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  const handleSetInviteUserToWorkspaceViewed = async (id: string) => {
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    try {
      await setInviteUserToWorkspaceViewed(data, userSessionToken)
      handleLocalWorkspaceViewed(id)
    } catch (err) {
      console.log(err)
    }
  }

  const handleLocalWorkspaceViewed = (id: string) => {
    if (!localWorkspacesViewed.includes(id)) {
      setLocalWorkspacesViewed([id, ...localWorkspacesViewed])
    }
  }

  return (
    <>
      <div className="h-full max-h-[500px] w-[400px] overflow-y-auto rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[14px] font-normal text-[#c5c4c4]">
        <div className="my-[20px] h-[1px] w-full bg-[#33323e]"></div>
        {workspaceInvites?.map((workspace, index) => (
          <div
            onClick={() => {
              handleClickInvite(workspace)
            }}
            key={index}
            className="flex cursor-pointer items-center gap-x-[12px] rounded-[5px] p-[5px] py-[20px] hover:bg-[#c5c5c510]"
          >
            <div
              className={`h-[10px] w-[10px] flex-shrink-0 rounded-full  ${
                workspace.viewed || localWorkspacesViewed.includes(workspace.id)
                  ? 'bg-[#c5c4c4]'
                  : 'bg-[#3415fa]'
              }`}
            ></div>
            <div className="text-[#c5c4c4]">
              <div>
                You have been invited to join {workspace?.workspace?.name}
              </div>
              <div className="mt-[2px] text-[11px]">
                {formatDeadline(workspace?.createdAt)}
              </div>
              {workspaceSelected?.id === workspace?.id && (
                <div>
                  {' '}
                  <div className="mb-4 mt-1 text-[11px]">
                    Invited by: {workspace?.user?.email}
                  </div>
                  <div
                    className={`${
                      isLoading
                        ? 'animate-pulse bg-[#8e68e829]'
                        : 'cursor-pointer  hover:bg-[#8e68e829]'
                    }  w-fit rounded-[5px] border-[1px] border-[#642EE7] p-[2px] px-[10px] text-[11px]  text-[#642EE7] `}
                    onClick={() => {
                      console.log(localWorkspacesViewed)
                    }}
                  >
                    Join workspace
                  </div>{' '}
                </div>
              )}
            </div>
            <div className="ml-auto mr-[5px] cursor-pointer p-[5px] text-[12px] hover:text-[#bc1212]">
              X
            </div>
          </div>
        ))}
        <div className="my-[20px] h-[0.5px] w-full bg-[#33323e]"></div>
      </div>
    </>
  )
}

export default NotificationMenu
