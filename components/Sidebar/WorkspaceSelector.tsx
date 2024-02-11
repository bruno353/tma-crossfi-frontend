'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import { AccountContext } from '../../contexts/AccountContext'
import { getCurrentUser } from '@/utils/api'
import { usePathname, useRouter } from 'next/navigation'
import { UserProps } from '@/types/user'
import { WorkspaceProps } from '@/types/workspace'
import NewWorkspaceModal from '../Dashboard/NewWorkspace'
import { Logo } from './Logo'

export interface MenuI {
  user: UserProps
  currentlyWorkspaceId: string
  onNewWorkspace(): void
}

const WorkspaceSelector = ({
  user,
  currentlyWorkspaceId,
  onNewWorkspace,
}: MenuI) => {
  let finalWorkspaces: WorkspaceProps[] = user.UserWorkspaces.map(
    (workspace) => workspace.workspace,
  )

  // Em seguida, reordenamos para que o workspace com currentlyWorkspaceId venha primeiro, se existir
  finalWorkspaces = finalWorkspaces.sort((a, b) => {
    if (a.id === currentlyWorkspaceId) return -1
    if (b.id === currentlyWorkspaceId) return 1
    return 0
  })

  return (
    <>
      <div className="h-full w-[300px] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] pb-2 text-[14px] font-normal text-[#c5c4c4]">
        <div className="grid gap-y-[20px]">My workspaces</div>
        <div className="my-[7px] h-[1px] w-full bg-[#33323e]"></div>
        <div className="max-h-[250px] min-h-[100px] overflow-y-auto pr-3 scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
          {finalWorkspaces.map((workspace, index) => (
            <Link key={index} href={`/workspace/${workspace.id}`}>
              <div
                className={`my-[5px] flex cursor-pointer items-center gap-x-[12px] rounded-[5px] p-[5px] hover:bg-[#c5c5c510] ${
                  currentlyWorkspaceId === workspace.id && 'bg-[#c5c5c510]'
                }`}
              >
                <div className="flex-shrink-0">
                  <Logo
                    name={workspace.name}
                    workspaceUrl={workspace.finalURL}
                    tamanho={'[25px]'}
                  />
                </div>
                <div className="overflow-hidden truncate text-ellipsis whitespace-nowrap text-[#c5c4c4]">
                  {workspace.name}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="my-[7px] h-[0.5px] w-full bg-[#33323e]"></div>
        <div
          onClick={() => {
            // onSignOut()
          }}
          className="flex w-fit cursor-pointer items-center gap-x-[12px] rounded-[5px] p-[5px] text-[12px] hover:bg-[#c5c5c510]"
        >
          <div
            onClick={() => {
              onNewWorkspace()
            }}
            className="text-[#c5c4c4]"
          >
            + New workspace
          </div>
        </div>
      </div>
    </>
  )
}

export default WorkspaceSelector
