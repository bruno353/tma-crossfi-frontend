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
import {
  AutomationWorkflowProps,
  NodeActionWorkflowProps,
} from '@/types/automation'
import { editAutomationWorkflow } from '@/utils/api-automation'
import { actionOptions, triggerOptions } from './AutomationWorkflowPage'
import Dropdown, { ValueObject } from '@/components/Modals/Dropdown'

export interface ModalI {
  automationWorkflowSelected: AutomationWorkflowProps
  automationWorkflowNodeSelected: string
  handleSetTriggerOptionInfo(value: string): void
  handleCreateNode(value: string): void
  handleEditTrigger(value: string): void
  handleSaveChangesCronTrigger(
    selectedCronExpressionTemplate?: ValueObject,
    cronExpression?: string,
  ): void
  isLoading: boolean
  triggerOptionInfo: string
}

export const optionsCRONType = [
  { name: 'Select a value', value: '' },
  {
    name: 'Every 1 hour',
    value: '0 * * * *',
  },
  {
    name: 'Every day at midnight',
    value: '0 0 * * *',
  },
  {
    name: 'Every month at 1st',
    value: '0 0 1 * *',
  },
]

const SidebarActionNodeWorkflow = ({
  automationWorkflowSelected,
  automationWorkflowNodeSelected,
  handleSetTriggerOptionInfo,
  handleCreateNode,
  handleEditTrigger,
  handleSaveChangesCronTrigger,
  isLoading,
  triggerOptionInfo,
}: ModalI) => {
  const [isEditingNode, setIsEditingNode] = useState<boolean>(false)
  const [selectedCronExpressionTemplate, setSelectedCronExpressionTemplate] =
    useState<ValueObject>(optionsCRONType[0])
  const [cronExpression, setCronExpression] = useState<string>(
    automationWorkflowSelected?.nodeTriggerWorkflow?.value || '',
  )
  const [hasChanges, setHasChanges] = useState<boolean>(false)
  const [isInfoCanisterId, setIsInfoCanisterId] = useState<boolean>(false)
  const [isInfoICPCanisterWallet, setIsInfoICPCanisterWallet] =
    useState<boolean>(false)

  const node: NodeActionWorkflowProps =
    automationWorkflowSelected.nodeActionWorkflow.find(
      (nd) => nd.id === automationWorkflowNodeSelected,
    )

  const nodeValueIndex = actionOptions?.findIndex(
    (opt) => opt.actionType === String(node?.type),
  )

  useEffect(() => {
    if (automationWorkflowSelected?.nodeTriggerWorkflow?.value) {
      setCronExpression(automationWorkflowSelected?.nodeTriggerWorkflow?.value)
      const findValue = optionsCRONType.findIndex(
        (opt) =>
          opt.value === automationWorkflowSelected?.nodeTriggerWorkflow?.value,
      )
      if (findValue !== -1) {
        setSelectedCronExpressionTemplate(optionsCRONType[findValue])
      }
    }
  }, [automationWorkflowSelected])

  return (
    <>
      {(automationWorkflowNodeSelected === 'newNode' || isEditingNode) && (
        <div className="relative h-full w-[30%] overflow-y-auto rounded-r-md bg-[#060621] p-[20px] text-[14px] text-[#C5C4C4] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
          <div>
            <div className="">Next action</div>
            <div className="mt-[5px] text-[11px] text-[#c5c4c49d]">
              Set the workflow`s next action
            </div>
          </div>
          <div className="mt-[25px]">
            <div>
              <div className="mb-[7px] text-[12px]">
                Internet Computer Protocol
              </div>
              {actionOptions.map((option, index) => (
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
                  className={`${
                    option.type !== 'Internet Computer Protocol' && 'hidden'
                  }`}
                >
                  <div
                    onClick={() => {
                      // if the node was already created, either edit it or go back to the node
                      if (node) {
                        if (
                          option.actionType ===
                          String(
                            automationWorkflowSelected?.nodeTriggerWorkflow
                              ?.type,
                          )
                        ) {
                          setIsEditingNode(false)
                          handleSetTriggerOptionInfo('')
                        } else {
                          handleEditTrigger(option.actionType)
                        }
                      }
                      // if not, create the node
                      else {
                        handleCreateNode(option.actionType)
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
                    ) === option.actionType && (
                      <div className="absolute right-4 my-auto h-[8px] w-[8px] rounded-full bg-[#642EE7]"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {isEditingNode && (
            <img
              onClick={() => {
                setIsEditingNode(false)
              }}
              alt="ethereum avatar"
              src="/images/blockchain/arrow-left-black.svg"
              className="absolute right-2 top-2 w-[15px] rotate-180 cursor-pointer 2xl:w-[30px]"
            ></img>
          )}
        </div>
      )}
      {automationWorkflowNodeSelected !== 'newNode' && !isEditingNode && (
        <div className="h-full w-[30%] overflow-y-auto  rounded-r-md bg-[#060621] p-[20px] text-[14px] text-[#C5C4C4] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
          <div className="flex justify-between gap-x-[5px]">
            <div className="flex gap-x-[5px] text-center">
              <img
                src={actionOptions?.at(nodeValueIndex)?.imgSource}
                alt="image"
                className={actionOptions?.at(nodeValueIndex)?.imgStyle}
              />
              <div className="flex items-center">
                {' '}
                {actionOptions?.at(nodeValueIndex)?.name}
              </div>
            </div>
            <div
              onClick={() => {
                setIsEditingNode(true)
              }}
              className="cursor-pointer rounded-md border-[0.5px] border-[#c5c4c45f] px-[8px] py-[3px] text-[12px] hover:bg-[#47474727]"
            >
              Edit
            </div>
          </div>

          <div className="mt-[25px]">
            <div className="text-[12px]">
              <div className="">Inputs</div>
              {!automationWorkflowSelected?.nodeTriggerWorkflow?.value && (
                <div className="text-[11px] text-[#cc5563]">
                  Save the inputs to finish the node setup
                </div>
              )}
              {String(node.type) === 'CALL_CANISTER' && (
                <div className="mt-[15px] grid gap-y-[12px] text-[#c5c4c49d]">
                  <div>
                    <div className="relative mb-[5px] flex items-center gap-x-[7px]">
                      <div className="">Canister Id</div>
                      <img
                        alt="ethereum avatar"
                        src="/images/header/help.svg"
                        className="w-[15px] cursor-pointer rounded-full"
                        onMouseEnter={() => setIsInfoCanisterId(true)}
                        onMouseLeave={() => setIsInfoCanisterId(false)}
                      ></img>
                      {isInfoCanisterId && (
                        <div className="absolute right-0 flex w-[200px] -translate-y-[80%] translate-x-[1%] items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
                          Set the canister pub id that will be called
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={500}
                      placeholder=""
                      name="cronExpression"
                      value={cronExpression}
                      onChange={(event) => {
                        setHasChanges(true)
                        setCronExpression(event.target.value)
                      }}
                      className={`w-full rounded-md border border-transparent px-6 py-2 text-body-color placeholder-[#c5c4c472]  outline-none focus:border-primary  dark:bg-[#242B51] ${
                        cronExpression && '!border-primary'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="relative mb-[5px] flex items-center gap-x-[7px]">
                      <div className="">ICP canister-wallet</div>
                      <img
                        alt="ethereum avatar"
                        src="/images/header/help.svg"
                        className="w-[15px] cursor-pointer rounded-full"
                        onMouseEnter={() => setIsInfoICPCanisterWallet(true)}
                        onMouseLeave={() => setIsInfoICPCanisterWallet(false)}
                      ></img>
                      {isInfoICPCanisterWallet && (
                        <div className="absolute right-0 flex w-[200px] -translate-y-[80%] translate-x-[1%] items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
                          Select the ICP wallet that will be deploying this
                          canister. Ensure it's enough cycles{' '}
                        </div>
                      )}
                    </div>
                    <Dropdown
                      optionSelected={selectedCronExpressionTemplate}
                      options={optionsCRONType}
                      onValueChange={(value) => {
                        setHasChanges(true)
                        setCronExpression('')
                        setSelectedCronExpressionTemplate(value)
                      }}
                    />
                  </div>
                </div>
              )}
              {(hasChanges ||
                !automationWorkflowSelected?.nodeTriggerWorkflow?.value) && (
                <div
                  className={`${
                    isLoading
                      ? 'animate-pulse !bg-[#35428a]'
                      : 'cursor-pointer  hover:bg-[#35428a]'
                  }  mt-[25px] w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[12px] text-[#fff] `}
                  onClick={() => {
                    if (
                      !isLoading &&
                      (hasChanges ||
                        !automationWorkflowSelected?.nodeTriggerWorkflow?.value)
                    ) {
                      handleSaveChangesCronTrigger(
                        selectedCronExpressionTemplate,
                        cronExpression,
                      )
                      setHasChanges(false)
                    }
                  }}
                >
                  Save
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SidebarActionNodeWorkflow
