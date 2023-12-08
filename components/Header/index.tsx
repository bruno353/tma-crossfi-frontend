'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ThemeToggler from './ThemeToggler'
import menuData from './menuData'

const Header = () => {
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false)
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen)
  }

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
                href="/"
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
            <div className="flex items-center justify-end pr-16 lg:pr-0">
              <Link
                href="/signin"
                className="rounded-md bg-transparent px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-[#652ee786] "
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-transparent px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-[#652ee786] "
              >
                Sign Up
              </Link>
              {/* <div>
                  <ThemeToggler />
                </div> */}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
