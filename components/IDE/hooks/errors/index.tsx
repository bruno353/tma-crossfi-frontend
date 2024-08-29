import { truncateString } from '@/utils/functions'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const handleError = (error: any) => {
  if (error instanceof Error) {
    let errorMessage = ''
    if (error.name === 'ContractFunctionExecutionError') {
      errorMessage = error.message.split('\n')[1]
      return toast.error(errorMessage)
    }
  } else if (typeof error === 'string') {
    console.error(error)
  }
  console.log(error)
  toast.error(`An error occurred: ${truncateString(error)}`)
}
