/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useEffect, useRef, useState, useContext } from 'react'
import Dropdown, { ValueObject } from '../../Modals/Dropdown'
import {
  BlockchainContractProps,
  BlockchainWalletProps,
} from '@/types/blockchain-app'
import { optionsNetwork } from '../MainPage'
import { callAxiosBackend } from '@/utils/general-api'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { parseCookies } from 'nookies'
import CntDeploymentHistoryModal from './CntDeploymentHistoryModal'
import { transformString, wait } from '@/utils/functions'

export interface MenuI {
  id: string
  blockchainWallets: BlockchainWalletProps[]
  selected: ValueObject
  setSelected(value: ValueObject): void
  blockchainWalletsSelected: ValueObject
  setBlockchainWalletsSelected(value: ValueObject): void
  blockchainWalletsDropdown: ValueObject[]
  isLoadingContracts: boolean
  setIsLoadingContracts(value: boolean): void
  blockchainContracts: BlockchainContractProps[]
  setBlockchainContracts(value: BlockchainContractProps[]): void
  blockchainContractSelected: BlockchainContractProps
  setBlockchainContractSelected(value: BlockchainContractProps): void
  contractRename: BlockchainContractProps | null
  setContractRename(value: BlockchainContractProps | null): void
  contractName: string
  setContractName(value: string): void
  nameRef: any
  isLoadingNewContract: boolean
  setIsLoadingNewContract(value: boolean): void
  openCode: boolean
  setOpenCode(value: boolean): void
  openContracts: boolean
  setOpenContracts(value: boolean): void
  openConsole: boolean
  setOpenConsole(value: boolean): void
}

const Sidebar = ({
  id,
  blockchainWallets,
  selected,
  setSelected,
  blockchainWalletsSelected,
  setBlockchainWalletsSelected,
  blockchainWalletsDropdown,
  isLoadingContracts,
  setIsLoadingContracts,
  blockchainContracts,
  setBlockchainContracts,
  blockchainContractSelected,
  setBlockchainContractSelected,
  contractRename,
  setContractRename,
  contractName,
  setContractName,
  nameRef,
  isLoadingNewContract,
  setIsLoadingNewContract,
  openCode,
  setOpenCode,
  openContracts,
  setOpenContracts,
  openConsole,
  setOpenConsole,
}: MenuI) => {
  const [isContractsListOpen, setIsContractsListOpen] = useState(true)
  const [
    isContractsDeploymentHistoryListOpen,
    setIsContractsDeploymentHistoryListOpen,
  ] = useState(true)

  const [isCntDeploymentHistoryModalOpen, setIsCntDeploymentHistoryModalOpen] =
    useState<string>('')

  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const [isMouseOverModal, setIsMouseOverModal] = useState<boolean>(false)

  const relativeDivRef = useRef<HTMLDivElement | null>(null)
  const targetDivRef = useRef<HTMLDivElement | null>(null)
  const [divPosition, setDivPosition] = useState<{
    top: number
    left: number
  } | null>(null)

  const [blockchainContractHovered, setBlockchainContractHovered] =
    useState<BlockchainContractProps | null>()

  async function createNewContract() {
    setIsLoadingNewContract(true)
    const { userSessionToken } = parseCookies()

    const data = {
      workspaceId: id,
      network: 'STELLAR',
      code: '// write your code here',
      name: 'untitled',
    }
    try {
      const res = await callAxiosBackend(
        'post',
        `/blockchain/functions/createContract`,
        userSessionToken,
        data,
      )
      setIsLoadingNewContract(false)
      return res
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoadingNewContract(false)
  }

  async function handleDeleteContract(cnt: BlockchainContractProps) {
    const { userSessionToken } = parseCookies()

    const data = {
      id: cnt.id,
    }

    const newCnts = blockchainContracts?.filter((item) => item.id !== cnt.id)
    setBlockchainContracts(newCnts)
    try {
      await callAxiosBackend(
        'delete',
        `/blockchain/functions/deleteContract`,
        userSessionToken,
        data,
      )
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
  }

  return (
    <div
      ref={relativeDivRef}
      className="relative h-[76vh] max-h-[76vh] rounded-xl bg-[#1D2144] py-4 pl-4 pr-8 text-[13px] font-light"
    >
      <div className="relative flex gap-x-[5px]">
        <img
          alt="ethereum avatar"
          src="/images/workspace/stellar-new.svg"
          className="w-[16px]"
        ></img>
        <div className="font-medium">Soroban</div>
      </div>
      <div className="mt-4 h-[1px] w-full bg-[#c5c4c41a]"></div>
      <div className="mt-5 w-fit">
        <div className="mb-2 flex gap-x-[5px]">
          <img
            alt="ethereum avatar"
            src="/images/depin/settings.svg"
            className="w-[16px]"
          ></img>
          <div>Environment</div>
        </div>
        <Dropdown
          optionSelected={selected}
          options={optionsNetwork}
          onValueChange={(value) => {
            setSelected(value)
          }}
          classNameForDropdown="!px-1 !pr-2 !py-1 !font-medium"
          classNameForPopUp="!px-1 !pr-2 !py-1"
          classNameForPopUpBox="!translate-y-[35px]"
        />
      </div>
      <div className="mt-4">
        <div className="mb-2 flex gap-x-[5px]">
          <img
            alt="ethereum avatar"
            src="/images/depin/card.svg"
            className="w-[16px]"
          ></img>
          <div>Wallet</div>
        </div>
        <div className="flex items-center gap-x-1">
          {blockchainWallets?.length > 0 ? (
            <Dropdown
              optionSelected={blockchainWalletsSelected}
              options={blockchainWalletsDropdown}
              onValueChange={(value) => {
                setBlockchainWalletsSelected(value)
              }}
              classNameForDropdown="!px-1 !pr-2 !py-1 !flex-grow !min-w-[130px] !font-medium"
              classNameForPopUp="!px-1 !pr-2 !py-1"
              classNameForPopUpBox="!translate-y-[35px]"
            />
          ) : (
            <div className="text-[#c5c4c4]">create a wallet </div>
          )}

          <a href={`/workspace/${id}/blockchain-wallets`}>
            <div
              title="Create wallet"
              className="flex-grow-0 cursor-pointer text-[16px]"
            >
              +
            </div>
          </a>
        </div>
        {blockchainWalletsSelected && (
          <div className="mt-2 text-[12px] text-[#c5c4c4]">
            {' '}
            Balance:{' '}
            {
              blockchainWallets.find(
                (obj) => obj.id === blockchainWalletsSelected.value,
              ).balance
            }
          </div>
        )}
      </div>
      <div className="mt-4">
        <div
          onClick={() => {
            setIsContractsListOpen(!isContractsListOpen)
          }}
          className="mb-2 flex cursor-pointer items-center gap-x-[8px]"
        >
          <div className="flex gap-x-[5px]">
            <img
              alt="ethereum avatar"
              src="/images/depin/documents.svg"
              className="w-[14px]"
            ></img>
            <div className={`${isLoadingContracts && 'animate-pulse'}`}>
              Contracts
            </div>
          </div>
          <img
            alt="ethereum avatar"
            src="/images/header/arrow-gray.svg"
            className={`w-[8px] rounded-full transition-transform duration-150 ${
              !isContractsListOpen && 'rotate-180'
            }`}
          ></img>
        </div>
        {isContractsListOpen && (
          <div>
            <div className="grid max-h-[calc(20vh)] gap-y-[2px] overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md ">
              {blockchainContracts?.map((cnt, index) => (
                <div
                  onClick={() => {
                    setBlockchainContractSelected(cnt)
                  }}
                  onMouseEnter={() => setBlockchainContractHovered(cnt)}
                  onMouseLeave={() => setBlockchainContractHovered(null)}
                  className={`relative cursor-pointer rounded-md border border-transparent bg-transparent px-2 text-[14px] hover:bg-[#dbdbdb1e] ${
                    blockchainContractSelected?.id === cnt?.id &&
                    '!bg-[#dbdbdb1e]'
                  }`}
                  key={index}
                >
                  {contractRename?.id === cnt?.id ? (
                    <input
                      value={contractName}
                      ref={nameRef}
                      className="w-[80%] max-w-[80%] overflow-hidden truncate text-ellipsis whitespace-nowrap border border-transparent bg-transparent outline-none focus:border-primary"
                      onChange={(e) => {
                        if (e.target.value.length < 50) {
                          setContractName(e.target.value)
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div className="w-[80%] max-w-[80%] overflow-hidden truncate text-ellipsis whitespace-nowrap border border-transparent bg-transparent outline-none focus:border-primary">
                      {' '}
                      {cnt?.name}{' '}
                    </div>
                  )}

                  {blockchainContractHovered?.id === cnt.id && (
                    <div className="absolute right-0 top-0 flex h-full px-[10px] text-[10px] backdrop-blur-sm">
                      <div className="flex items-center gap-x-2">
                        <img
                          onClick={(e) => {
                            e.stopPropagation()
                            setContractRename(cnt)
                            setContractName(cnt.name)
                          }}
                          src={`/images/depin/pencil.svg`}
                          alt="image"
                          className="my-auto w-[18px] cursor-pointer"
                        />
                        <img
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteContract(cnt)
                          }}
                          src={`/images/depin/garbage.svg`}
                          alt="image"
                          className="my-auto w-[11px] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div
              onClick={async () => {
                if (!isLoadingNewContract) {
                  const newContract: BlockchainContractProps =
                    await createNewContract()
                  const newCnts = [newContract, ...blockchainContracts]
                  setBlockchainContracts(newCnts)
                  setBlockchainContractSelected(newContract)
                }
              }}
              className={`mt-1 w-fit cursor-pointer rounded-[7px] px-[6px] py-[2px] text-[12px] text-[#c5c4c4] hover:bg-[#dbdbdb1e] ${
                isLoadingNewContract && 'animate-pulse'
              }`}
            >
              + New contract
            </div>
          </div>
        )}
      </div>{' '}
      <div className="mt-4">
        <div
          onClick={() => {
            setIsContractsDeploymentHistoryListOpen(
              !isContractsDeploymentHistoryListOpen,
            )
          }}
          className="mb-2 flex cursor-pointer items-center gap-x-[8px]"
        >
          <div className="flex gap-x-[5px]">
            <img
              alt="ethereum avatar"
              src="/images/depin/history.svg"
              className="w-[16px]"
            ></img>
            <div className={`${isLoadingContracts && 'animate-pulse'}`}>
              History
            </div>
          </div>
          <img
            alt="ethereum avatar"
            src="/images/header/arrow-gray.svg"
            className={`w-[8px] rounded-full transition-transform duration-150 ${
              !isContractsDeploymentHistoryListOpen && 'rotate-180'
            }`}
          ></img>
        </div>
        {isContractsDeploymentHistoryListOpen && (
          <div
            onMouseLeave={async () => {
              setIsCntDeploymentHistoryModalOpen('')
            }}
          >
            {blockchainContractSelected ? (
              <div className="grid max-h-[calc(20vh)] gap-y-[2px] overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md ">
                {blockchainContractSelected?.ideContractDeploymentHistories.map(
                  (cntHistory, index) => {
                    return (
                      <div
                        ref={(el) => (itemRefs.current[index] = el)}
                        onMouseEnter={() => {
                          setIsMouseOverModal(true)
                          setIsCntDeploymentHistoryModalOpen(cntHistory.id)
                          if (
                            relativeDivRef.current &&
                            itemRefs.current[index]
                          ) {
                            const parentRect =
                              relativeDivRef.current.getBoundingClientRect()
                            const targetRect =
                              itemRefs.current[index].getBoundingClientRect()

                            setDivPosition({
                              top: targetRect.top - parentRect.top,
                              left: targetRect.left - parentRect.left,
                            })
                            console.log({
                              top: targetRect.top - parentRect.top,
                              left: targetRect.left - parentRect.left,
                            })
                          }
                        }}
                        className={`relative  flex items-center rounded-md border border-transparent bg-transparent px-2 text-[14px] hover:bg-[#dbdbdb1e] ${
                          isCntDeploymentHistoryModalOpen === cntHistory?.id &&
                          '!bg-[#dbdbdb1e]'
                        }`}
                        key={index}
                      >
                        <div className="w-[80%] max-w-[100%] overflow-hidden truncate text-ellipsis whitespace-nowrap border border-transparent bg-transparent text-[13px] outline-none focus:border-primary">
                          {' '}
                          {transformString(cntHistory?.contractAddress, 4)}
                        </div>
                        <div className="text-[12px] text-[#c5c4c4]">
                          {String(
                            new Date(cntHistory?.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            ),
                          )}
                        </div>

                        {/* {isCntDeploymentHistoryModalOpen === cntHistory.id && (
                          <div className="absolute -top-[10px] -translate-y-[100%] ">
                            <CntDeploymentHistoryModal
                              ideContractDeploymentHistories={cntHistory}
                            />
                          </div>
                        )} */}
                      </div>
                    )
                  },
                )}
              </div>
            ) : (
              <div> Select a contract to visualizate its history </div>
            )}
            {isCntDeploymentHistoryModalOpen?.length > 0 && divPosition && (
              <div
                className="absolute z-50"
                style={{
                  top: `${divPosition.top}px`,
                  left: `${divPosition.left}px`,
                  transform: 'translateY(10px) translateX(120px)',
                }}
              >
                <CntDeploymentHistoryModal
                  ideContractDeploymentHistories={blockchainContractSelected?.ideContractDeploymentHistories.find(
                    (cn) => cn.id === isCntDeploymentHistoryModalOpen,
                  )}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="absolute bottom-4 flex gap-x-3">
        <img
          onClick={() => setOpenCode(!openCode)}
          src={
            openCode
              ? '/images/depin/write.svg'
              : '/images/depin/write-grey.svg'
          }
          alt="ethereum avatar"
          className="w-[17px] cursor-pointer"
        ></img>
        <img
          onClick={() => setOpenContracts(!openContracts)}
          alt="ethereum avatar"
          src={
            openContracts
              ? '/images/depin/document.svg'
              : '/images/depin/document-grey.svg'
          }
          className="w-[16px] cursor-pointer"
        ></img>
        <img
          onClick={() => setOpenConsole(!openConsole)}
          alt="ethereum avatar"
          src={
            openConsole
              ? '/images/depin/terminal.svg'
              : '/images/depin/terminal-grey.svg'
          }
          className="w-[18px] cursor-pointer"
        ></img>
      </div>
    </div>
  )
}

export default Sidebar
