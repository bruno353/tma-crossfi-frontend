/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable no-unused-vars */
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import ThemeToggler from './ThemeToggler'
import menuData from './menuData'
import { UserCircle } from 'phosphor-react'
import * as Dialog from '@radix-ui/react-dialog'
import nookies, { parseCookies, destroyCookie } from 'nookies'
import axios from 'axios'
import { AccountContext } from '../../contexts/AccountContext'
import { usePathname } from 'next/navigation'
const Header = () => {
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [userNavbarOpen, setUserNavbarOpen] = useState(false)
  const [userConnected, setUserConnected] = useState()
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen)
  }
  const pathname = usePathname()
  const isFAQPage = pathname.includes('/faqs')

  const cookies = parseCookies()
  const userHasAnyCookie = cookies.userSessionToken

  const { user, setUser } = useContext(AccountContext)

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1)
  const handleSubmenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1)
    } else {
      setOpenIndex(index)
    }
  }

  function onClickTrans(element: string) {
    const taskStartElement = document.getElementById(element)
    taskStartElement.scrollIntoView({ behavior: 'smooth' })
  }

  function signOutUser() {
    destroyCookie(undefined, 'userSessionToken')
    nookies.destroy(null, 'userSessionToken')
    setUser(null)
  }

  const features = [
    {
      label: 'About',
      isCurrentlyPage: false,
      href: `${process.env.NEXT_PUBLIC_BASE_URL}/oen/about`,
    },
    {
      label: 'Expert community',
      isCurrentlyPage: !isFAQPage,
      href: `${process.env.NEXT_PUBLIC_BASE_URL}/oec`,
    },
    {
      label: 'Academy',
      isCurrentlyPage: false,
      href: `${process.env.NEXT_PUBLIC_BASE_URL}/academy`,
    },
    // {
    //   label: 'Success Stories',
    //   isCurrentlyPage: false,
    //   href: `${process.env.NEXT_PUBLIC_BASE_URL}/community`,
    // },
    {
      label: 'FAQs',
      isCurrentlyPage: isFAQPage,
      href: `${process.env.NEXT_PUBLIC_BASE_URL}/oec/faqs`,
    },
  ]

  async function getUserData() {
    const { userSessionToken } = parseCookies()
    console.log('no user data')
    console.log(userSessionToken)
    if (userSessionToken) {
      const config = {
        method: 'post' as 'post',
        url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/openmesh-experts/functions/getCurrentUser`,
        headers: {
          'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
          'X-Parse-Session-Token': userSessionToken,
          'Content-Type': 'application/json',
        },
      }
      let dado

      await axios(config).then(function (response) {
        if (response.data) {
          dado = response.data
          console.log(dado)
          setUser(dado)
        }
      })
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
        destroyCookie(undefined, 'userSessionToken')
        setUser(null)
      }
    } else {
      localStorage.removeItem('@scalable: user-state-1.0.0')
      destroyCookie(undefined, 'userSessionToken')
      setUser(null)
    }
  }, [])

  return (
    <>
      {/* <Link href="#">
        <div className="max-w-screen flex h-[32px] w-full items-center justify-center bg-gradient-to-r from-[#2250C4] via-[#D18BC0] to-[#E48D92]">
          <span className="text-xs text-white">
            Query engine is live! Apply for beta testing here
          </span>
        </div>
      </Link> */}
      <header className="max-w-screen left-0 top-0 z-40 mx-0 flex h-[95px] w-full  items-center bg-[#F9F9F9]  bg-opacity-80 text-[#000000]">
        <div className="w-full justify-between px-[20px] md:px-[90px] xl:hidden">
          <div className="">
            <img
              src={`${
                process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                  ? process.env.NEXT_PUBLIC_BASE_PATH
                  : ''
              }/images/new/logo.png`}
              alt="image"
              className={`w-[150px]`}
            />
          </div>
          <button
            onClick={navbarToggleHandler}
            id="navbarToggler"
            aria-label="Mobile Menu"
            className="absolute right-7 top-7 block  rounded-lg px-3 py-[6px] ring-primary focus:ring-2"
          >
            <span
              className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300  ${
                navbarOpen ? ' top-[7px] rotate-45' : ' '
              }`}
            />
            <span
              className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 ${
                navbarOpen ? 'opacity-0 ' : ' '
              }`}
            />
            <span
              className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300  ${
                navbarOpen ? ' top-[-8px] -rotate-45' : ' '
              }`}
            />
          </button>
          <nav
            id="navbarCollapse"
            className={`navbar absolute right-7 z-50 w-[250px] rounded border-[.5px] bg-[#e6e4e4] px-6  py-6 text-[13px] text-[#fff] duration-300  ${
              navbarOpen
                ? 'visibility top-20 opacity-100'
                : 'invisible top-20 opacity-0'
            }`}
          >
            <div className=" grid gap-y-[15px] text-[12px]  font-medium !leading-[19px]">
              {features.map((feature, index) => (
                <div className="flex h-full items-center" key={index}>
                  <a
                    className={`flex h-full cursor-pointer items-center text-[#000]  hover:bg-[#ececec] ${
                      feature.isCurrentlyPage
                        ? 'border-b  text-[14px] font-bold '
                        : ''
                    }`}
                  >
                    {feature.label}
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-[35px]">
              <div>
                {' '}
                <a
                  href={`/oec/register`}
                  className=" cursor-pointer items-center rounded-[5px] border border-[#0354EC] bg-transparent px-[18px] py-[9px] text-[13px] font-bold !leading-[19px] text-[#0354EC] hover:bg-[#0354EC] hover:text-[#fff]"
                >
                  Become an expert
                </a>
              </div>

              {user?.sessionToken ? (
                <div className="mt-[30px]">
                  <div className="mx-auto flex w-3/4 justify-center border-b border-[#000]">
                    {' '}
                  </div>
                  <div className="flex">
                    {' '}
                    <img
                      src={
                        !user.profilePictureHash
                          ? `${
                              process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                                ? process.env.NEXT_PUBLIC_BASE_PATH
                                : ''
                            }/images/header/user-circle.svg`
                          : `https://cloudflare-ipfs.com/ipfs/${user.profilePictureHash}`
                      }
                      alt="image"
                      onClick={() => {
                        setUserNavbarOpen(!userNavbarOpen)
                      }}
                      className={`mr-[15px] mt-[25px] h-[50px] w-[50px] cursor-pointer rounded-[100%] 2xl:mr-[15px]`}
                    />
                    <div className="mt-[30px] h-fit py-0 text-[12px] font-medium !leading-[19px]">
                      <div className=" flex items-center">
                        <a
                          href={`${
                            process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                              ? `${process.env.NEXT_PUBLIC_BASE_URL}/oec/my-account`
                              : '/my-account'
                          }`}
                          className={`flex cursor-pointer items-center text-[#000]   hover:text-[#313131]`}
                        >
                          My account
                        </a>
                      </div>
                      <div className="mt-[5px] flex items-center">
                        <a
                          href={`${
                            process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                              ? `${process.env.NEXT_PUBLIC_BASE_URL}/oec/change-password`
                              : '/change-password'
                          }`}
                          className={`flex cursor-pointer items-center text-[#000]  hover:text-[#313131]`}
                        >
                          Change password
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-[25px]">
                    <a
                      onClick={signOutUser}
                      className=" cursor-pointer items-center rounded-[5px] border  border-[#000] bg-transparent px-[18px] py-[6px] text-[12px] font-bold !leading-[19px] text-[#575757] hover:bg-[#ececec]"
                    >
                      Sign out
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-[25px]">
                  <a
                    href={`${
                      process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                        ? `/oec/login`
                        : '/login'
                    }`}
                    className=" cursor-pointer items-center bg-transparent text-[13px]  font-bold !leading-[19px] text-[#000] hover:text-[#3b3a3a]"
                  >
                    Login
                  </a>
                </div>
              )}
            </div>
          </nav>
        </div>
        <div className="hidden h-full w-full items-center justify-between px-[70px] xl:flex">
          <div className="flex  h-full items-center">
            <a href={'/oen'}>
              <img
                src={`${
                  process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                    ? process.env.NEXT_PUBLIC_BASE_PATH
                    : ''
                }/images/new/logo.png`}
                alt="image"
                className={`mr-[60px] w-[200px]`}
              />
            </a>
            <div className="flex h-full items-center gap-x-[1px] text-[14px] font-medium !leading-[19px] 2xl:gap-x-[20px] 2xl:text-[16px]">
              {features.map((feature, index) => (
                <div className="flex h-full items-center" key={index}>
                  <a
                    className={`flex h-full cursor-pointer  items-center px-[25px] hover:bg-[#ececec] 2xl:px-[45px] ${
                      feature.isCurrentlyPage ? 'bg-[#ececec] font-bold' : ''
                    }`}
                    href={feature.href}
                  >
                    {feature.label}
                  </a>
                </div>
              ))}
            </div>
          </div>
          <div
            className={` flex justify-between  ${
              user?.sessionToken
                ? 'gap-x-[20px]'
                : 'gap-x-[40px] 2xl:gap-x-[80px]'
            }`}
          >
            <a
              href={`/oec/register`}
              className="flex cursor-pointer items-center rounded-[5px] border border-[#0354EC] bg-transparent  px-[18px] py-[9px] text-[14px] font-bold !leading-[19px] text-[#0354EC] hover:bg-[#0354EC] hover:text-[#fff] 2xl:px-[24px] 2xl:py-[11.5px] 2xl:text-[16px]"
            >
              Become an expert
            </a>
            {user?.sessionToken ? (
              <div>
                <img
                  src={
                    !user.profilePictureHash
                      ? `${
                          process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                            ? process.env.NEXT_PUBLIC_BASE_PATH
                            : ''
                        }/images/header/user-circle.svg`
                      : `https://cloudflare-ipfs.com/ipfs/${user.profilePictureHash}`
                  }
                  alt="image"
                  onClick={() => {
                    setUserNavbarOpen(!userNavbarOpen)
                  }}
                  className={`mr-[15px] h-[50px] w-[50px] cursor-pointer rounded-[100%] 2xl:mr-[15px]`}
                />
                <nav
                  className={`navbar absolute right-[100px] z-50 flex w-[220px] rounded-[8px] border-[.5px] bg-[#e6e4e4] pb-[30px] pl-[35px] pr-6 pt-[19px] text-[13px] text-[#fff] duration-300  ${
                    userNavbarOpen
                      ? 'visibility top-20 opacity-100'
                      : 'invisible top-20 opacity-0'
                  }`}
                >
                  <div className="mt-[10px]">
                    <div className=" grid gap-y-[15px] text-[15px]  font-medium !leading-[19px]">
                      <div className="flex h-full items-center">
                        <a
                          href={`${
                            process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                              ? `/oec/my-account`
                              : '/my-account'
                          }`}
                          className={`flex h-full cursor-pointer items-center text-[#000]  hover:text-[#313131]`}
                        >
                          My account
                        </a>
                      </div>
                      <div className="flex h-full items-center">
                        <a
                          href={`${
                            process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                              ? `/oec/change-password`
                              : '/change-password'
                          }`}
                          className={`flex h-full cursor-pointer items-center text-[#000]  hover:text-[#313131]`}
                        >
                          Change password
                        </a>
                      </div>
                    </div>
                    <div className="mt-[25px]">
                      <a
                        onClick={signOutUser}
                        className=" cursor-pointer items-center rounded-[5px] border  border-[#000] bg-transparent px-[18px] py-[6px] text-[12px] font-bold !leading-[19px] text-[#575757] hover:bg-[#ececec]"
                      >
                        Sign out
                      </a>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setUserNavbarOpen(false)
                    }}
                    className="ml-[20px]  flex cursor-pointer justify-end text-[16px] font-bold text-[#000] hover:text-[#313131]"
                  >
                    x
                  </div>
                </nav>
              </div>
            ) : (
              <a
                href={`${
                  process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                    ? `/oec/login`
                    : '/login'
                }`}
                className=" my-auto h-fit cursor-pointer items-center   border-b  border-[#000] bg-transparent text-[16px]  font-bold !leading-[19px] text-[#000] hover:text-[#3b3a3a]"
              >
                Login
              </a>
            )}
          </div>
          {/* <div className="lg:hidden">
              <Dialog.Root>
                <Dialog.Trigger>
                  <List className="text-black" size={24} weight="bold" />
                </Dialog.Trigger>
                <HeaderModal navigationItems={navigationItems} />
              </Dialog.Root>
            </div> */}
        </div>
      </header>
    </>
  )
}

export default Header
