/* eslint-disable react/no-unescaped-entities */
'use client'
// import { useState } from 'react'
import { useState } from 'react'

const Faqs = () => {
  const [isFaq1Open, setIsFaq1Open] = useState<boolean>(false)
  const [isFaq2Open, setIsFaq2Open] = useState<boolean>(false)
  const [isFaq3Open, setIsFaq3Open] = useState<boolean>(false)
  const [isFaq4Open, setIsFaq4Open] = useState<boolean>(false)
  const [isFaq5Open, setIsFaq5Open] = useState<boolean>(false)
  const [isFaq6Open, setIsFaq6Open] = useState<boolean>(false)

  function handleFaq1() {
    setIsFaq1Open(!isFaq1Open)
  }
  function handleFaq2() {
    setIsFaq2Open(!isFaq2Open)
  }
  function handleFaq3() {
    setIsFaq3Open(!isFaq3Open)
  }
  function handleFaq4() {
    setIsFaq4Open(!isFaq4Open)
  }
  function handleFaq5() {
    setIsFaq5Open(!isFaq5Open)
  }
  function handleFaq6() {
    setIsFaq6Open(!isFaq6Open)
  }

  return (
    <>
      <section
        id="faqs"
        className="relative z-10 overflow-hidden  bg-white px-[20px] pb-[60px] pt-[50px] text-[#000000] lg:pb-[129px] lg:pt-[98px]"
      >
        <div className="mx-auto xl:w-[1359px]">
          <div className="text-[16px] font-bold lg:text-[22px] xl:text-[32px]">
            FAQs.{''}{' '}
            <span className="font-semibold text-[#959595]">
              Frequenty Asked Questions
            </span>
          </div>
          <div className="mt-[23px] text-[11px] font-bold lg:mt-[47px] xl:text-[16px]">
            <div className="border-b-[1px] border-[#D4D4D4] pb-[15px] lg:pb-[20px]">
              <div
                className="flex cursor-pointer justify-between"
                onClick={handleFaq1}
              >
                <div>What is Openmesh's main goal?</div>
                <img
                  onClick={handleFaq1}
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/hero7/arrow.svg`}
                  alt="image"
                  className={`cursor-pointer pl-2  lg:pl-0 ${
                    isFaq1Open ? 'rotate-180 transform' : ''
                  }`}
                />
              </div>
              <div
                className={`mt-[10px] text-[10px] font-medium text-[#505050] lg:mt-[15px] xl:text-[14px] ${
                  isFaq1Open ? '' : 'hidden'
                }`}
              >
                Openmesh is focused on establishing a decentralized data
                infrastructure that allows for the storage of crucial global
                data without the need for intermediaries. This initiative starts
                with Web3 data and aims to provide a secure and efficient data
                storage solution.
              </div>
            </div>
            <div className="border-b-[1px] border-[#D4D4D4] py-[20px]">
              <div
                className="flex cursor-pointer justify-between"
                onClick={handleFaq2}
              >
                <div>
                  What tools and services does Openmesh offer to developers?
                </div>
                <img
                  onClick={handleFaq2}
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/hero7/arrow.svg`}
                  alt="image"
                  className={`cursor-pointer pl-2  lg:pl-0 ${
                    isFaq2Open ? 'rotate-180 transform' : ''
                  }`}
                />
              </div>
              <div
                className={`mt-[10px] text-[10px] font-medium text-[#505050] lg:mt-[15px] xl:text-[14px] ${
                  isFaq2Open ? '' : 'hidden'
                }`}
              >
                Openmesh provides developers with a comprehensive set of tools
                and a stack designed to facilitate the planning, design,
                deployment, and management of data infrastructure and
                applications. The goal is to reduce the time required for these
                tasks from weeks to minutes, with costs limited to computing and
                storage.
              </div>
            </div>
            <div className="border-b-[1px] border-[#D4D4D4] py-[20px]">
              <div
                className="flex cursor-pointer justify-between"
                onClick={handleFaq3}
              >
                <div>Are there any fees associated with using Openmesh?</div>
                <img
                  onClick={handleFaq3}
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/hero7/arrow.svg`}
                  alt="image"
                  className={`cursor-pointer pl-2  lg:pl-0 ${
                    isFaq3Open ? 'rotate-180 transform' : ''
                  }`}
                />
              </div>
              <div
                className={`mt-[10px] text-[10px] font-medium text-[#505050] lg:mt-[15px] xl:text-[14px] ${
                  isFaq3Open ? '' : 'hidden'
                }`}
              >
                Openmesh operates with a no-fee model. There are no license fees
                or setup fees for utilizing their tools and infrastructure,
                making it more accessible to developers and companies.
              </div>
            </div>
            <div className="border-b-[1px] border-[#D4D4D4] py-[20px]">
              <div
                className="flex cursor-pointer justify-between"
                onClick={handleFaq4}
              >
                <div>
                  What is the significance of the Openmesh Expert badge?
                </div>
                <img
                  onClick={handleFaq4}
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/hero7/arrow.svg`}
                  alt="image"
                  className={`cursor-pointer pl-2  lg:pl-0 ${
                    isFaq4Open ? 'rotate-180 transform' : ''
                  }`}
                />
              </div>
              <div
                className={`mt-[10px] text-[10px] font-medium text-[#505050] lg:mt-[15px] xl:text-[14px] ${
                  isFaq4Open ? '' : 'hidden'
                }`}
              >
                The Openmesh Expert badge serves as recognition of your
                expertise not only in Openmesh Core services but also in data
                and blockchain infrastructure services. This badge helps
                companies identify individuals with specialized knowledge in
                these domains.
              </div>
            </div>
            <div className="border-b-[1px] border-[#D4D4D4] py-[20px]">
              <div
                className="flex cursor-pointer justify-between"
                onClick={handleFaq5}
              >
                <div>
                  How can leveraging the Openmesh network benefit my business?
                </div>
                <img
                  onClick={handleFaq5}
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/hero7/arrow.svg`}
                  alt="image"
                  className={`cursor-pointer pl-2  lg:pl-0 ${
                    isFaq5Open ? 'rotate-180 transform' : ''
                  }`}
                />
              </div>
              <div
                className={`mt-[10px] text-[10px] font-medium text-[#505050] lg:mt-[15px] xl:text-[14px] ${
                  isFaq5Open ? '' : 'hidden'
                }`}
              >
                With the increasing demand for data in the global economy, being
                a part of the Openmesh network can help you attract more clients
                and form valuable partnerships. The network provides a platform
                to connect with potential collaborators and contributors,
                leading to growth opportunities.
              </div>
            </div>
            <div className="border-b-[1px] border-[#D4D4D4] py-[20px]">
              <div
                className="flex cursor-pointer justify-between"
                onClick={handleFaq6}
              >
                <div>
                  How can I stay updated on Openmesh's products and offerings?
                </div>
                <img
                  onClick={handleFaq6}
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/hero7/arrow.svg`}
                  alt="image"
                  className={`cursor-pointer pl-2  lg:pl-0 ${
                    isFaq6Open ? 'rotate-180 transform' : ''
                  }`}
                />
              </div>
              <div
                className={`mt-[10px] text-[10px] font-medium text-[#505050] lg:mt-[15px] xl:text-[14px] ${
                  isFaq6Open ? '' : 'hidden'
                }`}
              >
                By joining the expanding Openmesh network, you'll have access to
                product updates and offerings through collaborations and
                contributions. You'll be among the first to receive information
                about new features and developments.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Faqs
