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
import { getBlockchainWallets } from '@/utils/api-blockchain'
// import NewAppModal from './Modals/NewAppModal'
import Editor, { useMonaco } from '@monaco-editor/react'
import SelectLanguageModal from './Modals/SelectLanguage'

const MainPage = ({ id }) => {
  const [isLoading, setIsLoading] = useState(true)
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
  const [language, setLanguage] = useState('javascript')

  const onMount = (editor) => {
    editorRef.current = editor
    editor.focus()
  }
  const menuRef = useRef(null)

  async function getData() {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    const data = {
      id,
    }

    try {
      const res = await getBlockchainWallets(data, userSessionToken)
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
        base: 'vs-dark', // base theme (can also be 'vs' for light theme)
        inherit: true,
        rules: [
          // optional: define additional styling for specific tokens
        ],
        colors: {
          'editor.background': '#1D2144',
          'editor.foreground': '#FFFFFF',
          'editor.lineHighlightBackground': '#dbdbdb1e',
          'editorLineNumber.foreground': '#858585',
          'editor.selectionBackground': '#0000FF20',
        },
      })
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
        <div className="container text-[#fff]">
          <div
            onClick={() => setLanguageSelectorOpen(true)}
            className="mb-4 w-fit cursor-pointer rounded-md py-1 pl-2 pr-3 text-[14px] font-normal text-[#c5c4c4] hover:bg-[#c5c5c510]"
          >
            {language}
          </div>
          <div className="w-[50%]">
            <Editor
              height="75vh"
              theme="vs-dark"
              defaultLanguage="javascript"
              value={value}
              language={language}
              onMount={onMount}
              onChange={(value) => setValue(value)}
              options={{
                minimap: {
                  enabled: false,
                },
              }}
            />
          </div>
        </div>
        {languageSelectorOpen && (
          <div
            className="absolute top-[35px] !z-[999999] translate-x-[80px] translate-y-[40px]"
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
