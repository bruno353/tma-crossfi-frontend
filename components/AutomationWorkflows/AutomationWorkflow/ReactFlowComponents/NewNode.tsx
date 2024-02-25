/* eslint-disable @next/next/no-img-element */
/* eslint-disable no-unused-vars */
import React, { memo, useState, useContext } from 'react'
import { Handle, useReactFlow, useStoreApi, Position } from 'reactflow'
import withProps from './withProps'
import { AccountContext } from '@/contexts/AccountContext'
import { triggerOptions } from '../AutomationWorkflowPage'
import cronstrue from 'cronstrue'

function NewNode({
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
    setAutomationWorkflowNodeSelected,
  } = useContext(AccountContext)

  const [isPlusNode, setIsPlusNode] = useState(false)

  const handleClick = () => {
    handleNodeRemove(id)
  }

  return (
    <div
      onClick={() => {
        handleNodeSelect('newNode')
        setAutomationWorkflowNodeSelected('newNode')
      }}
      className={`relative rounded-[5px]  border-[0.5px] border-[#c5c4c45f] ${
        automationWorkflowNodeSelected === 'newNode' &&
        'border-dashed !border-[#642EE7] '
      } ${
        nodeIsLoading === 'trigger' && 'animate-pulse '
      }  bg-[#060621] px-[50px] py-[15px] text-[10px] 2xl:text-[14px]`}
    >
      <div className="mx-auto text-[#c5c4c49d]">+</div>
      <Handle type="target" position={Position.Left} id={'1'} />
    </div>
  )
}

export default withProps(NewNode, [
  'handleNodeRemove',
  'handleNodeSelect',
  'handleNewNode',
])
