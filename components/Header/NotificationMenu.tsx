'use client'
import { useEffect, useState, useContext } from 'react'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
import {
  acceptInviteUserToWorkspace,
  getCurrentUser,
  setInviteUserToWorkspaceArchived,
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
  onCloseNotifications(): void
}

const NotificationMenu = ({
  user,
  onSignOut,
  workspaceInvites,
  onCloseNotifications,
}: NotificationMenuI) => {
  const [workspaceSelected, setWorkspaceSelected] =
    useState<WorkspaceInviteProps>()
  const [isLoading, setIsLoading] = useState(false)
  const [localWorkspacesViewed, setLocalWorkspacesViewed] = useState([]) // utilized to store locally when a workspace has been viewed
  const [localWorkspacesArchived, setLocalWorkspacesArchived] = useState([]) // utilized to store locally when a workspace has been viewed

  const { push } = useRouter()

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
      onCloseNotifications()
      push(`workspace/${workspaceSelected.workspaceId}`)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  const handleSetInviteUserToWorkspaceArchived = async (id: string) => {
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    try {
      handleLocalWorkspaceArchived(id)
      await setInviteUserToWorkspaceArchived(data, userSessionToken)
    } catch (err) {
      console.log(err)
    }
  }
  const handleLocalWorkspaceArchived = (id: string) => {
    if (!localWorkspacesArchived.includes(id)) {
      setLocalWorkspacesArchived([id, ...localWorkspacesArchived])
    }
  }

  const handleSetInviteUserToWorkspaceViewed = async (id: string) => {
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    try {
      handleLocalWorkspaceViewed(id)
      await setInviteUserToWorkspaceViewed(data, userSessionToken)
    } catch (err) {
      console.log(err)
    }
  }

  const handleLocalWorkspaceViewed = (id: string) => {
    if (!localWorkspacesViewed.includes(id)) {
      setLocalWorkspacesViewed([id, ...localWorkspacesViewed])
    }
  }

  const finalWorkspaceInvites = workspaceInvites.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <>
      <div className="h-full max-h-[500px] w-[400px] overflow-y-auto rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[14px] font-normal text-[#c5c4c4]">
        <div className="my-[20px] h-[1px] w-full bg-[#33323e]"></div>
        {finalWorkspaceInvites?.map((workspace, index) => (
          <div
            onClick={() => {
              handleClickInvite(workspace)
            }}
            key={index}
            className={`cursor-pointer ${
              localWorkspacesArchived.includes(workspace.id) ? 'hidden' : 'flex'
            } items-center gap-x-[12px] rounded-[5px] p-[5px] py-[20px] hover:bg-[#c5c5c510]`}
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
                      handleJoinWorkspace()
                    }}
                  >
                    Join workspace
                  </div>{' '}
                </div>
              )}
            </div>
            <img
              alt="delete"
              onClick={() => {
                handleSetInviteUserToWorkspaceArchived(workspace.id)
              }}
              src="/images/delete.svg"
              className="ml-auto  mr-[5px] w-[25px] cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921]"
            ></img>
          </div>
        ))}
        <div className="my-[20px] h-[0.5px] w-full bg-[#33323e]"></div>
      </div>
    </>
  )
}

export default NotificationMenu
