/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './reactflow-overrides.css' // Ajuste o caminho conforme necessário
import SidebarWorkflow from './SidebarWorkflow'
import SidebarActionNodeWorkflow from './SidebarActionNodeWorkflow'

export interface ModalI {
  nodes: any
  reactFlowEdges: any
  onConnect: any
  onInit: any
  nodeTypes: any
  automationWorkflowNodeSelected: any
  automationWorkflowSelected: any
  editTrigger: any
  createTrigger: any
  setTriggerOptionInfo: any
  triggerOptionInfo: any
  nodeIsLoading: any
  handleSaveChangesCronTrigger: any
  createActionNode: any
  arrangeNodes: any
  setAutomationWorkflowNodeSelected: any
  handleSaveChangesActionNode: any
  handleDeleteNode: any
  workflowReadyToPublish: any
  publishWorkflow: any
}

const Board = ({
  nodes,
  reactFlowEdges,
  onConnect,
  onInit,
  nodeTypes,
  automationWorkflowNodeSelected,
  automationWorkflowSelected,
  editTrigger,
  createTrigger,
  setTriggerOptionInfo,
  triggerOptionInfo,
  nodeIsLoading,
  handleSaveChangesCronTrigger,
  createActionNode,
  arrangeNodes,
  setAutomationWorkflowNodeSelected,
  handleSaveChangesActionNode,
  handleDeleteNode,
  workflowReadyToPublish,
  publishWorkflow,
}: ModalI) => {
  return (
    <div className="h-full overflow-y-auto pb-[20px] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:pb-[40px]">
      <div className="relative flex h-full w-full rounded-md  border-[0.5px] border-[#c5c4c45f] bg-[#1D2144]">
        <ReactFlow
          nodes={nodes}
          edges={reactFlowEdges}
          proOptions={{
            hideAttribution: true,
          }}
          // onNodesChange={}
          // onEdgesChange={}
          onConnect={onConnect}
          onInit={onInit}
          fitView
          attributionPosition="top-right"
          nodeTypes={nodeTypes}
        >
          <div className="absolute  bottom-[5%]">
            <Controls />
          </div>
          <Background gap={16} />
        </ReactFlow>
        {automationWorkflowNodeSelected === 'trigger' && (
          <SidebarWorkflow
            automationWorkflowSelected={automationWorkflowSelected}
            automationWorkflowNodeSelected={automationWorkflowNodeSelected}
            handleEditTrigger={editTrigger}
            handleCreateTrigger={createTrigger}
            handleSetTriggerOptionInfo={setTriggerOptionInfo}
            triggerOptionInfo={triggerOptionInfo}
            isLoading={!!nodeIsLoading}
            handleSaveChangesCronTrigger={handleSaveChangesCronTrigger}
          />
        )}
        {automationWorkflowNodeSelected !== 'trigger' &&
          automationWorkflowNodeSelected?.length > 0 && (
            <SidebarActionNodeWorkflow
              key={automationWorkflowNodeSelected}
              automationWorkflowSelected={automationWorkflowSelected}
              automationWorkflowNodeSelected={automationWorkflowNodeSelected}
              handleEditTrigger={editTrigger}
              handleCreateNode={createActionNode}
              handleCancelNewNode={() => {
                arrangeNodes(automationWorkflowSelected)
                setAutomationWorkflowNodeSelected('')
              }}
              handleSetTriggerOptionInfo={setTriggerOptionInfo}
              triggerOptionInfo={triggerOptionInfo}
              isLoading={!!nodeIsLoading}
              handleSaveChangesActionNode={handleSaveChangesActionNode}
              handleDeleteNode={handleDeleteNode}
            />
          )}
        {!automationWorkflowSelected?.activated ? (
          <div className="absolute top-0 ml-5 mt-2 flex h-fit justify-between gap-x-[20px] rounded-md border-[0.5px]  border-[#c5c4c45f]  bg-[#242B51] px-3 py-2 text-[11px] 2xl:text-[13px]">
            <div className="flex items-center">
              The workflow had changes, finish the nodes setup and publish it to
              get the workflow running live
            </div>
            <div
              onClick={() => {
                if (nodeIsLoading !== 'trigger' && workflowReadyToPublish) {
                  publishWorkflow()
                }
              }}
              className={`cursor-pointer rounded-[5px]  bg-[#273687] p-[2px] px-[15px] text-[#fff]  ${
                nodeIsLoading === 'trigger'
                  ? 'animate-pulse cursor-auto'
                  : 'hover:bg-[#35428a]'
              } ${
                !workflowReadyToPublish &&
                '!cursor-auto !bg-[#c5c4c45f] hover:!bg-[#c5c4c45f]'
              }`}
            >
              Publish
            </div>
          </div>
        ) : (
          <div className="absolute top-0 ml-5 mt-2 flex h-fit justify-between gap-x-[20px] rounded-md px-3 py-2 text-[11px] 2xl:text-[13px]">
            <div
              onClick={() => {
                if (nodeIsLoading !== 'trigger' && workflowReadyToPublish) {
                  publishWorkflow()
                }
              }}
              className={`cursor-pointer rounded-[5px]  bg-[#273687] p-[2px] px-[15px] text-[#fff]  ${
                nodeIsLoading === 'trigger'
                  ? 'animate-pulse cursor-auto'
                  : 'hover:bg-[#35428a]'
              } ${
                !workflowReadyToPublish &&
                '!cursor-auto !bg-[#c5c4c45f] hover:!bg-[#c5c4c45f]'
              }`}
            >
              Unpublish
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Board
