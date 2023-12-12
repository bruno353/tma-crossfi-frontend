/* eslint-disable react/no-unknown-property */
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

const NewWorkspaceModal = ({ isOpen, onClose }) => {
  const [workspaceName, setWorkspaceName] = useState('')

  const handleInputChange = (e) => {
    setWorkspaceName(e.target.value)
  }

  const handleOverlayClick = () => {
    // Fechar o modal quando a sobreposição escura é clicada
    onClose()
  }

  const handleModalClick = (e) => {
    // Impedir que o clique no modal propague para a sobreposição escura
    e.stopPropagation()
  }

  return (
    <div
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      } transition-opacity duration-300`}
    >
      <div
        onClick={handleModalClick}
        className="absolute inset-0 bg-black opacity-50"
      ></div>
      <div className="z-50 rounded-md bg-white p-8" onClick={handleModalClick}>
        <h2 className="mb-4 text-2xl">New Workspace</h2>
        <div className="mb-4">
          <label htmlFor="workspaceName" className="text-gray-700 block">
            Workspace name
          </label>
          <input
            type="text"
            id="workspaceName"
            name="workspaceName"
            value={workspaceName}
            onChange={handleInputChange}
            className="border-gray-300 w-full rounded-md border px-3 py-2"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 rounded-md px-4 py-2 text-white"
          >
            Close
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 ml-2 rounded-md px-4 py-2 text-white"
            onClick={() => {
              // Add your logic here to create a new workspace
              // You can use workspaceName state to get the entered name
              // Close the modal when done
              onClose()
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewWorkspaceModal
