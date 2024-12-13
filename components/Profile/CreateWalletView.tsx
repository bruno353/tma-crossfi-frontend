/* eslint-disable react/no-unescaped-entities */
'use client'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Eye, EyeSlash } from 'phosphor-react'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { RecoverPassword } from '@/types/user'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import {
  verifyPasswordExists,
  savePassword,
  getMasterMnemonic,
  saveMasterMnemonic,
  verifyMnemonicPhrases,
  createWalletFromMnemonic,
  getNextWalletIndex,
} from './local-db/DbManager'

enum CreateWalletStep {
  PASSWORD = 'password',
  GENERATE_MNEMONIC = 'generate_mnemonic',
  VERIFY_MNEMONIC = 'verify_mnemonic',
  WALLET_NAME = 'wallet_name',
}

const CreateWalletView = ({ onWalletCreated }) => {
  const [currentStep, setCurrentStep] = useState<CreateWalletStep>(
    CreateWalletStep.PASSWORD,
  )
  const [mnemonic, setMnemonic] = useState('')
  const [walletName, setWalletName] = useState('')
  const [mnemonicVerification, setMnemonicVerification] = useState<
    { index: number; word: string }[]
  >([])
  const [passwordVisibility, setPasswordVisibility] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const passwordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(8, 'Min of 8 digits')
      .max(500)
      .required('Password is required'),
    confirmPassword: Yup.string().max(500).required('Password is required'),
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<RecoverPassword>({
    resolver: yupResolver<any>(passwordSchema),
  })

  useEffect(() => {
    checkInitialState()
  }, [])

  const checkInitialState = async () => {
    const hasPassword = await verifyPasswordExists()
    if (!hasPassword) {
      setCurrentStep(CreateWalletStep.PASSWORD)
      return
    }

    const existingMnemonic = await getMasterMnemonic()
    if (!existingMnemonic) {
      setCurrentStep(CreateWalletStep.GENERATE_MNEMONIC)
    } else {
      setCurrentStep(CreateWalletStep.WALLET_NAME)
    }
  }

  const onPasswordSubmit = async (data: RecoverPassword) => {
    setIsLoading(true)
    try {
      if (data.newPassword !== data.confirmPassword) {
        toast.error('Passwords do not match.')
        return
      }

      await savePassword(data.newPassword)
      const existingMnemonic = await getMasterMnemonic()
      setCurrentStep(
        existingMnemonic
          ? CreateWalletStep.WALLET_NAME
          : CreateWalletStep.GENERATE_MNEMONIC,
      )
    } catch (error) {
      toast.error('Error saving password')
    } finally {
      setIsLoading(false)
    }
  }

  const generateNewMnemonic = async () => {
    const wallet = ethers.Wallet.createRandom()
    setMnemonic(wallet.mnemonic.phrase)
    await saveMasterMnemonic(wallet.mnemonic.phrase)
  }

  const handleMnemonicVerification = () => {
    if (!verifyMnemonicPhrases(mnemonic, mnemonicVerification)) {
      toast.error('Mnemonic verification failed. Please try again.')
      return
    }
    setCurrentStep(CreateWalletStep.WALLET_NAME)
  }

  const createNewWallet = async () => {
    if (!walletName) {
      toast.error('Please enter a wallet name')
      return
    }

    setIsLoading(true)
    try {
      const nextIndex = await getNextWalletIndex()
      const newWallet = await createWalletFromMnemonic(walletName, nextIndex)

      if (!newWallet) {
        throw new Error('Failed to create wallet')
      }

      toast.success('Wallet created successfully!')
      onWalletCreated()
    } catch (error) {
      toast.error('Error creating wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case CreateWalletStep.PASSWORD:
        return (
          <div className="container text-[#fff]">
            <h1 className="mb-6 text-xl">Set Your App Password</h1>
            <form>
              <div className="mb-8">
                <div className="mb-3 flex gap-x-[15px]">
                  <label className="block text-sm font-medium">
                    New password
                    <p className="text-[10px] text-[#ff0000]">
                      {passwordErrors.newPassword?.message}
                    </p>
                  </label>
                  <div
                    onClick={() => setPasswordVisibility(!passwordVisibility)}
                    className="cursor-pointer"
                  >
                    {passwordVisibility ? <EyeSlash /> : <Eye />}
                  </div>
                </div>
                <input
                  type={passwordVisibility ? 'password' : 'text'}
                  {...registerPassword('newPassword')}
                  className="w-full rounded-md border bg-[#242B51] p-3"
                />
              </div>

              <div className="mb-8">
                <label className="mb-3 block text-sm font-medium">
                  Confirm password
                  <p className="text-[10px] text-[#ff0000]">
                    {passwordErrors.confirmPassword?.message}
                  </p>
                </label>
                <input
                  type={passwordVisibility ? 'password' : 'text'}
                  {...registerPassword('confirmPassword')}
                  className="w-full rounded-md border bg-[#242B51] p-3"
                />
              </div>

              <button
                onClick={handlePasswordSubmit(onPasswordSubmit)}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 w-full rounded-md p-3 text-white"
              >
                {isLoading ? 'Setting Password...' : 'Set Password'}
              </button>
            </form>
          </div>
        )

      case CreateWalletStep.GENERATE_MNEMONIC:
        return (
          <div className="container text-[#fff]">
            <h1 className="mb-6 text-xl">Save Your Recovery Phrase</h1>
            {!mnemonic ? (
              <button
                onClick={generateNewMnemonic}
                className="bg-blue-500 hover:bg-blue-600 rounded-md p-3 text-white"
              >
                Generate Recovery Phrase
              </button>
            ) : (
              <>
                <div className="mb-6 rounded-md bg-[#242B51] p-4">
                  <p className="break-all">{mnemonic}</p>
                </div>
                <p className="text-red-500 mb-4">
                  Write down this recovery phrase and store it safely!
                </p>
                <button
                  onClick={() =>
                    setCurrentStep(CreateWalletStep.VERIFY_MNEMONIC)
                  }
                  className="bg-blue-500 hover:bg-blue-600 rounded-md p-3 text-white"
                >
                  I've Saved It
                </button>
              </>
            )}
          </div>
        )

      case CreateWalletStep.VERIFY_MNEMONIC:
        return (
          <div className="container text-[#fff]">
            <h1 className="mb-6 text-xl">Verify Recovery Phrase</h1>
            <p className="mb-4">
              Please enter the following words from your phrase:
            </p>
            {[3, 6, 9].map((index) => (
              <div key={index} className="mb-4">
                <label className="mb-2 block text-sm">Word #{index + 1}</label>
                <input
                  type="text"
                  onChange={(e) => {
                    const newVerification = [...mnemonicVerification]
                    const existingIndex = newVerification.findIndex(
                      (v) => v.index === index,
                    )
                    if (existingIndex >= 0) {
                      newVerification[existingIndex].word = e.target.value
                    } else {
                      newVerification.push({ index, word: e.target.value })
                    }
                    setMnemonicVerification(newVerification)
                  }}
                  className="w-full rounded-md border bg-[#242B51] p-3"
                />
              </div>
            ))}
            <button
              onClick={handleMnemonicVerification}
              className="bg-blue-500 hover:bg-blue-600 w-full rounded-md p-3 text-white"
            >
              Verify
            </button>
          </div>
        )

      case CreateWalletStep.WALLET_NAME:
        return (
          <div className="container text-[#fff]">
            <h1 className="mb-6 text-xl">Name Your Wallet</h1>
            <div className="mb-6">
              <label className="mb-2 block text-sm">Wallet Name</label>
              <input
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="Enter wallet name"
                className="w-full rounded-md border bg-[#242B51] p-3"
              />
            </div>
            <button
              onClick={createNewWallet}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 w-full rounded-md p-3 text-white"
            >
              {isLoading ? 'Creating Wallet...' : 'Create Wallet'}{' '}
            </button>
          </div>
        )
    }
  }

  const renderProgressBar = () => {
    const steps = [
      { id: CreateWalletStep.PASSWORD, label: 'Password' },
      { id: CreateWalletStep.GENERATE_MNEMONIC, label: 'Recovery Phrase' },
      { id: CreateWalletStep.VERIFY_MNEMONIC, label: 'Verify' },
      { id: CreateWalletStep.WALLET_NAME, label: 'Name' },
    ]

    const currentIndex = steps.findIndex((step) => step.id === currentStep)

    return (
      <div className="mb-8">
        <div className="mb-2 flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 ${index < steps.length - 1 ? 'mr-2' : ''}`}
            >
              <div
                className={`h-2 rounded ${
                  index <= currentIndex ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              />
              <span
                className={`mt-1 text-xs ${
                  index <= currentIndex ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="px-[10px] pb-16 text-[16px]">
      <div className="mx-auto max-w-md">
        {/* {renderProgressBar()} */}
        {renderStep()}

        {/* Back button - only show on certain steps */}
        {/* {currentStep !== CreateWalletStep.PASSWORD && (
          <button
            onClick={() => {
              if (currentStep === CreateWalletStep.VERIFY_MNEMONIC) {
                setCurrentStep(CreateWalletStep.GENERATE_MNEMONIC)
              } else if (
                currentStep === CreateWalletStep.WALLET_NAME &&
                !mnemonic
              ) {
                setCurrentStep(CreateWalletStep.GENERATE_MNEMONIC)
              }
            }}
            className="mt-4 text-grey hover:text-grey/70"
          >
            ← Back
          </button>
        )} */}

        {/* Cancel button */}
        <button
          onClick={onWalletCreated}
          className="ml-4 mt-4 text-xs  text-red"
        >
          Cancel
        </button>
      </div>
    </section>
  )
}

export default CreateWalletView
