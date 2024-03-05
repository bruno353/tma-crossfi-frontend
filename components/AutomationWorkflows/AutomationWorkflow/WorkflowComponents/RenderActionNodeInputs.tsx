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
import Dropdown, { ValueObject } from '@/components/Modals/Dropdown'

export interface ModalI {
  automationWorkflowSelected: AutomationWorkflowProps
  nodeType: string
  optionWallet: ValueObject[]
  nodeData: any
  handleChange(value: any): void
  inputsFilled(value: boolean): void
}

const RenderActionNodeInputs = ({
  automationWorkflowSelected,
  nodeType,
  optionWallet,
  nodeData,
  handleChange,
  inputsFilled,
}: ModalI) => {
  const [isInfoCanisterId, setIsInfoCanisterId] = useState<boolean>(false)
  const [isInfoMethodNameId, setIsInfoMethodNameId] = useState<boolean>(false)
  const [callArgumentsInfo, setCallArgumentsInfo] = useState<boolean>(false)
  const [isInfoICPCanisterWallet, setIsInfoICPCanisterWallet] =
    useState<boolean>(false)
  const [selectedOptionWallet, setSelectedOptionWallet] = useState<ValueObject>(
    optionWallet?.at(0),
  )

  useEffect(() => {
    if (nodeData?.icpWalletId) {
      const newValue = optionWallet.find(
        (opt) => opt.value === nodeData?.icpWalletId,
      )
      setSelectedOptionWallet(selectedOptionWallet)
    }
  }, [nodeData])

  function inputsFilledTreatment(data: any) {
    console.log('fazendo validacao filled')
    console.log(data)
    const input1 = data.canisterId?.length > 0
    const input2 = data.icpWalletId?.length > 0
    const input3 = data.methodName?.length > 0
    const input4 = data.callArguments?.length > 0
    console.log(input1)
    console.log(input2)
    console.log(input3)
    console.log(input4)
    if (input1 && input2 && input3 && input4) {
      console.log('mudando filled pra true')
      inputsFilled(true)
      return true
    } else {
      return false
    }
  }

  if (nodeType === 'CALL_CANISTER') {
    return (
      <>
        <div className="mt-[25px]">
          <div className="text-[12px] 2xl:text-[13px]">
            <div className="">Inputs</div>
            {!inputsFilledTreatment(nodeData) && (
              <div className="text-[11px] text-[#cc5563] 2xl:text-[12px]">
                Save the inputs to finish the node setup
              </div>
            )}
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
                    <div className="absolute right-0 flex w-[200px] -translate-y-[80%] translate-x-[1%] items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px] ">
                      Set the canister pub id that will be called
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={500}
                  placeholder=""
                  name="cronExpression"
                  value={nodeData?.canisterId}
                  onChange={(event) => {
                    const newData = { ...nodeData }
                    newData.canisterId = event.target.value
                    handleChange(newData)
                    inputsFilledTreatment(newData)
                  }}
                  className={`w-full rounded-md border border-transparent px-6 py-2 text-body-color placeholder-[#c5c4c472]  outline-none focus:border-primary  dark:bg-[#242B51]`}
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
                {optionWallet?.length === 0 ? (
                  <div className="text-[#cc5563]">
                    You have no wallets.{' '}
                    <span
                      // onClick={() => {
                      //   const basePath = pathname.split('/')[1]
                      //   const workspaceId = pathname.split('/')[2]
                      //   const newPath = `/${basePath}/${workspaceId}` // Constrói o novo caminho

                      //   push(newPath)
                      // }}
                      className="cursor-pointer underline underline-offset-2 hover:text-[#0354EC]"
                    >
                      Deploy your first ICP wallet
                    </span>{' '}
                    to continue with a canister creation.
                  </div>
                ) : (
                  <Dropdown
                    optionSelected={selectedOptionWallet}
                    options={optionWallet}
                    onValueChange={(value) => {
                      const newData = { ...nodeData }
                      newData.icpWalletId = value.value
                      handleChange(newData)
                      inputsFilledTreatment(newData)
                      setSelectedOptionWallet(value)
                    }}
                  />
                )}
              </div>
              <div>
                <div className="relative mb-[5px] flex items-center gap-x-[7px]">
                  <div className="">Method name</div>
                  <img
                    alt="ethereum avatar"
                    src="/images/header/help.svg"
                    className="w-[15px] cursor-pointer rounded-full"
                    onMouseEnter={() => setIsInfoMethodNameId(true)}
                    onMouseLeave={() => setIsInfoMethodNameId(false)}
                  ></img>
                  {isInfoMethodNameId && (
                    <div className="absolute right-0 flex w-[200px] -translate-y-[80%] translate-x-[1%] items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
                      Set the method name. Ex: "greet"
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={500}
                  placeholder=""
                  name="cronExpression"
                  value={nodeData?.methodName}
                  onChange={(event) => {
                    const newData = { ...nodeData }
                    newData.methodName = event.target.value
                    handleChange(newData)
                    inputsFilledTreatment(newData)
                  }}
                  className={`w-full rounded-md border border-transparent px-6 py-2 text-body-color placeholder-[#c5c4c472]  outline-none focus:border-primary  dark:bg-[#242B51]`}
                />
              </div>
              <div>
                <div className="relative mb-[5px] flex items-center gap-x-[7px]">
                  <div className="">Call arguments</div>
                  <img
                    alt="ethereum avatar"
                    src="/images/header/help.svg"
                    className="w-[15px] cursor-pointer rounded-full"
                    onMouseEnter={() => setCallArgumentsInfo(true)}
                    onMouseLeave={() => setCallArgumentsInfo(false)}
                  ></img>
                  {callArgumentsInfo && (
                    <div className="absolute right-0 flex w-[200px] -translate-y-[80%] translate-x-[1%] items-center rounded-[6px]   border-[1px]   border-[#cfcfcf81] bg-[#060621]  px-[10px]  py-[7px] text-center text-[12px]">
                      Ex: If the function accept a text and a number: "('bruno',
                      21)"
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={500}
                  placeholder=""
                  name="cronExpression"
                  value={nodeData?.callArguments}
                  onChange={(event) => {
                    const newData = { ...nodeData }
                    newData.callArguments = event.target.value
                    handleChange(newData)
                    inputsFilledTreatment(newData)
                  }}
                  className={`w-full rounded-md border border-transparent px-6 py-2 text-body-color placeholder-[#c5c4c472]  outline-none focus:border-primary  dark:bg-[#242B51]`}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default RenderActionNodeInputs
