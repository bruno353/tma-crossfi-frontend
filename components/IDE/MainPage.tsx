/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Eye, EyeSlash, SmileySad } from 'phosphor-react'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import { parseCookies } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
// import NewWorkspaceModal from './NewWorkspace'
import { getBlockchainApps, getUserWorkspace, getWorkspace } from '@/utils/api'
import { WorkspaceProps } from '@/types/workspace'
import SubNavBar from '../Modals/SubNavBar'
import { Logo } from '../Sidebar/Logo'
import { BlockchainWalletProps } from '@/types/blockchain-app'
// import NewAppModal from './Modals/NewAppModal'
import Editor, { useMonaco } from '@monaco-editor/react'
import SelectLanguageModal from './Modals/SelectLanguage'
import './EditorStyles.css'
import { callAxiosBackend } from '@/utils/general-api'

const MainPage = ({ id }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCompilation, setIsLoadingCompilation] = useState(false)
  const [value, setValue] = useState('// start your code here')
  const [languageSelectorOpen, setLanguageSelectorOpen] = useState(false)
  const monaco = useMonaco()

  const [navBarSelected, setNavBarSelected] = useState('General')
  const [blockchainWallets, setBlockchainWallets] = useState<
    BlockchainWalletProps[]
  >([])

  const { workspace, user } = useContext(AccountContext)

  const { push } = useRouter()
  const pathname = usePathname()

  const editorRef = useRef()
  const [language, setLanguage] = useState('')

  const onMount = (editor) => {
    editorRef.current = editor
    editor.focus()
  }
  const menuRef = useRef(null)

  async function compileContract() {
    setIsLoadingCompilation(true)
    const { userSessionToken } = parseCookies()

    const data = {
      walletId: '123',
      code: value,
    }

    try {
      const res = await callAxiosBackend(
        'post',
        '/blockchain/functions/compileSorobanContract',
        userSessionToken,
        data,
      )
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoadingCompilation(false)
  }

  async function getData() {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    try {
      const res = await callAxiosBackend(
        'get',
        `/blockchain/functions/getWorkspaceWallets?id=${id}&sorobanRPC=https://horizon-testnet.stellar.org&network=STELLAR`,
        userSessionToken,
      )
      setBlockchainWallets(res)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setLanguageSelectorOpen(false)
      }
    }

    if (languageSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [languageSelectorOpen])

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [id])

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('vs-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1D2144',
          'editor.foreground': '#FFFFFF',
          'editor.lineHighlightBackground': '#dbdbdb1e',
          'editorLineNumber.foreground': '#858585',
          'editor.selectionBackground': '#0000FF20',
        },
      })
      setTimeout(() => {
        setLanguage('rust')
      }, 5000)
    }
  }, [monaco])

  if (isLoading) {
    return (
      <div className="container grid w-full gap-y-[30px]  text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="h-20 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
        <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
      </div>
    )
  }

  return (
    <>
      <section className="relative z-10 max-h-[calc(100vh-8rem)] overflow-hidden px-[20px] pb-16  text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
        <div className="container flex gap-x-[10px] text-[#fff]">
          <div className="h-[76vh] w-[200px] rounded-xl bg-[#1D2144]"></div>
          <div className="w-full">
            <div className="flex w-[60%] justify-between">
              <div
                onClick={() => setLanguageSelectorOpen(true)}
                className="mb-2 flex w-fit cursor-pointer items-center gap-x-[7px] rounded-md pl-2 pr-3 text-[14px] font-normal text-[#c5c4c4] hover:bg-[#c5c5c510]"
              >
                <div>{language}</div>
                <img
                  alt="ethereum avatar"
                  src="/images/header/arrow.svg"
                  className="w-[7px]"
                ></img>
              </div>
              <div
                onClick={() => {
                  compileContract()
                }}
                className="cursor-pointer text-[14px]"
              >
                Deploy
              </div>
            </div>
            <div
              className={`editor-container w-[60%] ${
                isLoadingCompilation && 'animate-pulse'
              }`}
            >
              <Editor
                height="72vh"
                theme="vs-dark"
                defaultLanguage="javascript"
                value={value}
                language={language}
                onMount={onMount}
                onChange={(value) => {
                  if (!isLoadingCompilation) {
                    setValue(value)
                  }
                }}
                options={{
                  minimap: {
                    enabled: false,
                  },
                }}
              />
            </div>
          </div>
        </div>
        {languageSelectorOpen && (
          <div
            className="absolute top-[35px] !z-[999999] translate-x-[30px] translate-y-[40px] 2xl:translate-x-[80px]"
            ref={menuRef}
          >
            <SelectLanguageModal
              onUpdateM={(value) => {
                setLanguage(value)
                setLanguageSelectorOpen(false)
              }}
            />{' '}
          </div>
        )}
      </section>
    </>
  )
}

export default MainPage
