/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useEffect, useRef, useState, useContext } from 'react'
import Dropdown, { ValueObject } from '../../Modals/Dropdown'
import {
  BlockchainContractProps,
  BlockchainWalletProps,
} from '@/types/blockchain-app'
import { TypeWalletProvider, optionsNetwork } from '../MainPage'
import { callAxiosBackend } from '@/utils/general-api'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { parseCookies } from 'nookies'
import CntDeploymentHistoryModal from './CntDeploymentHistoryModal'
import { transformString, wait } from '@/utils/functions'
import { SmileySad } from 'phosphor-react'
import { checkConnection, retrievePublicKey } from '../Funcs/freighter'
import ChainSelector from '../Components/ChainSelector'
import { AccountContext } from '@/contexts/AccountContext'
import { CHAIN_TO_TEMPLATE } from '@/types/consts/ide'

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
  isLoadingWallets: boolean
  getData(value: string): void
  walletProvider: TypeWalletProvider
  setWalletProvider(value: TypeWalletProvider): void
  connect: string
  connectWallet(): void
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
  getData,
  isLoadingWallets,
  walletProvider,
  setWalletProvider,
  connect,
  connectWallet,
}: MenuI) => {
  const [isContractsListOpen, setIsContractsListOpen] = useState(true)
  const [
    isContractsDeploymentHistoryListOpen,
    setIsContractsDeploymentHistoryListOpen,
  ] = useState(false)

  const { ideChain, setIDEChain } = useContext(AccountContext)

  const [isCntDeploymentHistoryModalOpen, setIsCntDeploymentHistoryModalOpen] =
    useState<string>('')

  const [cntIconHovered, setCntIconHovered] = useState<string>('')

  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const relativeDivRef = useRef<HTMLDivElement | null>(null)
  const [divPosition, setDivPosition] = useState<{
    top: number
    left: number
  } | null>(null)

  const [isCntModalOpen, setIsCntModalOpen] = useState<string>('')
  const itemRefsCnt = useRef<(HTMLDivElement | null)[]>([])

  const [divPositionContracts, setDivPositionContracts] = useState<{
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
      network: ideChain,
      code: CHAIN_TO_TEMPLATE[ideChain],
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
      className="relative h-[81vh] max-h-[81vh] rounded-xl bg-[#1D2144] py-4 pl-4 pr-8 text-[13px] font-light 2xl:h-[82vh] 2xl:max-h-[82vh]"
    >
      <ChainSelector
        onUpdateM={() => {
          console.log('e')
        }}
      />
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
            getData(value.value)
          }}
          classNameForDropdown="!px-1 !pr-2 !py-1 !font-medium"
          classNameForPopUp="!px-1 !pr-2 !py-1"
          classNameForPopUpBox="!translate-y-[35px]"
        />
      </div>
      <div className="mt-4 ">
        <div className="mb-2 flex gap-x-[5px] ">
          <img
            alt="ethereum avatar"
            src="/images/depin/card.svg"
            className="w-[16px]"
          ></img>
          <div
            title="Copy wallet address"
            className={`${blockchainWallets?.length > 0 && 'cursor-pointer'}`}
            onClick={(event) => {
              event.stopPropagation()
              if (!blockchainWalletsSelected) {
                return
              }
              const index = blockchainWallets?.find(
                (blc) => blc.id === blockchainWalletsSelected.value,
              )
              navigator.clipboard.writeText(index.stellarWalletPubK)
              toast.success('Wallet copied')
            }}
          >
            Wallet
          </div>
        </div>
        <div className="mb-3 mt-1 flex w-fit gap-x-[1px] rounded-xl bg-[#242B51] px-1 py-1">
          <div
            onClick={() => {
              setWalletProvider(TypeWalletProvider.ACCELAR)
            }}
            className={`cursor-pointer rounded-xl px-2 py-1 ${
              walletProvider === TypeWalletProvider.ACCELAR && 'bg-[#dbdbdb1e]'
            }`}
          >
            Accelar
          </div>
          <div
            onClick={() => {
              setWalletProvider(TypeWalletProvider.FREIGHTER)
            }}
            className={`cursor-pointer rounded-xl px-2 py-1 ${
              walletProvider === TypeWalletProvider.FREIGHTER &&
              'bg-[#dbdbdb1e]'
            }`}
          >
            Freighter
          </div>
        </div>
        {walletProvider === TypeWalletProvider.ACCELAR && (
          <div>
            {isLoadingWallets ? (
              <div className="mb-2 flex h-[25px] w-full animate-pulse rounded-md bg-[#dbdbdb1e]"></div>
            ) : (
              <>
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
                    <div className="my-auto mt-1 text-[#c5c4c4]">
                      create a wallet{' '}
                    </div>
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
                      blockchainWallets?.find(
                        (obj) => obj.id === blockchainWalletsSelected.value,
                      )?.balance
                    }
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {walletProvider === TypeWalletProvider.FREIGHTER && (
          <div className="mb-8">
            {isLoadingWallets ? (
              <div className="mb-2 flex h-[25px] w-full animate-pulse rounded-md bg-[#dbdbdb1e]"></div>
            ) : (
              <>
                <div
                  onClick={connectWallet}
                  className={` ${
                    connect !== 'Connect Wallet'
                      ? ''
                      : 'cursor-pointer hover:bg-[#7542f7]'
                  } mx-auto flex w-fit items-center justify-center  gap-x-2 whitespace-nowrap rounded-lg bg-[#634cc9b6] px-5 py-1 text-center text-[14px] font-normal`}
                >
                  <img
                    alt="ethereum avatar"
                    src="/images/depin/freighter.svg"
                    className="-ml-1 w-[20px] cursor-pointer"
                  ></img>
                  <label className="cursor-pointer">
                    {connect !== 'Connect Wallet' ? (
                      <>{transformString(connect, 4)}</>
                    ) : (
                      <>Connect Wallet</>
                    )}
                  </label>
                </div>
              </>
            )}
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
          <div
            onMouseLeave={async () => {
              setIsCntModalOpen('')
            }}
          >
            <div
              className={`grid ${
                isContractsDeploymentHistoryListOpen
                  ? 'max-h-[calc(10vh)]'
                  : 'max-h-[calc(18vh)]'
              }   gap-y-[2px] overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:max-h-[calc(20vh)]`}
            >
              {blockchainContracts?.map((cnt, index) => (
                <div
                  onClick={() => {
                    setBlockchainContractSelected(cnt)
                  }}
                  ref={(el) => (itemRefsCnt.current[index] = el)}
                  onMouseEnter={() => {
                    setIsCntModalOpen(cnt.id)
                    setBlockchainContractHovered(cnt)
                    if (relativeDivRef.current && itemRefsCnt.current[index]) {
                      const parentRect =
                        relativeDivRef.current.getBoundingClientRect()
                      const targetRect =
                        itemRefsCnt.current[index].getBoundingClientRect()

                      setDivPositionContracts({
                        top: targetRect.top - parentRect.top,
                        left: targetRect.left - parentRect.left,
                      })
                      console.log({
                        top: targetRect.top - parentRect.top,
                        left: targetRect.left - parentRect.left,
                      })
                    }
                  }}
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
                      className="w-[75%] max-w-[75%] overflow-hidden truncate text-ellipsis whitespace-nowrap border border-transparent bg-transparent outline-none focus:border-primary 2xl:w-[80%] 2xl:max-w-[80%]"
                      onChange={(e) => {
                        if (e.target.value.length < 50) {
                          setContractName(e.target.value)
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div className="w-[75%] max-w-[75%] overflow-hidden truncate text-ellipsis whitespace-nowrap border border-transparent bg-transparent outline-none focus:border-primary 2xl:w-[80%] 2xl:max-w-[80%]">
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
                          onMouseEnter={() => {
                            setCntIconHovered('pencil')
                          }}
                          onMouseLeave={() => {
                            setCntIconHovered('')
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
                          onMouseEnter={() => {
                            setCntIconHovered('garbage')
                          }}
                          onMouseLeave={() => {
                            setCntIconHovered('')
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
              <>
                {blockchainContractSelected?.ideContractDeploymentHistories
                  ?.length > 0 ? (
                  <div
                    className={`grid ${
                      isContractsListOpen
                        ? 'max-h-[calc(11vh)]'
                        : '!max-h-[calc(20vh)]'
                    }  gap-y-[2px] overflow-y-auto scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md 2xl:max-h-[calc(20vh)]`}
                  >
                    {blockchainContractSelected?.ideContractDeploymentHistories.map(
                      (cntHistory, index) => {
                        return (
                          <div
                            ref={(el) => (itemRefs.current[index] = el)}
                            onMouseEnter={() => {
                              setIsCntDeploymentHistoryModalOpen(cntHistory.id)
                              if (
                                relativeDivRef.current &&
                                itemRefs.current[index]
                              ) {
                                const parentRect =
                                  relativeDivRef.current.getBoundingClientRect()
                                const targetRect =
                                  itemRefs.current[
                                    index
                                  ].getBoundingClientRect()

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
                            className={`relative flex items-center rounded-md border border-transparent bg-transparent px-2 py-1 text-[14px] hover:bg-[#dbdbdb1e] 2xl:py-0 ${
                              isCntDeploymentHistoryModalOpen ===
                                cntHistory?.id && '!bg-[#dbdbdb1e]'
                            }`}
                            key={index}
                          >
                            <div className="my-auto w-[80%] max-w-[100%] overflow-hidden truncate text-ellipsis whitespace-nowrap border border-transparent bg-transparent text-[13px] outline-none focus:border-primary">
                              {' '}
                              {transformString(cntHistory?.contractAddress, 4)}
                            </div>
                            <div className="my-auto whitespace-nowrap text-[10px] text-[#c5c4c4] 2xl:text-[12px]">
                              {String(
                                new Date(
                                  cntHistory?.createdAt,
                                ).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }),
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
                  <div className="mx-auto w-fit items-center justify-center text-[12px] font-light text-[#c5c4c4]">
                    <SmileySad
                      size={18}
                      className="text-blue-500 mx-auto  mb-1"
                    />
                    <span>No history found</span>
                  </div>
                )}
              </>
            ) : (
              <div> Select a contract to visualizate its history </div>
            )}
            {isCntDeploymentHistoryModalOpen?.length > 0 && divPosition && (
              <div
                className="absolute z-50 -translate-y-[100%] translate-x-[120px] 2xl:translate-y-[10px]"
                style={{
                  top: `${divPosition.top}px`,
                  left: `${divPosition.left}px`,
                }}
              >
                <CntDeploymentHistoryModal
                  ideContractDeploymentHistories={blockchainContractSelected?.ideContractDeploymentHistories.find(
                    (cn) => cn.id === isCntDeploymentHistoryModalOpen,
                  )}
                />
              </div>
            )}
            {isCntModalOpen?.length > 0 &&
              divPositionContracts &&
              cntIconHovered?.length > 0 && (
                <div
                  className="absolute z-50"
                  style={{
                    top: `${divPositionContracts.top}px`,
                    left: `${divPositionContracts.left}px`,
                    transform: 'translateY(30px) translateX(100px)',
                  }}
                >
                  <div className="flex w-[80px] items-center   justify-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                    {cntIconHovered === 'pencil' ? 'Rename' : 'Delete'}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
      <div className="absolute bottom-4 flex gap-x-3">
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
