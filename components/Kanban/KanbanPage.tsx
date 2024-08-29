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
  useMemo,
} from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { parseCookies } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
// import NewWorkspaceModal from './NewWorkspace'
import { Column, Id, Task } from '@/types/kanban'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
// import NewAppModal from './Modals/NewAppModal'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import ColumnContainer from './ColumnContainer'
import TaskCard from './TaskCard'
import { createPortal } from 'react-dom'
import { getKanbanData, updateKanban } from '@/utils/kanban'

const defaultCols: Column[] = [
  {
    id: 'todo',
    title: 'To do',
  },
  {
    id: 'doing',
    title: 'Progress',
  },
  {
    id: 'done',
    title: 'Done',
  },
]

const defaultTasks: Task[] = []

const KanbanPage = ({ id }) => {
  const [columns, setColumns] = useState<Column[]>(defaultCols)
  const columnsId = useMemo(() => columns?.map((col) => col.id), [columns])
  const [tasks, setTasks] = useState<Task[]>(defaultTasks)
  const [activeColumn, setActiveColumn] = useState<Column | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { workspace, user } = useContext(AccountContext)

  const { push } = useRouter()
  const pathname = usePathname()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  )

  async function getData() {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    const data = {
      workspaceId: id,
    }

    try {
      const res = await getKanbanData(data, userSessionToken)
      if (res) {
        console.log('entrei aqui no get certo')
        setTasks(JSON.parse(res.kanbanTasksData))
      }
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  async function saveDataTasks(tasksData: any) {
    const { userSessionToken } = parseCookies()

    const data = {
      workspaceId: id,
      kanbanTasksData: JSON.stringify(tasksData),
    }

    try {
      await updateKanban(data, userSessionToken)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [id])

  if (isLoading) {
    return (
      <div className="container grid w-full gap-y-[30px] pt-36 text-[16px] md:pb-20 lg:pb-28 lg:pt-[180px]">
        <div className="h-20 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
        <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
      </div>
    )
  }

  function generateId() {
    /* Generate a random number between 0 and 1000000 */
    return Math.floor(Math.random() * 1000001)
  }

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks?.length + 1}`,
    }

    setTasks([...tasks, newTask])
    saveDataTasks([...tasks, newTask])
  }

  function deleteTask(id: Id) {
    const newTasks = tasks?.filter((task) => task.id !== id)
    setTasks(newTasks)
    saveDataTasks(newTasks)
  }

  function updateTask(id: Id, content: string) {
    const newTasks = tasks?.map((task) => {
      if (task.id !== id) return task
      return { ...task, content }
    })

    setTasks(newTasks)
    saveDataTasks(newTasks)
  }

  function deleteColumn(id: Id) {
    console.log('')
  }

  function updateColumn(id: Id, title: string) {
    console.log('')
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column)
      return
    }

    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null)
    setActiveTask(null)

    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveAColumn = active.data.current?.type === 'Column'
    if (!isActiveAColumn) return

    console.log('DRAG END')

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId)

      const overColumnIndex = columns.findIndex((col) => col.id === overId)

      return arrayMove(columns, activeColumnIndex, overColumnIndex)
    })
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveATask = active.data.current?.type === 'Task'
    const isOverATask = over.data.current?.type === 'Task'

    if (!isActiveATask) return

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks?.findIndex((t) => t.id === activeId)
        const overIndex = tasks?.findIndex((t) => t.id === overId)

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          // Fix introduced after video recording
          tasks[activeIndex].columnId = tasks[overIndex].columnId
          return arrayMove(tasks, activeIndex, overIndex - 1)
        }

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    const isOverAColumn = over.data.current?.type === 'Column'

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      // Implemente a lógica similar à acima para ajustar o columnId da tarefa e reordenar se necessário
      const newTasks = tasks.slice() // Cria uma cópia do estado atual de tasks
      const activeIndex = newTasks.findIndex((t) => t.id === activeId)

      newTasks[activeIndex].columnId = overId // Atualiza o columnId da tarefa

      setTasks(newTasks)
      saveDataTasks(newTasks) // Salva o novo estado de tasks
    }
  }

  return (
    <div
      className="
      mx-auto flex overflow-x-auto px-[20px] text-[#C5C4C4] lg:pt-[40px]
    "
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="mx-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns?.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks?.filter((task) => task.columnId === col.id)}
                />
              ))}
            </SortableContext>
          </div>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks?.filter(
                  (task) => task.columnId === activeColumn.id,
                )}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </div>
  )
}

export default KanbanPage
