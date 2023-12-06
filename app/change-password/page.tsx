/* eslint-disable no-unused-vars */
import ChangePassword from '@/components/ChangePassword'
import ScrollUp from '@/components/Common/ScrollUp'
import { Inter } from '@next/font/google'
// import NewTask from '@/components/NewTask'

// eslint-disable-next-line no-unused-vars
const inter = Inter({ subsets: ['latin'] })

export default function Tasks() {
  return (
    <>
      <ScrollUp />
      <ChangePassword />
    </>
  )
}
