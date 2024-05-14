/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext, useRef } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { parseCookies } from 'nookies'
import { AutomationWorkflowProps } from '@/types/automation'
import { editAutomationWorkflow } from '@/utils/api-automation'
import DeleteWorkflowModal from './DeleteWorkflowModal'

export interface ModalI {
  app: AutomationWorkflowProps
  onUpdateM(): void
  onDelete(): void
  onClose(): void
  isOpen: boolean
}

const EditWorkflowModal = ({
  app,
  onUpdateM,
  onDelete,
  onClose,
  isOpen,
}: ModalI) => {
  const [appName, setAppName] = useState(app.name)
  const [isLoading, setIsLoading] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isDeleteAppOpen, setIsDeleteAppOpen] = useState(false)
  const deleteAppRef = useRef(null)

  const handleInputChange = (e) => {
    if (!isLoading) {
      setHasChanges(true)
      setAppName(e.target.value)
    }
  }

  const handleEditApp = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const final = {
      id: app?.id,
      name: appName,
    }

    try {
      await editAutomationWorkflow(final, userSessionToken)
      setIsLoading(false)
      onUpdateM()
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }
  const modalRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (event) => {
    if (event.target === modalRef.current) {
      onClose()
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        deleteAppRef.current &&
        !deleteAppRef.current.contains(event.target)
      ) {
        setIsDeleteAppOpen(false)
      }
    }

    if (isDeleteAppOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDeleteAppOpen])

  return (
    <div
      onClick={handleOverlayClick}
      className={`fixed  inset-0 z-50 flex items-center justify-center font-normal backdrop-blur-sm ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      } transition-opacity duration-300`}
    >
      <div
        ref={modalRef}
        className="absolute inset-0 bg-[#1c1c3d] opacity-80"
      ></div>
      <div className="relative z-50 w-[250px] rounded-md bg-[#060621] p-8 py-12 md:w-[500px]">
        <div onClick={onClose} className="absolute right-5 top-5">
          <img
            alt="delete"
            src="/images/delete.svg"
            className="w-[25px]  cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921]"
          ></img>
        </div>
        <div className="mb-6">
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            App Id
          </label>
          <input
            type="text"
            maxLength={50}
            id="workspaceName"
            disabled={true}
            name="workspaceName"
            value={app?.id}
            className="w-full rounded-md border border-transparent px-6 py-2 text-base text-body-color placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-[14px] text-[#C5C4C4]"
          >
            App name
          </label>
          <input
            type="text"
            maxLength={50}
            id="workspaceName"
            name="workspaceName"
            value={appName}
            onChange={handleInputChange}
            className="w-full rounded-md border border-transparent px-6 py-2 text-base text-body-color placeholder-body-color  outline-none focus:border-primary  dark:bg-[#242B51]"
          />
        </div>
        <div className="mt-10 flex justify-between">
          <div className="relative">
            {isDeleteAppOpen && (
              <div
                ref={deleteAppRef}
                className="absolute z-50   -translate-x-[100%]  translate-y-[50%]"
              >
                <DeleteWorkflowModal
                  id={app?.id}
                  onUpdateModal={() => {
                    onDelete()
                    setIsDeleteAppOpen(false)
                  }}
                />{' '}
              </div>
            )}
            <div
              className={`${
                isLoading
                  ? 'animate-pulse bg-[#cc556350]'
                  : 'cursor-pointer  hover:bg-[#cc556350]'
              }  rounded-[5px]  border-[1px]  border-[#cc5563] p-[4px] px-[15px] text-[14px] text-[#cc5563] `}
              onClick={() => {
                if (!isLoading) {
                  setIsDeleteAppOpen(true)
                }
              }}
            >
              Delete
            </div>
          </div>

          {hasChanges && (
            <div
              className={`${
                isLoading
                  ? 'animate-pulse !bg-[#35428a]'
                  : 'cursor-pointer  hover:bg-[#35428a]'
              }  ml-auto rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] `}
              onClick={() => {
                if (!isLoading && hasChanges) {
                  handleEditApp()
                }
              }}
            >
              Save
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditWorkflowModal
