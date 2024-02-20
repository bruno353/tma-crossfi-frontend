/* eslint-disable @next/next/no-img-element */
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
import { triggerOptions } from './AutomationWorkflowPage'

export interface ModalI {
  automationWorkflowSelected: AutomationWorkflowProps
  automationWorkflowNodeSelected: string
  handleSetTriggerOptionInfo(value: string): void
  handleCreateTrigger(value: string): void
  handleEditTrigger(value: string): void
  triggerOptionInfo: string
}

const SidebarWorkflow = ({
  automationWorkflowSelected,
  automationWorkflowNodeSelected,
  handleSetTriggerOptionInfo,
  handleCreateTrigger,
  handleEditTrigger,
  triggerOptionInfo,
}: ModalI) => {
  const [isEditingTriggerNode, setIsEditingTriggerNode] =
    useState<boolean>(false)
  const nodeValueIndex = triggerOptions?.findIndex(
    (opt) =>
      opt.triggerType ===
      String(automationWorkflowSelected?.nodeTriggerWorkflow?.type),
  )

  return (
    <>
      {((automationWorkflowNodeSelected === 'trigger' &&
        !automationWorkflowSelected?.nodeTriggerWorkflow) ||
        isEditingTriggerNode) && (
        <div className="relative h-full w-[30%] overflow-y-auto rounded-r-md bg-[#060621] p-[20px] text-[14px] text-[#C5C4C4] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
          <div>
            <div className="">Select your trigger</div>
            <div className="mt-[5px] text-[11px] text-[#c5c4c49d]">
              This will be the event that will start the workflow
            </div>
          </div>
          <div className="mt-[25px]">
            <div>
              <div className="mb-[7px] text-[12px]">Jobs</div>
              {triggerOptions.map((option, index) => (
                <div
                  onClick={() => {
                    // handleSidebarClick(option.pathSegment, option.option)
                  }}
                  onMouseEnter={() => {
                    handleSetTriggerOptionInfo(option.name)
                  }}
                  onMouseLeave={() => {
                    handleSetTriggerOptionInfo('')
                  }}
                  key={index}
                  className={`${option.type !== 'Jobs' && 'hidden'}`}
                >
                  <div
                    onClick={() => {
                      // if the trigger was already created, either edit it or go back to the trigger node
                      if (automationWorkflowSelected?.nodeTriggerWorkflow) {
                        if (
                          option.triggerType ===
                          String(
                            automationWorkflowSelected?.nodeTriggerWorkflow
                              ?.type,
                          )
                        ) {
                          setIsEditingTriggerNode(false)
                          handleSetTriggerOptionInfo('')
                        } else {
                          handleEditTrigger(option.triggerType)
                        }
                      }
                      // if not, create the trigger
                      else {
                        handleCreateTrigger(option.triggerType)
                      }
                    }}
                    className={`relative mb-[5px] flex cursor-pointer items-center gap-x-[10px] rounded-[7px] border-[0.5px] border-[#c5c4c423] bg-[#e6e5e51e] px-[10px] py-[9px] hover:bg-[#6f6f6f4b]`}
                  >
                    <img
                      src={option.imgSource}
                      alt="image"
                      className={option.imgStyle}
                    />
                    <div className="text-center text-[13px] font-light">
                      {option.name}
                    </div>
                    {triggerOptionInfo === option.name && (
                      <div className=" absolute left-0 top-0 w-[200px] -translate-y-[120%] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[12px] font-normal text-[#c5c4c4]">
                        <div>{option.description}</div>
                      </div>
                    )}
                    {String(
                      automationWorkflowSelected?.nodeTriggerWorkflow?.type,
                    ) === option.triggerType && (
                      <div className="absolute right-4 my-auto h-[8px] w-[8px] rounded-full bg-[#642EE7]"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {isEditingTriggerNode && (
            <img
              onClick={() => {
                setIsEditingTriggerNode(false)
              }}
              alt="ethereum avatar"
              src="/images/blockchain/arrow-left-black.svg"
              className="absolute right-2 top-2 w-[15px] rotate-180 cursor-pointer 2xl:w-[30px]"
            ></img>
          )}
        </div>
      )}
      {automationWorkflowNodeSelected === 'trigger' &&
        automationWorkflowSelected?.nodeTriggerWorkflow &&
        !isEditingTriggerNode && (
          <div className="h-full w-[30%] overflow-y-auto  rounded-r-md bg-[#060621] p-[20px] text-[14px] text-[#C5C4C4] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
            <div className="flex justify-between gap-x-[5px]">
              <div className="flex gap-x-[5px] text-center">
                <img
                  src={triggerOptions?.at(nodeValueIndex)?.imgSource}
                  alt="image"
                  className={triggerOptions?.at(nodeValueIndex)?.imgStyle}
                />
                <div className="flex items-center">
                  {' '}
                  {triggerOptions?.at(nodeValueIndex)?.name}
                </div>
              </div>
              <div
                onClick={() => {
                  setIsEditingTriggerNode(true)
                }}
                className="cursor-pointer rounded-md border-[0.5px] border-[#c5c4c45f] px-[8px] py-[3px] text-[12px] hover:bg-[#47474727]"
              >
                Edit
              </div>
            </div>

            <div className="mt-[25px]">
              <div>
                <div className="mb-[7px] text-[12px]">Value</div>

                {String(
                  automationWorkflowSelected?.nodeTriggerWorkflow?.type,
                ) === 'CRON' && <div> </div>}
              </div>
            </div>
          </div>
        )}
    </>
  )
}

export default SidebarWorkflow
