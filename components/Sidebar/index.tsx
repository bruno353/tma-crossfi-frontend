/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { getWorkspace } from '@/utils/api'
import { parseCookies } from 'nookies'
import Workspace from '@/components/Workspace'
import { AccountContext } from '../../contexts/AccountContext'
import WorkspaceSelector from './WorkspaceSelector'
import NewWorkspaceModal from '../Dashboard/NewWorkspace'
import { Logo } from './Logo'

const Sidebar = (id: any) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
  const [sidebarOption, setSidebarOption] = useState<string>('')
  const { workspace, setWorkspace, user } = useContext(AccountContext)

  const [isBlockchainSidebarOpen, setIsBlockchainSidebarOpen] =
    useState<boolean>(true)
  const [isManagmentSidebarOpen, setIsManagmentSidebarOpen] =
    useState<boolean>(true)
  const [isLLMSidebarOpen, setIsLLMSidebarOpen] = useState<boolean>(true)
  const [isAutomationSidebarOpen, setIsAutomationSidebarOpen] =
    useState<boolean>(true)

  const [isCreatingNewWorkspace, setIsCreatingNewWorkspace] = useState(false)

  const openModal = () => {
    setMenuOpen(false)
    setIsCreatingNewWorkspace(true)
  }

  const closeModal = () => {
    setIsCreatingNewWorkspace(false)
  }

  const [menuOpen, setMenuOpen] = useState(false)

  const toggleHandler = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu()
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const { push } = useRouter()
  const pathname = usePathname()

  const sidebarOptions = [
    {
      name: 'Dashboard',
      option: `/${id.id}`,
      imgSource: '/images/sidebar/stats.svg',
      imgStyle: 'w-[18px]',
      type: 'general',
      pathSegment: '',
    },
    {
      name: 'Chat',
      option: `/${id.id}/chat`,
      imgSource: '/images/workspace/chat.svg',
      imgStyle: 'w-[20px] rounded-full',
      type: 'managment',
      pathSegment: 'chat',
    },
    {
      name: 'Kanban',
      option: `/${id.id}/kanban`,
      imgSource: '/images/sidebar/paper-draft.svg',
      imgStyle: 'w-[21px] rounded-full',
      type: 'managment',
      pathSegment: 'kanban',
    },
    {
      name: 'Wallets',
      option: `/${id.id}/blockchain-wallets`,
      imgSource: '/images/sidebar/wallet.svg',
      imgStyle: 'w-[23px] rounded-full',
      type: 'blockchain',
      pathSegment: 'blockchain-wallets',
    },
    {
      name: 'Apps',
      option: `/${id.id}/blockchain-apps`,
      imgSource: '/images/sidebar/1.svg',
      imgStyle: 'w-[25px] rounded-full',
      type: 'blockchain',
      pathSegment: 'blockchain-apps',
    },
    {
      name: 'Apps',
      option: `/${id.id}/llm-apps`,
      imgSource: '/images/sidebar/1.svg',
      imgStyle: 'w-[25px] rounded-full',
      type: 'llm',
      pathSegment: 'llm-apps',
    },
    {
      name: 'Workflows',
      option: `/${id.id}/automation-workflows`,
      imgSource: '/images/sidebar/app.svg',
      imgStyle: 'w-[18px]',
      type: 'automation',
      pathSegment: 'automation-workflows',
    },
    // {
    //   name: 'Notes',
    //   option: `/${id.id}/notes`,
    //   imgSource: '/images/workspace/note.svg',
    // },
    // {
    //   name: 'Deploy',
    //   option: `/${id.id}/deploy`,
    //   imgSource: '/images/workspace/rocket.svg',
    // },
    // {
    //   name: 'Tasks',
    //   option: `/${id.id}/tasks`,
    //   imgSource: '/images/workspace/tasks.svg',
    // },
  ]

  async function getData(id: any) {
    const { userSessionToken } = parseCookies()
    console.log('getting data')
    console.log(id)
    console.log(userSessionToken)

    const data = {
      id,
    }

    let dado
    try {
      dado = await getWorkspace(data, userSessionToken)
      if (dado) {
        setWorkspace(dado)
      }
    } catch (err) {
      toast.error(`Not a valid workspace`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      push('/dashboard')
    }

    return dado
  }

  const handleSidebarClick = (pathSegment, option) => {
    const basePath = pathname.split('/')[1]
    console.log('the bash pathhhh ' + basePath)
    const newPath = `/${basePath}${option}` // Constrói o novo caminho

    push(newPath)

    setSidebarOption(pathSegment)
  }

  useEffect(() => {
    console.log('workspace entrado')
    console.log('verificando se existe id')
    console.log(id)
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (id) {
      console.log(id)
      console.log(id.id)
      getData(id.id)
    } else {
      push('/dashboard')
    }
  }, [id])

  useEffect(() => {
    const pathnameSegments = pathname.split('/').filter(Boolean)

    for (let i = 0; i < sidebarOptions.length; i++) {
      if (pathnameSegments.includes(sidebarOptions[i].pathSegment)) {
        setSidebarOption(sidebarOptions[i].pathSegment)
        return
      }
    }

    setSidebarOption('')
  }, [pathname])

  if (!workspace) {
    return (
      <>
        <div
          // onMouseEnter={() => setIsSidebarOpen(true)}
          // onMouseLeave={() => setIsSidebarOpen(false)}
          className="relative !z-[9999] ml-[15px] mt-[40px]  flex  h-[calc(100vh-10rem)] w-[210px]  rounded-[10px] bg-[#1D2144] px-[10px]  py-36 text-[16px] lg:py-[30px]"
        >
          <div className="h-full w-full">
            <div className="h-10 w-full animate-pulse rounded-[5px] bg-[#2f3358]"></div>
            <div className="mt-[30px] h-[50%] w-full animate-pulse rounded-[5px] bg-[#2f3358]"></div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="relative">
      <div
        // onMouseEnter={() => setIsSidebarOpen(true)}
        // onMouseLeave={() => setIsSidebarOpen(false)}
        className="relative !z-[9999] ml-[15px] mt-[40px] flex h-[calc(100vh-10rem)] w-[210px] overflow-y-auto rounded-[10px] bg-[#1D2144]  px-[10px]  py-36 text-[16px] scrollbar-thin scrollbar-track-[#1D2144]  scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md lg:py-[30px]"
      >
        <div className="w-full">
          {workspace && (
            <div
              onClick={toggleHandler}
              className={`relative mb-[20px] flex w-full cursor-pointer items-center  gap-x-[10px] rounded-[7px] px-[10px] py-[5px] text-[#fff] hover:bg-[#dbdbdb1e] ${
                menuOpen && 'bg-[#dbdbdb1e]'
              }`}
            >
              <div className="text-[12px]">
                <Logo
                  name={workspace.name}
                  workspaceUrl={workspace.finalURL}
                  tamanho={'[25px]'}
                />
              </div>

              <div className="w-full text-[13px] font-normal">
                {workspace.name}
              </div>
              <img
                alt="ethereum avatar"
                src="/images/header/arrow.svg"
                className="w-[10px] rounded-full"
              ></img>
            </div>
          )}
          <div className="grid gap-y-[3px] text-[#fff]">
            {sidebarOptions.map((option, index) => (
              <div
                onClick={() => {
                  handleSidebarClick(option.pathSegment, option.option)
                }}
                key={index}
                className={`${option.type !== 'general' && 'hidden'}`}
              >
                <div
                  className={`mb-[5px] flex cursor-pointer  items-center gap-x-[10px] rounded-[7px] px-[10px] py-[10px] hover:bg-[#dbdbdb1e] ${
                    sidebarOption === '' && 'bg-[#dbdbdb1e]'
                  }`}
                >
                  <img
                    src={option.imgSource}
                    alt="image"
                    className={option.imgStyle}
                  />
                  {isSidebarOpen && (
                    <div className="text-center text-[13px] font-light">
                      {option.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div
              onClick={() => {
                setIsBlockchainSidebarOpen(!isBlockchainSidebarOpen)
              }}
              className="mb-1 flex  cursor-pointer justify-between px-[10px]"
            >
              <div className="mb-1 text-[13px] font-normal text-[#c5c4c4]">
                Blockchain
              </div>
              <img
                alt="ethereum avatar"
                src="/images/header/arrow-gray.svg"
                className={`w-[10px] rounded-full transition-transform duration-150 ${
                  !isBlockchainSidebarOpen && 'rotate-180'
                }`}
              ></img>
            </div>

            {isBlockchainSidebarOpen && (
              <div className="grid gap-y-[3px] text-[#fff]">
                {sidebarOptions.map((option, index) => (
                  <div
                    onClick={() => {
                      handleSidebarClick(option.pathSegment, option.option)
                    }}
                    key={index}
                    className={`${option.type !== 'blockchain' && 'hidden'}`}
                  >
                    <div
                      className={`mb-[5px] flex cursor-pointer  items-center gap-x-[10px] rounded-[7px] px-[10px] py-[6px] hover:bg-[#dbdbdb1e] ${
                        sidebarOption === option.pathSegment && 'bg-[#dbdbdb1e]'
                      }`}
                    >
                      <img
                        src={option.imgSource}
                        alt="image"
                        className={option.imgStyle}
                      />
                      {isSidebarOpen && (
                        <div className="text-center text-[13px] font-light">
                          {option.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-5">
            <div
              onClick={() => {
                setIsLLMSidebarOpen(!isLLMSidebarOpen)
              }}
              className="mb-1 flex  cursor-pointer justify-between px-[10px]"
            >
              <div className="mb-1 text-[13px] font-normal text-[#c5c4c4]">
                LLM
              </div>
              <img
                alt="ethereum avatar"
                src="/images/header/arrow-gray.svg"
                className={`w-[10px] rounded-full transition-transform duration-150 ${
                  !isLLMSidebarOpen && 'rotate-180'
                }`}
              ></img>
            </div>

            {isLLMSidebarOpen && (
              <div className="grid gap-y-[3px] text-[#fff]">
                {sidebarOptions.map((option, index) => (
                  <div
                    onClick={() => {
                      handleSidebarClick(option.pathSegment, option.option)
                    }}
                    key={index}
                    className={`${option.type !== 'llm' && 'hidden'}`}
                  >
                    <div
                      className={`mb-[5px] flex cursor-pointer  items-center gap-x-[10px] rounded-[7px] px-[10px] py-[6px] hover:bg-[#dbdbdb1e] ${
                        sidebarOption === option.pathSegment && 'bg-[#dbdbdb1e]'
                      }`}
                    >
                      <img
                        src={option.imgSource}
                        alt="image"
                        className={option.imgStyle}
                      />
                      {isSidebarOpen && (
                        <div className="text-center text-[13px] font-light">
                          {option.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-5">
            <div
              onClick={() => {
                setIsAutomationSidebarOpen(!isAutomationSidebarOpen)
              }}
              className="mb-1 flex  cursor-pointer justify-between px-[10px]"
            >
              <div className="mb-1 text-[13px] font-normal text-[#c5c4c4]">
                Automation
              </div>
              <img
                alt="ethereum avatar"
                src="/images/header/arrow-gray.svg"
                className={`w-[10px] rounded-full transition-transform duration-150 ${
                  !isAutomationSidebarOpen && 'rotate-180'
                }`}
              ></img>
            </div>
            {isAutomationSidebarOpen && (
              <div className="grid gap-y-[3px] text-[#fff]">
                {sidebarOptions.map((option, index) => (
                  <div
                    onClick={() => {
                      handleSidebarClick(option.pathSegment, option.option)
                    }}
                    key={index}
                    className={`${option.type !== 'automation' && 'hidden'}`}
                  >
                    <div
                      className={`mb-[5px] flex cursor-pointer  items-center gap-x-[10px] rounded-[7px] px-[10px] py-[6px] hover:bg-[#dbdbdb1e] ${
                        sidebarOption === option.pathSegment && 'bg-[#dbdbdb1e]'
                      }`}
                    >
                      <img
                        src={option.imgSource}
                        alt="image"
                        className={option.imgStyle}
                      />
                      {isSidebarOpen && (
                        <div className="text-center text-[13px] font-light">
                          {option.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-5 pb-[30px]">
            <div
              onClick={() => {
                setIsManagmentSidebarOpen(!isManagmentSidebarOpen)
              }}
              className="mb-1 flex  cursor-pointer justify-between px-[10px]"
            >
              <div className="mb-1 text-[13px] font-normal text-[#c5c4c4]">
                Managment
              </div>
              <img
                alt="ethereum avatar"
                src="/images/header/arrow-gray.svg"
                className={`w-[10px] rounded-full transition-transform duration-150 ${
                  !isManagmentSidebarOpen && 'rotate-180'
                }`}
              ></img>
            </div>

            {isManagmentSidebarOpen && (
              <div className="grid gap-y-[3px] text-[#fff]">
                {sidebarOptions.map((option, index) => (
                  <div
                    onClick={() => {
                      handleSidebarClick(option.pathSegment, option.option)
                    }}
                    key={index}
                    className={`${option.type !== 'managment' && 'hidden'}`}
                  >
                    <div
                      className={`mb-[5px] flex cursor-pointer  items-center gap-x-[10px] rounded-[7px] px-[10px] py-[6px] hover:bg-[#dbdbdb1e] ${
                        sidebarOption === option.pathSegment && 'bg-[#dbdbdb1e]'
                      }`}
                    >
                      <img
                        src={option.imgSource}
                        alt="image"
                        className={option.imgStyle}
                      />
                      {isSidebarOpen && (
                        <div className="text-center text-[13px] font-light">
                          {option.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <NewWorkspaceModal
          isOpen={isCreatingNewWorkspace}
          onClose={closeModal}
        />
      </div>
      {menuOpen && (
        <div
          className="absolute top-[35px] !z-[999999] translate-x-[40px] translate-y-[40px]"
          ref={menuRef}
        >
          <WorkspaceSelector
            user={user}
            currentlyWorkspaceId={workspace?.id}
            onNewWorkspace={openModal}
          />{' '}
        </div>
      )}
    </div>
  )
}

export default Sidebar
