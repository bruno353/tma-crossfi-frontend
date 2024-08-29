/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import Sidebar from '../Sidebar'
import AutomationWorkflowsPage from './AutomationWorkflowsPage'

const AutomationWorkflows = (id: any) => {
  return (
    <>
      <div className="flex">
        <div>
          <Sidebar id={id.id} />
        </div>
        <div className="w-full">
          <AutomationWorkflowsPage id={id.id} />
        </div>
      </div>
    </>
  )
}

export default AutomationWorkflows
