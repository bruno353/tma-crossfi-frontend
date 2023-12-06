/* eslint-disable no-unused-vars */
import ScrollUp from '@/components/Common/ScrollUp'
import Faqs from '@/components/FAQS'
import Login from '@/components/Login'
import PrivacyPolicy from '@/components/PrivacyPolicy'
import { Inter } from '@next/font/google'
// import NewTask from '@/components/NewTask'

// eslint-disable-next-line no-unused-vars
const inter = Inter({ subsets: ['latin'] })

export default function FaqsE() {
  return (
    <>
      <ScrollUp />
      <PrivacyPolicy />
    </>
  )
}
