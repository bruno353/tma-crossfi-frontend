/* eslint-disable @next/next/no-img-element */
/* eslint-disable no-unused-vars */
import React, { memo, useState, useContext } from 'react'
import { Handle, useReactFlow, useStoreApi, Position } from 'reactflow'
import withProps from './withProps'
import { AccountContext } from '@/contexts/AccountContext'

function TriggerNode({ id, data, handleNodeRemove }) {
  const handleClick = () => {
    handleNodeRemove(id)
  }
  return (
    <>
      <div className="relative rounded-[8px] border-[0.5px] border-dashed border-[#642EE7] bg-[#060621] px-[50px] py-[15px] text-[10px] 2xl:text-[14px]">
        <div className="mx-auto text-[#c5c4c49d]">Set workflow`s trigger</div>

        <Handle type="source" position={Position.Right} id={'1'} />
      </div>
    </>
  )
}

export default withProps(TriggerNode, ['handleNodeRemove'])
