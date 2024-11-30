/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { parseCookies } from 'nookies'
// import NewWorkspaceModal from './NewWorkspace'
import { callAxiosBackend } from '@/utils/general-api'
import { TelegramAppProps } from '@/types/telegram'

// Function to capitalize only the first letter and make the rest lowercase
function capitalizeFirst(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const AppInfoPage = ({ id }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [app, setApp] = useState<TelegramAppProps>()

  const { push } = useRouter()

  async function getData() {
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    try {
      const res = await callAxiosBackend(
        'get',
        `/telegram/apps/${id}`,
        userSessionToken,
      )
      setApp(res)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      push('/dashboard')
    }
  }

  const subCategoryToText = {
    new: 'New',
    earn: 'Earn',
    community_choices: 'Community Choices',
  }

  useEffect(() => {
    setIsLoading(true)
    async function load() {
      await getData()
      setIsLoading(false)
    }
    load()
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
      <section className="relative z-10 overflow-hidden px-[10px] pb-16 text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="container text-[#fff]">
          <div
            onClick={() => {
              const newPath = `/dashboard` // Constrói o novo caminho
              push(newPath)
            }}
            className="absolute left-4 flex  cursor-pointer gap-x-[5px]"
          >
            <img
              alt="ethereum avatar"
              src="/images/blockchain/arrow-left.svg"
              className="w-[12px]"
            ></img>
            <div className="text-[14px] text-[#c5c4c4] hover:text-[#b8b8b8]">
              Apps
            </div>
          </div>
          <div className="flex items-center justify-between gap-x-[20px] pt-10">
            <div className="flex gap-x-4">
              <img
                src={app.logoUrl}
                alt="image"
                className="h-[80px] w-[80px] rounded-lg"
              />
              <div className="mt-auto ">
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis whitespace-nowrap text-[24px] font-medium">
                  {app?.name}
                </div>
                <a
                  href="/defi-staking"
                  className="hover:bg-primary-dark mt-2 inline-block h-fit rounded bg-primary px-2 py-[1px] text-sm font-semibold text-white"
                >
                  Launch
                </a>
              </div>
            </div>
          </div>

          <div className="mt-[30px]">
            <div className="mt-4">
              <p className="text-[14px]">{capitalizeFirst(app?.category)}</p>
            </div>

            <div className="mt-1">
              <ul className="flex gap-x-2">
                {app?.subcategories.map((subcategory, index) => (
                  <li
                    key={index}
                    className="border-r  border-[#575757] pr-2 text-[14px] text-grey last:border-none"
                  >
                    {subCategoryToText[subcategory]}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-8 text-[16px]">{app?.desc}</p>
          </div>
        </div>
      </section>
      <svg
        className="absolute"
        width="69"
        height="84"
        viewBox="0 0 79 94"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          opacity="0.3"
          x="-41"
          y="26.9426"
          width="66.6675"
          height="66.6675"
          transform="rotate(-22.9007 -41 26.9426)"
          fill="url(#paint0_linear_94:889)"
        />
        <rect
          x="-41"
          y="26.9426"
          width="66.6675"
          height="66.6675"
          transform="rotate(-22.9007 -41 26.9426)"
          stroke="url(#paint1_linear_94:889)"
          strokeWidth="0.7"
        />
        <path
          opacity="0.3"
          d="M50.5215 7.42229L20.325 1.14771L46.2077 62.3249L77.1885 68.2073L50.5215 7.42229Z"
          fill="url(#paint2_linear_94:889)"
        />
        <path
          d="M50.5215 7.42229L20.325 1.14771L46.2077 62.3249L76.7963 68.2073L50.5215 7.42229Z"
          stroke="url(#paint3_linear_94:889)"
          strokeWidth="0.7"
        />
        <path
          opacity="0.3"
          d="M17.9721 93.3057L-14.9695 88.2076L46.2077 62.325L77.1885 68.2074L17.9721 93.3057Z"
          fill="url(#paint4_linear_94:889)"
        />
        <path
          d="M17.972 93.3057L-14.1852 88.2076L46.2077 62.325L77.1884 68.2074L17.972 93.3057Z"
          stroke="url(#paint5_linear_94:889)"
          strokeWidth="0.7"
        />
        <defs>
          <linearGradient
            id="paint0_linear_94:889"
            x1="-41"
            y1="21.8445"
            x2="36.9671"
            y2="59.8878"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4A6CF7" stopOpacity="0.62" />
            <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_94:889"
            x1="25.6675"
            y1="95.9631"
            x2="-42.9608"
            y2="20.668"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4A6CF7" stopOpacity="0" />
            <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.51" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_94:889"
            x1="20.325"
            y1="-3.98039"
            x2="90.6248"
            y2="25.1062"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4A6CF7" stopOpacity="0.62" />
            <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_94:889"
            x1="18.3642"
            y1="-1.59742"
            x2="113.9"
            y2="80.6826"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4A6CF7" stopOpacity="0" />
            <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.51" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_94:889"
            x1="61.1098"
            y1="62.3249"
            x2="-8.82468"
            y2="58.2156"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4A6CF7" stopOpacity="0.62" />
            <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_94:889"
            x1="65.4236"
            y1="65.0701"
            x2="24.0178"
            y2="41.6598"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4A6CF7" stopOpacity="0" />
            <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.51" />
          </linearGradient>
        </defs>
      </svg>
      {/* <EditWorkspaceModal
        isOpen={isEditingWorkspace}
        onClose={closeModal}
        onUpdate={getData}
        previousWorkspaceName={workspace?.name}
        previouslogoURL={workspace?.finalURL}
        workspaceId={workspace?.id}
      /> */}
    </>
  )
}

export default AppInfoPage
