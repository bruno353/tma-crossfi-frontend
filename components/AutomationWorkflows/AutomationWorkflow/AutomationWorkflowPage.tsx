/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import {
  useEffect,
  useState,
  ChangeEvent,
  FC,
  useContext,
  useCallback,
  useMemo,
} from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import './reactflow-overrides.css' // Ajuste o caminho conforme necessário

import TriggerNode from './ReactFlowComponents/TriggerNode'
import NewNode from './ReactFlowComponents/NewNode'
import withProps from './ReactFlowComponents/withProps'

import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { parseCookies } from 'nookies'
import { AccountContext } from '@/contexts/AccountContext'
import SubNavBar from '@/components/Modals/SubNavBar'
import EditWorkflowModal from '../Modals/EditWorkflowModal'
import {
  AutomationWorkflowProps,
  NodeActionWorkflowProps,
} from '@/types/automation'
import {
  createWorkflowActionNode,
  createWorkflowTrigger,
  editWorkflowTrigger,
  getAutomationWorkflow,
} from '@/utils/api-automation'
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
import SidebarWorkflow from './SidebarWorkflow'
import { ValueObject } from '@/components/Modals/Dropdown'
import ActionNode from './ReactFlowComponents/ActionNode'
import SidebarActionNodeWorkflow from './SidebarActionNodeWorkflow'

const onInit = (reactFlowInstance) =>
  console.log('flow loaded:', reactFlowInstance)

export const triggerOptions = [
  {
    name: 'Schedule',
    description: 'Schedule a cron job to run your workflow',
    imgSource: '/images/workflows/clock.svg',
    imgStyle: 'w-[18px]',
    imgStyleBoard: 'w-[11px]',
    type: 'Jobs',
    triggerType: 'CRON',
    pathSegment: '',
  },
]

export const actionOptions = [
  {
    name: 'Call canister',
    description: 'Interact with a canister through the wallet select',
    imgSource: '/images/workflows/paper.svg',
    imgStyle: 'w-[18px]',
    imgStyleBoard: 'w-[11px]',
    type: 'Internet Computer Protocol',
    abbreviationType: 'ICP',
    actionType: 'CALL_CANISTER',
    pathSegment: '',
  },
]

const triggerDefault = {
  id: '1',
  type: 'trigger',
  position: { x: 500, y: 200 },
  data: {},
  sourcePosition: Position.Right,
}

const AutomationWorkflowPage = ({ id, workspaceId }) => {
  const [isCreatingNewApp, setIsCreatingNewApp] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [navBarSelected, setNavBarSelected] = useState('Board')
  const [isEditAppOpen, setIsEditAppOpen] = useState<any>()
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodes, setNodes] = useNodesState([triggerDefault])

  const {
    workspace,
    user,
    automationWorkflowNodeSelected,
    setAutomationWorkflowNodeSelected,
    setNodeIsLoading,
    automationWorkflowSelected,
    setAutomationWorkflowSelected,
    nodeIsLoading,
  } = useContext(AccountContext)
  const [triggerOptionInfo, setTriggerOptionInfo] = useState<any>()

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: '#000' } }, eds),
      ),
    [],
  )
  const handleNodeRemove = (nodeIdToRemove) => {
    console.log('new test')
  }

  const handleNodeSelect = (nodeIdToSelect) => {
    console.log('handleNodeSelect')
    console.log(nodeIdToSelect)
    setAutomationWorkflowNodeSelected(nodeIdToSelect)
  }

  const handleNewNode = () => {
    setAutomationWorkflowNodeSelected('newNode')

    console.log('handleNewNode')
    const newNodes = [...nodes]
    newNodes.push({
      id: 'newNode',
      type: 'newNode',
      position: {
        x:
          newNodes.length > 0
            ? newNodes[newNodes.length - 1].position.x + 230
            : 500,
        y: 200,
      },
      data: {},
      sourcePosition: Position.Right,
    })
    setNodes(newNodes)

    const edges = [
      {
        id: 'trigger-newNode',
        source: '1',
        target: 'newNode',
        animated: true,
        style: { stroke: '#000' },
      },
    ]
    setEdges(edges)
  }

  const nodeTypes = useMemo(
    () => ({
      trigger: withProps(TriggerNode, {
        handleNodeRemove,
        handleNodeSelect,
        handleNewNode,
      }),
      action: withProps(ActionNode, {
        handleNodeRemove,
        handleNodeSelect,
        handleNewNode,
      }),
      newNode: withProps(NewNode, {
        handleNodeRemove,
        handleNodeSelect,
        handleNewNode,
      }),
    }),
    [],
  )

  const pathname = usePathname()
  const { push } = useRouter()

  function pushBack() {
    const lastIndex = pathname.lastIndexOf('/')
    const final = pathname.substring(0, lastIndex)
    push(final)
  }

  async function getData() {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    try {
      const res = await getAutomationWorkflow(data, userSessionToken)
      if (!res) {
        pushBack()
        return
      }
      if (!res.nodeTriggerWorkflow) {
        // trigger not created yet
        setAutomationWorkflowNodeSelected('trigger')
      }
      setAutomationWorkflowSelected(res)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  async function createTrigger(triggerType: string) {
    setNodeIsLoading('trigger')
    const { userSessionToken } = parseCookies()

    const data = {
      id,
      type: triggerType,
    }

    try {
      const res = await createWorkflowTrigger(data, userSessionToken)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setNodeIsLoading('')
  }

  async function createActionNode(nodeActionType: string) {
    setNodeIsLoading('newNode')
    const { userSessionToken } = parseCookies()

    const data = {
      id,
      type: nodeActionType,
    }

    try {
      const res = await createWorkflowActionNode(data, userSessionToken)

      // removing the "newNode" node
      const newNodes = nodes.filter((nd) => nd.id !== 'newNode')
      setNodes(newNodes)

      const newAutomatedWorkflowSet = {
        ...automationWorkflowSelected,
        nodeActionWorkflow: [
          ...automationWorkflowSelected.nodeActionWorkflow,
          res,
        ],
        nodesActionPosition: [
          ...automationWorkflowSelected.nodesActionPosition,
          res.id,
        ],
      }
      setAutomationWorkflowSelected(newAutomatedWorkflowSet)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setNodeIsLoading('')
  }

  async function editTrigger(triggerType: string) {
    setNodeIsLoading('trigger')
    const { userSessionToken } = parseCookies()

    const data = {
      id,
      type: triggerType,
    }

    try {
      const res = await editWorkflowTrigger(data, userSessionToken)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setNodeIsLoading(null)
  }

  function arrangeNodes(data: AutomationWorkflowProps) {
    const actionNodes = data.nodeActionWorkflow
    const position = data.nodesActionPosition

    const newNodeOrder = [triggerDefault]

    for (let i = 0; i < position.length; i++) {
      const node = actionNodes.find(
        (nodeOpt: NodeActionWorkflowProps) => nodeOpt.id === position[i],
      )
      if (node) {
        newNodeOrder.push({
          id: node.id,
          type: 'action',
          position: {
            x: newNodeOrder[newNodeOrder.length - 1].position.x + 230,
            y: 200,
          },
          data: {},
          sourcePosition: Position.Right,
        })
      }
    }
    setNodes(newNodeOrder)
  }

  async function handleSaveChangesCronTrigger(
    selectedCronExpressionTemplate?: ValueObject,
    cronExpression?: string,
  ) {
    if (!selectedCronExpressionTemplate?.value && !cronExpression) {
      return
    }
    setNodeIsLoading('trigger')
    const { userSessionToken } = parseCookies()

    let expression = selectedCronExpressionTemplate.value

    if (cronExpression.length > 0) {
      expression = cronExpression
    }

    const data = {
      id,
      value: expression,
    }

    try {
      const res = await editWorkflowTrigger(data, userSessionToken)
      const newAutomatedWorkflowSet = {
        ...automationWorkflowSelected,
        nodeTriggerWorkflow: {
          ...automationWorkflowSelected.nodeTriggerWorkflow,
          value: expression,
        },
      }
      setAutomationWorkflowSelected(newAutomatedWorkflowSet)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setNodeIsLoading(null)
  }

  useEffect(() => {
    if (automationWorkflowSelected) {
      arrangeNodes(automationWorkflowSelected)
    }
  }, [automationWorkflowSelected])

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [id])

  if (isLoading) {
    return (
      <div className="container grid w-full gap-y-[30px] text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="h-20 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
        <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
      </div>
    )
  }

  return (
    <>
      <section className="relative z-10 h-full max-h-[calc(100vh-8rem)]  overflow-hidden px-[20px] pb-16 text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="container relative h-full text-[#fff] ">
          <div
            onClick={() => {
              const basePath = pathname.split('/')[1]
              console.log('the bash pathhhh ' + basePath)
              const newPath = `/${basePath}/${workspaceId}/llm-apps` // Constrói o novo caminho
              push(newPath)
            }}
            className="absolute left-4 flex -translate-y-[180%] cursor-pointer gap-x-[5px]"
          >
            <img
              alt="ethereum avatar"
              src="/images/blockchain/arrow-left.svg"
              className="w-[12px]"
            ></img>
            <div className="text-[14px] text-[#c5c4c4] hover:text-[#b8b8b8]">
              Workflows
            </div>
          </div>
          <div className="flex items-center justify-between gap-x-[20px]">
            <div className="flex gap-x-[20px]">
              <img
                alt="ethereum avatar"
                src="/images/workflows/workflow.svg"
                className="w-[35px]"
              ></img>
              <div className="mt-auto text-[24px] font-medium">
                {automationWorkflowSelected?.name}
              </div>
            </div>
            {workspace?.isUserAdmin && (
              <div
                onClick={() => {
                  setIsEditAppOpen(true)
                }}
                className="cursor-pointer rounded-[5px]  bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]"
              >
                Edit Workflow
              </div>
            )}
          </div>
          <div className="mt-[45px] h-full ">
            <SubNavBar
              onChange={(value) => {
                setNavBarSelected(value)
              }}
              selected={navBarSelected}
              itensList={['Board', 'Analytics']}
            />
            <div className="mt-[20px] h-full 2xl:mt-[40px]">
              {navBarSelected === 'Board' && (
                <div className="h-full overflow-y-auto pb-[20px] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
                  <div className="relative flex h-full w-full rounded-md  border-[0.5px] border-[#c5c4c45f] bg-[#1D2144]">
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      proOptions={{
                        hideAttribution: true,
                      }}
                      onNodesChange={(value) => {
                        console.log('chamado fuii')
                        // if (xnodeType !== 'validator') {
                        //   onNodesChange(value)
                        // }
                      }}
                      onEdgesChange={(value) => {
                        // validator type of nodes cannot be edited
                        console.log('chamado fuii')
                        // if (xnodeType !== 'validator') {
                        //   console.log('entrei nao')
                        //   onEdgesChange(value)
                        // }
                      }}
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
                        automationWorkflowNodeSelected={
                          automationWorkflowNodeSelected
                        }
                        handleEditTrigger={editTrigger}
                        handleCreateTrigger={createTrigger}
                        handleSetTriggerOptionInfo={setTriggerOptionInfo}
                        triggerOptionInfo={triggerOptionInfo}
                        isLoading={!!nodeIsLoading}
                        handleSaveChangesCronTrigger={
                          handleSaveChangesCronTrigger
                        }
                      />
                    )}
                    {automationWorkflowNodeSelected === 'newNode' && (
                      <SidebarActionNodeWorkflow
                        automationWorkflowSelected={automationWorkflowSelected}
                        automationWorkflowNodeSelected={
                          automationWorkflowNodeSelected
                        }
                        handleEditTrigger={editTrigger}
                        handleCreateNode={createActionNode}
                        handleSetTriggerOptionInfo={setTriggerOptionInfo}
                        triggerOptionInfo={triggerOptionInfo}
                        isLoading={!!nodeIsLoading}
                        handleSaveChangesCronTrigger={
                          handleSaveChangesCronTrigger
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-[50px] grid w-full grid-cols-3 gap-x-[30px] gap-y-[30px]"></div>
        </div>
        {isEditAppOpen && (
          <EditWorkflowModal
            isOpen={isEditAppOpen}
            onClose={() => {
              setIsEditAppOpen(false)
            }}
            onUpdateM={() => {
              getData()
              setIsEditAppOpen(false)
            }}
            onDelete={() => {
              pushBack()
            }}
            app={automationWorkflowSelected}
          />
        )}
      </section>
    </>
  )
}

export default AutomationWorkflowPage
