'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import ThemeToggler from './ThemeToggler'
import menuData from './menuData'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
import { getCurrentUser } from '@/utils/api'
import { usePathname, useRouter } from 'next/navigation'
import Menu from './Menu'

const Header = () => {
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false)
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen)
  }

  const pathname = usePathname()

  const cookies = parseCookies()
  const userHasAnyCookie = cookies.userSessionToken

  const { user, setUser } = useContext(AccountContext)
  const { push } = useRouter()

  // Sticky Navbar
  const [sticky, setSticky] = useState(false)
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true)
    } else {
      setSticky(false)
    }
  }
  useEffect(() => {
    window.addEventListener('scroll', handleStickyNavbar)
  })

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1)
  const handleSubmenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1)
    } else {
      setOpenIndex(index)
    }
  }

  function cleanData() {
    destroyCookie(undefined, 'userSessionToken')
    nookies.destroy(null, 'userSessionToken')
    destroyCookie(undefined, 'user')
    nookies.destroy(null, 'user')
    setUser(null)
    handleUserPath(false)
  }

  function signOutUser() {
    cleanData()
  }

  async function getUserData() {
    const { userSessionToken, user } = parseCookies()

    console.log(userSessionToken)
    if (userSessionToken) {
      if (user) {
        console.log('o meu userrrr')
        console.log(JSON.parse(user))
        setUser(JSON.parse(user))
      }
      const dado = await getCurrentUser(userSessionToken)
      if (dado) {
        setUser(dado)
        setCookie(null, 'userSessionToken', dado.sessionToken)
        nookies.set(null, 'userSessionToken', dado.sessionToken)
        setCookie(null, 'user', JSON.stringify(dado))
        nookies.set(null, 'user', JSON.stringify(dado))
        handleUserPath(true)
      } else {
        handleUserPath(false)
      }
    }
  }

  function handleUserPath(hasUser: boolean) {
    if (hasUser) {
      if (pathname.includes('/signin') || pathname.includes('/signup')) {
        push('/dashboard')
      }
    }
    if (!hasUser) {
      if (pathname.includes('/dashboard')) {
        push('/signin')
      }
    }
  }

  useEffect(() => {
    if (userHasAnyCookie) {
      console.log('user has cookis')
      console.log(userHasAnyCookie)
      console.log(cookies.userSessionToken)
      try {
        getUserData()
      } catch (err) {
        cleanData()
      }
    } else {
      cleanData()
    }
  }, [])

  return (
    <>
      <header
        className={`header left-0 top-0 z-40 flex w-full items-center bg-transparent ${
          !sticky
            ? '!fixed !z-[9999] !bg-white !bg-opacity-80 shadow-sticky backdrop-blur-sm !transition dark:!bg-[#040015] dark:!bg-opacity-60'
            : '!fixed !z-[9999] !bg-white !bg-opacity-80 shadow-sticky backdrop-blur-sm !transition dark:!bg-[#040015] dark:!bg-opacity-60'
        }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-60 max-w-full px-4 xl:mr-12">
              <Link
                onClick={() => {
                  console.log(user)
                }}
                href={user ? '/dashboard' : '/'}
                className={`header-logo block w-full ${
                  sticky ? 'py-5 lg:py-2' : 'py-8'
                } `}
              >
                <Image
                  src="/images/logo/logo-icon.svg"
                  alt="logo"
                  width={40}
                  height={40}
                  className="hidden w-[40px] dark:block"
                />
              </Link>
            </div>
            <div className="relative flex items-center justify-end pr-16 lg:pr-0">
              {user && (
                <div
                  onClick={() => {
                    navbarToggleHandler()
                  }}
                  className="flex cursor-pointer gap-x-[15px]"
                >
                  <img
                    alt="ethereum avatar"
                    src={user.profilePicture}
                    className="w-[40px] rounded-full"
                  ></img>
                  <img
                    alt="ethereum avatar"
                    src="/images/header/arrow.svg"
                    className="w-[15px] rounded-full"
                  ></img>
                </div>
              )}
              {/* <div>
                  <ThemeToggler />
                </div> */}
              {user && navbarOpen && (
                <div className="absolute top-[50px]">
                  <Menu user={user} />{' '}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
