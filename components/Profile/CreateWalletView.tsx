'use client'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { ethers } from 'ethers'
import {
  isDatabaseReady,
  savePassword,
  setupDatabase,
  verifyPasswordExist,
} from './local-db/DbManager'
import { Eye, EyeSlash } from 'phosphor-react'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { RecoverPassword } from '@/types/user'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

const CreateWalletView = ({ onWalletCreated }) => {
  const [mnemonic, setMnemonic] = useState('')
  const [address, setAddress] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [createPassword, setCreatePassword] = useState(false)
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const validSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(8, 'Min of 8 digits')
      .max(500)
      .required('Password is required'),
    confirmPassword: Yup.string().max(500).required('Password is required'),
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverPassword>({
    resolver: yupResolver<any>(validSchema),
  })

  async function onSubmit(data: RecoverPassword) {
    setIsLoading(true)

    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match.')
      setIsLoading(false)
      return
    }

    const { confirmPassword, ...finalData } = data

    try {
      /* empty */
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
      setIsLoading(false)
    }
  }

  // Gerar a wallet
//   const generateWallet = () => {
//     const wallet = ethers.Wallet.createRandom()
//     setMnemonic(wallet.mnemonic.phrase)
//     setAddress(wallet.address)

//     // Salvar no IndexedDB
//   }

  const generateWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    setMnemonic(wallet.mnemonic.phrase);
    setAddress(wallet.address);

    // Salvar no IndexedDB
    const request = indexedDB.open('WalletDB', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('WalletStore', { keyPath: 'id' });
    };
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['WalletStore'], 'readwrite');
      const store = transaction.objectStore('WalletStore');
      store.put({ id: wallet.address, mnemonic: wallet.mnemonic.phrase });
      setIsSaved(true);
    };
  };

  async function checkPassword() {
    const passExists = await savePassword('23')
    return
    try {
      console.log('entrei check password')
      const dbReady = await isDatabaseReady()
      if (!dbReady) {
        console.log('entrei setup database')
        await setupDatabase() // Force setup if not ready
      }
      console.log('passei')
      console.log('passei2')
      if (!passExists) {
        setCreatePassword(true)
      }
    } catch (error) {
      console.log('Error checking password:', error)
      toast.error('Error checking password status')
      toast.error(JSON.stringify(error))
      console.log('salvando password new')
      await savePassword('12345678')
      console.log('done')
    }
  }

  useEffect(() => {}, [])

  if (createPassword) {
    return (
      <section className="px-[10px] pb-16 text-[16px]">
        <div className="container text-[#fff]">
          <h1 className="text-xl">First, set your app password:</h1>
          <form>
            <div className="mb-8">
              <div className="mb-3 flex gap-x-[15px]">
                <label
                  htmlFor="password"
                  className=" block text-sm font-medium text-dark dark:text-white"
                >
                  {' '}
                  New password{' '}
                  <p className="ml-[8px] text-[10px] font-normal text-[#ff0000]">
                    {errors.newPassword?.message}
                  </p>
                </label>
                {passwordVisibility ? (
                  <div
                    onClick={() => setPasswordVisibility(false)}
                    className="flex cursor-pointer items-center text-center"
                  >
                    <EyeSlash className="cursor-pointer" />
                  </div>
                ) : (
                  <div
                    onClick={() => setPasswordVisibility(true)}
                    className="flex cursor-pointer items-center text-center"
                  >
                    <Eye className="cursor-pointer" />
                  </div>
                )}
              </div>

              <div>
                <input
                  type={passwordVisibility ? 'password' : 'text'}
                  disabled={isLoading}
                  maxLength={500}
                  name="password"
                  placeholder="Enter your Password"
                  className="w-full rounded-md border border-transparent px-6 py-3 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                  {...register('newPassword')}
                />
              </div>
            </div>
            <div className="mb-8">
              <label
                htmlFor="password"
                className="mb-3 block text-sm font-medium text-dark dark:text-white"
              >
                {' '}
                Confirm password{' '}
                <p className="ml-[8px] text-[10px] font-normal text-[#ff0000]">
                  {errors.confirmPassword?.message}
                </p>
              </label>
              <input
                type={passwordVisibility ? 'password' : 'text'}
                name="password"
                disabled={isLoading}
                maxLength={500}
                placeholder="Confirm your Password"
                className="w-full rounded-md border border-transparent px-6 py-3 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                {...register('confirmPassword')}
              />
            </div>
            <div className="mb-6">
              <button
                onClick={handleSubmit(onSubmit)}
                className={`flex w-full items-center justify-center rounded-md bg-primary px-9 py-4 text-base font-medium text-white transition duration-300 ease-in-out
                    ${
                      isLoading
                        ? 'animate-pulse cursor-default bg-[#5970da]'
                        : ' hover:bg-opacity-80 hover:shadow-signUp'
                    }`}
              >
                Change new password
              </button>
            </div>
          </form>
        </div>
      </section>
    )
  }

  return (
    <section className="px-[10px] pb-16 text-[16px]">
      <div className="container text-[#fff]">
        <h1 className="text-xl">Your New Wallet</h1>
        <p className="mt-4">Address: {address}</p>
        <p className="mt-4">Mnemonic: {mnemonic}</p>
        <p
          onClick={() => {
            checkPassword()
          }}
          className="text-red-500 mt-4"
        >
          Copy your mnemonic and save it in a safe place!
        </p>
        <button
          className="text-blue-500 mt-5"
          onClick={onWalletCreated}
          disabled={!isSaved}
        >
          Back to Wallets
        </button>
      </div>
    </section>
  )
}

export default CreateWalletView
