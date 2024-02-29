/* eslint-disable @next/next/no-img-element */
/* eslint-disable no-unused-vars */
import React, { memo, useState, useContext } from 'react'
import { Handle, useReactFlow, useStoreApi, Position } from 'reactflow'
import withProps from './withProps'
import { AccountContext } from '@/contexts/AccountContext'
import { triggerOptions } from '../AutomationWorkflowPage'
import cronstrue from 'cronstrue'

function TriggerNode({
  id,
  data,
  handleNodeRemove,
  handleNodeSelect,
  handleNewNode,
}) {
  const {
    automationWorkflowNodeSelected,
    nodeIsLoading,
    automationWorkflowSelected,
    reactFlowEdges,
    setNodeHasChange,
  } = useContext(AccountContext)

  const [isPlusNode, setIsPlusNode] = useState(false)

  const handleClick = () => {
    handleNodeRemove(id)
  }

  const getCronDescription = (cronExpression) => {
    try {
      return cronstrue.toString(cronExpression)
    } catch (e) {
      return ''
    }
  }

  const nodeValueIndex = triggerOptions?.findIndex(
    (opt) =>
      opt.triggerType ===
      String(automationWorkflowSelected?.nodeTriggerWorkflow?.type),
  )

  const hasEdgeConn = reactFlowEdges?.find((edg) => edg.source === id)

  if (!automationWorkflowSelected?.nodeTriggerWorkflow) {
    return (
      <>
        <div
          className={`relative rounded-[5px]  border-[0.5px] border-[#c5c4c45f] ${
            automationWorkflowNodeSelected === 'trigger' &&
            'border-dashed !border-[#642EE7] '
          } ${
            nodeIsLoading === 'trigger' && 'animate-pulse '
          }  bg-[#060621] px-[50px] py-[15px] text-[10px] 2xl:text-[14px]`}
        >
          <img
            alt="ethereum avatar"
            src="/images/workflows/play.svg"
            className="mx-auto w-[25px] 2xl:w-[30px]"
          ></img>
          <div className="mx-auto text-[#c5c4c49d]">
            Set the trigger in the sidebar
          </div>

          <Handle type="source" position={Position.Right} id={'1'} />
        </div>
      </>
    )
  }

  return (
    <>
      <div
        onClick={() => {
          handleNodeSelect('trigger')
        }}
        className={`relative rounded-[5px]  border-[0.5px] border-[#c5c4c45f] ${
          automationWorkflowNodeSelected === 'trigger' &&
          'border-dashed !border-[#642EE7] '
        } ${
          nodeIsLoading === 'trigger' && 'animate-pulse '
        }  relative w-[200px] bg-[#060621] px-[10px] py-[5px] text-[10px] 2xl:text-[14px]`}
      >
        <div className="flex justify-between gap-x-[10px]">
          <div className="flex gap-x-[5px]">
            <img
              src={triggerOptions?.at(nodeValueIndex)?.imgSource}
              alt="image"
              className={triggerOptions?.at(nodeValueIndex)?.imgStyleBoard}
            />
            <div className=" text-[#fff]">
              {triggerOptions?.at(nodeValueIndex)?.name}
            </div>
          </div>
          <div className="text-[7px] 2xl:text-[10px]">
            {triggerOptions?.at(nodeValueIndex)?.type}
          </div>
        </div>
        <div className="my-[5px] h-[0.5px] w-full bg-[#c5c4c45f]"></div>
        <div className="text-[7px] text-[#c5c4c49d] 2xl:text-[10px]">
          {triggerOptions?.at(nodeValueIndex)?.description}
        </div>
        {automationWorkflowSelected?.nodeTriggerWorkflow?.value && (
          <div className="mt-[5px] text-[7px] text-[#c5c4c49d] 2xl:text-[12px]">
            {' '}
            {automationWorkflowSelected?.nodeTriggerWorkflow?.value} -{' '}
            {getCronDescription(
              automationWorkflowSelected.nodeTriggerWorkflow.value,
            )}
          </div>
        )}
        {!automationWorkflowSelected?.nodeTriggerWorkflow?.value && (
          <img
            alt="ethereum avatar"
            src="/images/workflows/warning.svg"
            className="absolute right-0 top-0 w-[12px] -translate-y-[100%]"
          ></img>
        )}

        <div className="">
          <Handle type="source" position={Position.Bottom} id={'1'} />
          <div
            className={`translate absolute left-0 flex  pt-[2px]  text-[#fff]`}
          >
            {(!hasEdgeConn || automationWorkflowNodeSelected === 'trigger') && (
              <div
                onClick={() => {
                  setNodeHasChange(id)
                }}
                className="cursor-pointer text-[14px] font-light hover:text-[#642EE7]"
              >
                +
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default withProps(TriggerNode, [
  'handleNodeRemove',
  'handleNodeSelect',
  'handleNewNode',
])
