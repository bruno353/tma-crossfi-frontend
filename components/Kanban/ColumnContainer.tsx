import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo, useState } from 'react'
import TaskCard from './TaskCard'
import { Column, Id, Task } from '@/types/kanban'

interface Props {
  column: Column
  deleteColumn: (id: Id) => void
  updateColumn: (id: Id, title: string) => void

  createTask: (columnId: Id) => void
  updateTask: (id: Id, content: string) => void
  deleteTask: (id: Id) => void
  tasks: Task[]
}

function ColumnContainer({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask,
}: Props) {
  const [editMode, setEditMode] = useState(false)

  const tasksIds = useMemo(() => {
    return tasks?.map((task) => task.id)
  }, [tasks])

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
    disabled: editMode,
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
      bg-columnBackgroundColor
      border-pink-500
      flex
      h-[500px]
      max-h-[500px]
      w-[350px]
      flex-col
      rounded-md
      border-2
      opacity-40
      "
      ></div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
  flex
  h-[500px]
  max-h-[500px]
  w-[350px]
  flex-col
  rounded-md
  bg-[#161C22]
  "
    >
      {/* Column title */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true)
        }}
        className="
      text-md
      flex
      h-[60px]
      cursor-grab
      items-center
      justify-between
      rounded-md
      rounded-b-none
      bg-[#0D1117]
      
      p-3
      font-bold
      "
      >
        <div className="flex gap-2">
          <div
            className="
        bg-columnBackgroundColor
        flex
        items-center
        justify-center
        rounded-full
        px-2
        py-1
        text-sm
        "
          >
            {tasks?.length}
          </div>
          {!editMode && column.title}
          {editMode && (
            <input
              className="focus:border-rose-500 rounded border bg-black px-2 outline-none"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => {
                setEditMode(false)
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                setEditMode(false)
              }}
            />
          )}
        </div>
      </div>

      {/* Column task container */}
      <div className="flex flex-grow flex-col gap-4 overflow-y-auto overflow-x-hidden p-2">
        <SortableContext items={tasksIds}>
          {tasks?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      {/* Column footer */}
      <div className="flex w-full p-2">
        {' '}
        <button
          className=" hover:bg-mainBackgroundColor hover:text-rose-500 flex items-center gap-2 rounded-md p-4 hover:bg-[#0D1117] active:bg-black"
          onClick={() => {
            createTask(column.id)
          }}
        >
          Add task
        </button>{' '}
      </div>
    </div>
  )
}

export default ColumnContainer
