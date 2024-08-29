/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
// new
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
import { createWorkspace } from '@/utils/api'
import { parseCookies } from 'nookies'
import { optionsStandardFinancial, workflowOptions } from '@/utils/consts'
import Dropdown, { ValueObject } from '../Modals/Dropdown'

const NewWorkspaceModal = ({ isOpen, onClose }) => {
  const [workspaceName, setWorkspaceName] = useState('')
  const [triggerOptionInfo, setTriggerOptionInfo] = useState('')
  const [workspaceTemplate, setWorkspaceTemplate] = useState<any>()
  const [selectedStandard, setSelectedStandard] = useState<ValueObject>(
    optionsStandardFinancial[0],
  )

  const [selectedImage, setSelectedImage] = useState(null)
  const [nextStep, setNextStep] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const fileInputRef = useRef(null)

  const { push } = useRouter()

  const handleInputChange = (e) => {
    if (!isLoading) {
      setWorkspaceName(e.target.value)
    }
  }

  const modalRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (event) => {
    if (event.target === modalRef.current) {
      onClose()
    }
  }

  const handleFileChange = (e) => {
    if (isLoading) return

    const file = e.target.files[0]
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  function inputsFilled() {
    if (workspaceName.length > 0) {
      return true
    } else {
      return false
    }
  }

  const handleCreateWorkspace = async () => {
    setIsLoading(true)

    const { userSessionToken } = parseCookies()

    const formData = new FormData()
    formData.append('name', workspaceName)
    formData.append('files', selectedFile)
    formData.append('WorkspaceType', workspaceTemplate.type)

    try {
      const res = await createWorkspace(formData, userSessionToken)
      setIsLoading(false)
      push(`/workspace/${res?.id}`)
      onClose()
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }

  return (
    <div
      onClick={handleOverlayClick}
      className={`fixed  inset-0 z-50 flex items-center justify-center font-normal text-[#C5C4C4] backdrop-blur-sm ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      } transition-opacity duration-300`}
    >
      <div
        ref={modalRef}
        className="absolute inset-0 bg-[#1c1c3d] opacity-80"
      ></div>
      {!nextStep ? (
        <div className="relative z-50 w-[250px] rounded-md bg-[#060621] p-8 py-8 pb-10 md:w-[500px]">
          <div onClick={onClose} className="absolute right-5 top-5">
            <img
              alt="delete"
              src="/images/delete.svg"
              className="w-[25px]  cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921]"
            ></img>
          </div>
          <h2 className="mb-1 text-lg">New Workspace</h2>
          <div className="text-[12px] text-[#c5c4c49d] 2xl:text-[14px]">
            Select the workspace type
          </div>
          <div className="mt-[30px] grid gap-y-[20px]">
            {workflowOptions.map((option, index) => (
              <div
                onClick={() => {
                  // handleSidebarClick(option.pathSegment, option.option)
                }}
                onMouseEnter={() => {
                  setTriggerOptionInfo(option.name)
                }}
                onMouseLeave={() => {
                  setTriggerOptionInfo('')
                }}
                key={index}
              >
                <div
                  onClick={() => {
                    setWorkspaceTemplate(option)
                    setTriggerOptionInfo('')
                    setNextStep(true)
                  }}
                  className={`relative flex cursor-pointer items-center gap-x-[10px] rounded-[7px] border-[0.5px] border-[#c5c4c423] bg-[#e6e5e510] px-[10px] py-[9px] hover:bg-[#6f6f6f4b]`}
                >
                  <img
                    src={option.imgSource}
                    alt="image"
                    className={option.imgStyle}
                  />
                  <div className="text-center text-[13px] font-light 2xl:text-[14px]">
                    {option.name}
                  </div>
                  {triggerOptionInfo === option.name && (
                    <div className=" absolute right-0 top-0 w-[300px] -translate-y-[120%] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[12px]  font-normal text-[#c5c4c4]">
                      <div>{option.description}</div>
                    </div>
                  )}
                  {workspaceTemplate === option && (
                    <div className="absolute right-4 my-auto h-[8px] w-[8px] rounded-full bg-[#642EE7]"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative z-50 w-[250px] rounded-md bg-[#060621] p-8 py-8 md:w-[500px]">
          <div onClick={onClose} className="absolute right-5 top-5">
            <img
              alt="delete"
              src="/images/delete.svg"
              className="w-[25px]  cursor-pointer rounded-[7px] p-[5px] hover:bg-[#c9c9c921]"
            ></img>
          </div>
          <div className="mb-6 flex items-center gap-x-[8px] ">
            <img
              src={workspaceTemplate?.imgSource}
              alt="image"
              className={`${
                workspaceTemplate.type === 'DEVELOPMENT'
                  ? 'w-[25px]'
                  : 'w-[28px]'
              }`}
            />
            <h2 className="text-lg">New Workspace</h2>
          </div>
          <div>
            <label
              htmlFor="workspaceName"
              className="mb-2 block text-[14px] text-[#C5C4C4]"
            >
              Workspace logo
            </label>
          </div>
          <div
            className="groupLogo group relative mb-6 h-fit w-[60px] cursor-pointer"
            onClick={handleImageClick}
          >
            {selectedImage ? (
              <>
                <img
                  src={selectedImage}
                  className="w-[60px] rounded-full transition duration-300 ease-in-out group-hover:opacity-10"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 ease-in-out group-hover:opacity-100">
                  <img
                    src="/images/dashboard/pencil.svg"
                    className="mb-1 w-[30px] rounded-full"
                  />
                </div>
              </>
            ) : (
              <>
                <img
                  src="/images/dashboard/work.webp"
                  className="w-[60px] rounded-full transition duration-300 ease-in-out group-hover:opacity-10"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 ease-in-out group-hover:opacity-100">
                  <img
                    src="/images/dashboard/pencil.svg"
                    className="mb-1 w-[30px] rounded-full"
                  />
                </div>
              </>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".png, .jpg, .jpeg, .svg, .webp"
              style={{ display: 'none' }}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="workspaceName"
              className="mb-2 block text-[14px] text-[#C5C4C4]"
            >
              Workspace name
            </label>
            <input
              type="text"
              id="workspaceName"
              name="workspaceName"
              value={workspaceName}
              onChange={handleInputChange}
              className="w-full rounded-md border border-transparent px-6 py-2 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
            />
          </div>
          {/* <div className="mb-4">
            <label
              htmlFor="workspaceName"
              className="mb-2 block text-[14px] text-[#C5C4C4]"
            >
              Standard
            </label>
            <Dropdown
              optionSelected={selectedStandard}
              options={optionsStandardFinancial}
              onValueChange={(value) => {
                setSelectedStandard(value)
              }}
            />
          </div> */}
          <div className="mt-10 flex justify-between">
            <img
              onClick={() => {
                setNextStep(false)
              }}
              alt="ethereum avatar"
              src="/images/blockchain/arrow-left-black.svg"
              className="w-[25px] cursor-pointer"
            ></img>
            <div
              className={`${
                !inputsFilled()
                  ? 'cursor-auto bg-[#273687] opacity-40'
                  : `cursor-pointer ${
                      isLoading
                        ? 'animate-pulse bg-[#35428a]'
                        : 'bg-[#273687] hover:bg-[#35428a]'
                    }`
              } rounded-[5px] p-[4px] px-[15px] text-[14px] text-[#fff]`}
              onClick={() => {
                if (inputsFilled() && !isLoading) {
                  handleCreateWorkspace()
                }
              }}
            >
              Create
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewWorkspaceModal
