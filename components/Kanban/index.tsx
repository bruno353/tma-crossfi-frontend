/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Eye, EyeSlash } from 'phosphor-react'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { getWorkspace } from '@/utils/api'
import nookies, { parseCookies, setCookie } from 'nookies'
import Sidebar from '../Sidebar'
import WorkspacePage from '../Workspace/WorkspacePage'
import KanbanPage from './KanbanPage'

const Kanban = (id: any) => {
  return (
    <>
      <div className="flex">
        <div>
          <Sidebar id={id.id} />
        </div>
        <div className="w-full">
          <KanbanPage id={id.id} />
        </div>
      </div>
    </>
  )
}

export default Kanban