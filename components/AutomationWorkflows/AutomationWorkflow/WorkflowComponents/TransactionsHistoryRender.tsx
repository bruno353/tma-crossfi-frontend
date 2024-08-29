/* eslint-disable @next/next/no-img-element */
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
import { Eye, EyeSlash, SmileySad } from 'phosphor-react'
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
import { UserWorkspaceProps } from '@/types/workspace'
import { BlockchainAppProps } from '@/types/blockchain-app'
import { formatDate } from '@/utils/functions'
import { LLMAppProps } from '@/types/llm'
import { TransactionHistoryWorkflow } from '@/types/automation'

export interface ModalI {
  transactionsHistory: TransactionHistoryWorkflow[]
}

const TransacitonsHistoryRender = ({ transactionsHistory }: ModalI) => {
  function NoAppsFound() {
    return (
      <div className="mx-auto w-fit items-center justify-center text-[15px] font-light">
        <SmileySad size={32} className="text-blue-500 mx-auto  mb-2" />
        <span>
          No transactions found, publish your workflow live and wait for the
          history
        </span>
      </div>
    )
  }

  return (
    <div className="text-[14px] text-[#C5C4C4]">
      <div className=" text-[14px] font-normal">
        <div className="grid gap-y-[25px]">
          {transactionsHistory?.length === 0 ? (
            NoAppsFound()
          ) : (
            <div className="">
              <div className="flex w-full rounded-t-md bg-[#c5c4c40e] px-[15px] py-[8px]">
                <div className="w-full max-w-[40%]">Id</div>
                <div className="w-full max-w-[20%]">Status</div>
                <div className="w-full max-w-[25%]">Description</div>
                <div className="w-full max-w-[15%]">created at</div>
              </div>
              <div className="max-h-[calc(100vh-26rem)] overflow-y-auto rounded-b-md  border border-[#c5c4c41a] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:max-h-[calc(100vh-32rem)] ">
                {' '}
                {transactionsHistory?.map((app, index) => (
                  <div
                    key={index}
                    className={`flex items-center  ${
                      index !== transactionsHistory?.length - 1 &&
                      'border-b-[1px] border-[#c5c4c41a]'
                    } gap-x-[2px] px-[15px] py-[20px] text-[15px] font-normal hover:bg-[#7775840c]`}
                  >
                    <div className="w-full max-w-[40%] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                      {app.id}
                    </div>
                    <div className="w-full max-w-[20%] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                      {app.success ? 'success' : 'failed'}
                    </div>
                    <div className="w-full max-w-[25%] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                      {app.description}
                    </div>
                    <div className="w-full max-w-[15%] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                      {formatDate(app.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransacitonsHistoryRender
