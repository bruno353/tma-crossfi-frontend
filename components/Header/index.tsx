'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState, useContext, useRef } from 'react'
import ThemeToggler from './ThemeToggler'
import menuData from './menuData'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { AccountContext } from '../../contexts/AccountContext'
import { getCurrentUser } from '@/utils/api'
import { usePathname, useRouter } from 'next/navigation'
import Menu from './Menu'
import NotificationMenu from './NotificationMenu'

const Header = () => {
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)

  const navbarToggleHandler = () => {
    console.log(user)
    setNavbarOpen(!navbarOpen)
    setMenuOpen(!menuOpen)
    setNotificationOpen(false)
  }
  const notificationToggleHandler = () => {
    setNotificationOpen(!notificationOpen)
    setNavbarOpen(false)
    setMenuOpen(!menuOpen)
  }

  const [menuOpen, setMenuOpen] = useState(false)

  const menuRef = useRef(null)

  const closeMenu = () => {
    setNotificationOpen(false)
    setNavbarOpen(false)
    setMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Clicked outside of the menu, so close it
        closeMenu()
      }
    }

    // Add event listener when the menu is open
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      // Remove event listener when the menu is closed
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const pathname = usePathname()

  const cookies = parseCookies()
  const userHasAnyCookie = cookies.userSessionToken

  const { user, setUser } = useContext(AccountContext)
  const { push } = useRouter()

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
      try {
        const dado = await getCurrentUser(userSessionToken)
        if (dado) {
          setUser(dado)
          destroyCookie(undefined, 'user')
          destroyCookie(undefined, 'userSessionToken')
          setCookie(null, 'userSessionToken', dado.sessionToken)
          setCookie(null, 'user', JSON.stringify(dado))
          handleUserPath(true)
        } else {
          cleanData()
          handleUserPath(false)
        }
      } catch (err) {
        cleanData()
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

  const hasUnreadenInvitation = user?.WorkspaceInvite?.some(
    (work) => !work.viewed,
  )

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
      console.log('user has no cookies')
      cleanData()
    }
  }, [])

  return (
    <>
      <header
        className={`header relative !z-[9999] flex h-[10vh] w-full items-center !bg-white !bg-opacity-80 shadow-sticky backdrop-blur-sm !transition dark:!bg-transparent dark:!bg-opacity-60`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-60 max-w-full px-4 xl:mr-12">
              <Link
                onClick={() => {
                  console.log(user)
                }}
                href={user ? '/dashboard' : '/'}
                className={`header-logo block w-full py-8`}
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
            <div className="flex items-center  justify-end gap-x-[30px]">
              <div className="relative">
                {user && user.WorkspaceInvite?.length > 0 && (
                  <div
                    onClick={() => {
                      notificationToggleHandler()
                    }}
                  >
                    {hasUnreadenInvitation ? (
                      <img
                        src="/images/header/inviteWithSignal.svg"
                        alt="image"
                        className={`w-[45px] cursor-pointer`}
                      />
                    ) : (
                      <img
                        src="/images/header/inviteWithoutSignal.svg"
                        alt="image"
                        className={`w-[45px] cursor-pointer`}
                      />
                    )}
                  </div>
                )}
                {user &&
                  notificationOpen &&
                  user.WorkspaceInvite?.length > 0 && (
                    <div className="absolute right-0 top-[50px]" ref={menuRef}>
                      <NotificationMenu
                        workspaceInvites={user.WorkspaceInvite}
                        user={user}
                        onSignOut={signOutUser}
                        onCloseNotifications={() => {
                          setNotificationOpen(false)
                        }}
                        onWorkspaceInviteViewed={(value) => {
                          const updatedUser = { ...user }
                          const inviteIndex =
                            updatedUser.WorkspaceInvite.findIndex(
                              (invite) => invite.id === value,
                            )
                          if (inviteIndex !== -1) {
                            console.log('found')
                            updatedUser.WorkspaceInvite[inviteIndex] = {
                              ...updatedUser.WorkspaceInvite[inviteIndex],
                              viewed: true,
                            }
                            setUser(updatedUser)
                          }
                        }}
                        onWorkspaceInviteArchived={(value) => {
                          const updatedUser = { ...user }

                          const inviteIndex =
                            updatedUser.WorkspaceInvite.findIndex(
                              (invite) => invite.id === value,
                            )

                          if (inviteIndex !== -1) {
                            console.log('found archived')
                            const updatedInvites = [
                              ...updatedUser.WorkspaceInvite,
                            ]
                            updatedInvites.splice(inviteIndex, 1)
                            console.log('final updated invites')
                            console.log(updatedInvites)
                            updatedUser.WorkspaceInvite = updatedInvites
                            setUser(updatedUser)
                          }
                        }}
                      />{' '}
                    </div>
                  )}
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
                  <div className="absolute top-[50px]" ref={menuRef}>
                    <Menu user={user} onSignOut={signOutUser} />{' '}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
