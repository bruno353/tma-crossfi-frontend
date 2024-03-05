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
import { actionOptions, triggerOptions } from '../AutomationWorkflowPage'
import Dropdown, { ValueObject } from '@/components/Modals/Dropdown'
import { actionTypeToClass } from '../../../../types/consts/automation-workflow'
import RenderActionNodeInputs from './RenderActionNodeInputs'
import DeleteNodeModal from '../Modals/DeleteNodeModal'

export interface ModalI {
  automationWorkflowSelected: AutomationWorkflowProps
  automationWorkflowNodeSelected: string
  handleSetTriggerOptionInfo(value: string): void
  handleCreateNode(value: string): void
  handleEditTrigger(value: string): void
  handleDeleteNode(value: string): void
  handleSaveChangesActionNode(data: any, nodeId: string, nodeType: string): void
  handleCancelNewNode(): void
  isLoading: boolean
  triggerOptionInfo: string
}

const SidebarActionNodeWorkflow = ({
  automationWorkflowSelected,
  automationWorkflowNodeSelected,
  handleSetTriggerOptionInfo,
  handleCreateNode,
  handleEditTrigger,
  handleSaveChangesActionNode,
  handleDeleteNode,
  handleCancelNewNode,
  isLoading,
  triggerOptionInfo,
}: ModalI) => {
  const [selectedData, setSelectedData] = useState<any>({})

  const [isEditingNode, setIsEditingNode] = useState<boolean>(false)

  const [isDeleteNodeOpen, setIsDeleteNodeOpen] = useState(false)

  const [hasChanges, setHasChanges] = useState<boolean>(false)
  const [inputsFilled, setInputsFilled] = useState<boolean>(false)

  const deleteNodeRef = useRef(null)

  const node: NodeActionWorkflowProps =
    automationWorkflowSelected?.nodeActionWorkflow.find(
      (nd) => nd['id'] === automationWorkflowNodeSelected,
    )

  const nodeValueIndex = actionOptions?.findIndex(
    (opt) => opt.actionType === String(node?.type),
  )

  let optionWallet = []
  optionWallet = automationWorkflowSelected?.icpWallets?.map((icpWallet) => {
    const newValue = {
      name: `${icpWallet.walletId}`,
      value: icpWallet.id,
    }
    return newValue
  })

  useEffect(() => {
    if (node?.value) {
      console.log('the node value')
      console.log(node?.value)
      setSelectedData(JSON.parse(node?.value))
    }
  }, [node])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        deleteNodeRef.current &&
        !deleteNodeRef.current.contains(event.target)
      ) {
        setIsDeleteNodeOpen(false)
      }
    }

    if (isDeleteNodeOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDeleteNodeOpen])

  return (
    <>
      {(automationWorkflowNodeSelected === 'newNode' || isEditingNode) && (
        <div className="relative h-full w-[30%] overflow-y-auto rounded-r-md bg-[#060621] p-[20px] text-[14px] text-[#C5C4C4] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:text-[16px]">
          <div className="flex justify-between gap-x-[5px]">
            <div>
              <div className="">Next action</div>
              <div className="mt-[5px] text-[11px] text-[#c5c4c49d] 2xl:text-[12px]">
                Set the workflow`s next action
              </div>
            </div>
            {automationWorkflowNodeSelected === 'newNode' && (
              <div
                onClick={() => {
                  handleCancelNewNode()
                }}
                className="h-fit cursor-pointer rounded-md border-[0.5px] border-[#c5c4c45f] px-[8px] py-[3px] text-[11px] hover:bg-[#47474727]"
              >
                Cancel
              </div>
            )}
          </div>
          <div className="mt-[25px]">
            <div>
              <div className="mb-[7px] text-[12px] 2xl:text-[13px]">
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
                    <div className="text-center text-[13px] font-light 2xl:text-[14px]">
                      {option.name}
                    </div>
                    {triggerOptionInfo === option.name && (
                      <div className=" absolute left-0 top-0 w-[200px] -translate-y-[120%] rounded-[10px]  border-[1px] border-[#33323e] bg-[#060621] p-[15px] text-[12px]  font-normal text-[#c5c4c4]">
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
        <div className="h-full w-[30%] overflow-y-auto  rounded-r-md bg-[#060621] p-[20px] text-[14px] text-[#C5C4C4] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:text-[16px]">
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
            <div className="relative flex gap-x-[7px]">
              <div
                onClick={() => {
                  setIsEditingNode(true)
                }}
                className="h-fit cursor-pointer rounded-md border-[0.5px] border-[#c5c4c45f] px-[8px] py-[3px] text-[11px] hover:bg-[#47474727]"
              >
                Edit
              </div>
              <div
                onClick={() => {
                  setIsDeleteNodeOpen(true)
                }}
                className="h-fit cursor-pointer rounded-md border-[0.5px] border-[#c5c4c45f] px-[8px] py-[3px] text-[11px] hover:bg-[#47474727]"
              >
                Delete
              </div>
              {isDeleteNodeOpen && (
                <div
                  ref={deleteNodeRef}
                  className="absolute z-50 -translate-x-[50%]  translate-y-[35%]"
                >
                  <DeleteNodeModal
                    id={node['id']}
                    onUpdateModal={() => {
                      handleDeleteNode(node['id'])
                      setIsDeleteNodeOpen(false)
                    }}
                    onDelete={() => {
                      handleDeleteNode(node['id'])
                      setIsDeleteNodeOpen(false)
                    }}
                  />{' '}
                </div>
              )}
            </div>
          </div>

          <div className="">
            <div className="">
              <RenderActionNodeInputs
                handleChange={(value) => {
                  setHasChanges(true)
                  setSelectedData(value)
                }}
                nodeData={selectedData}
                nodeType={String(node?.type)}
                optionWallet={[
                  { name: 'Select a value', value: '' },
                  ...optionWallet,
                ]}
                automationWorkflowSelected={automationWorkflowSelected}
                inputsFilled={(value) => {
                  setInputsFilled(value)
                }}
              />
              <div
                className={`${
                  !inputsFilled || !hasChanges
                    ? '!cursor-auto !bg-[#c5c4c45f]'
                    : ''
                } ${
                  isLoading
                    ? 'animate-pulse !bg-[#35428a]'
                    : 'cursor-pointer  hover:bg-[#35428a]'
                }  mt-[18px] w-fit rounded-[5px] bg-[#273687] p-[4px] px-[15px] text-[12px] text-[#fff] `}
                onClick={() => {
                  if (!isLoading && hasChanges && inputsFilled) {
                    handleSaveChangesActionNode(
                      selectedData,
                      node.id,
                      String(node?.type),
                    )
                    setHasChanges(false)
                  }
                }}
              >
                Save
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SidebarActionNodeWorkflow
