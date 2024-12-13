/* eslint-disable lines-between-class-members */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import CryptoJS from 'crypto-js'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Dexie from 'dexie'
import { ethers } from 'ethers'
import { createMXWallet } from './WalletUtils'

export class WalletDatabase extends Dexie {
  wallets: Dexie.Table<
    {
      address: string
      mnemonic?: string
      privateKey: string
      name: string
      derivationPath: string
    },
    string
  >
  passwords: Dexie.Table<{ id: string; password: string }, string>
  masterMnemonic: Dexie.Table<{ id: string; mnemonic: string }, string>

  constructor() {
    super('WalletDB')
    this.version(1).stores({
      wallets: 'address, name, derivationPath',
      passwords: 'id, password',
      masterMnemonic: 'id, mnemonic',
    })
  }
}

const db = new WalletDatabase()

export interface LocalWallet {
  address: string
  privateKey: string
  name: string
  derivationPath: string
  mnemonic?: string
  isLocal?: boolean
}

export interface BackendWallet {
  address: string
  isLocal: false
}

export type CombinedWallet = LocalWallet | BackendWallet

// Get master mnemonic or generate new one
export const getMasterMnemonic = async (): Promise<string | null> => {
  try {
    const masterMnemonicRecord = await db.masterMnemonic.get('master')
    return masterMnemonicRecord?.mnemonic || null
  } catch (error) {
    console.error('Error getting master mnemonic:', error)
    return null
  }
}

export const saveMasterMnemonic = async (mnemonic: string) => {
  try {
    await db.masterMnemonic.put({ id: 'master', mnemonic })
    return true
  } catch (error) {
    console.error('Error saving master mnemonic:', error)
    return false
  }
}

export const verifyMnemonicPhrases = (
  mnemonic: string,
  userInputs: { index: number; word: string }[],
): boolean => {
  const mnemonicWords = mnemonic.split(' ')
  return userInputs.every((input) => mnemonicWords[input.index] === input.word)
}

// export const createWalletFromMnemonic = async (
//   name: string,
//   index: number = 0,
// ): Promise<LocalWallet | null> => {
//   try {
//     const mnemonic = await getMasterMnemonic()
//     if (!mnemonic) {
//       throw new Error('No master mnemonic found')
//     }

//     // Create full path
//     const basePath = `m/44'/60'/0'/0`
//     const fullPath = `${basePath}/${index}`

//     // Get the HD wallet directly from mnemonic with full path
//     const wallet = ethers.HDNodeWallet.fromMnemonic(
//       ethers.Mnemonic.fromPhrase(mnemonic),
//       fullPath,
//     )

//     const newWallet: LocalWallet = {
//       address: wallet.address,
//       privateKey: wallet.privateKey,
//       name,
//       derivationPath: fullPath,
//       isLocal: true,
//     }

//     await db.wallets.put(newWallet)
//     return newWallet
//   } catch (error) {
//     console.error('Error creating wallet:', error)
//     return null
//   }
// }

export const createWalletFromMnemonic = async (
  name: string,
  index: number = 0,
): Promise<LocalWallet | null> => {
  try {
    const mnemonic = await getMasterMnemonic()
    if (!mnemonic) {
      throw new Error('No master mnemonic found')
    }

    // Create MX wallet
    const { address, privateKey } = createMXWallet()

    const newWallet: LocalWallet = {
      address,
      privateKey,
      name,
      derivationPath: `mx/${index}`, // Using simple path for MX wallets
      isLocal: true,
    }

    await db.wallets.put(newWallet)
    return newWallet
  } catch (error) {
    console.error('Error creating wallet:', error)
    return null
  }
}

export const getNextWalletIndex = async (): Promise<number> => {
  try {
    const wallets = await db.wallets.toArray()
    const indices = wallets.map((w) => {
      const match = w.derivationPath.match(/\/(\d+)$/)
      return match ? parseInt(match[1]) : 0
    })
    return Math.max(...indices, -1) + 1
  } catch (error) {
    console.error('Error getting next wallet index:', error)
    return 0
  }
}

export const loadLocalWallets = async (): Promise<LocalWallet[]> => {
  try {
    const allWallets = await db.wallets.toArray()
    return allWallets.map((wallet) => ({
      ...wallet,
      isLocal: true,
    }))
  } catch (error) {
    console.error('Error loading wallets:', error)
    toast.error('Error loading wallets')
    return []
  }
}

export const mergeWallets = (
  localWallets: LocalWallet[],
  backendWallets: BackendWallet[],
): CombinedWallet[] => {
  const mergedWallets: CombinedWallet[] = []

  // Add local wallets
  mergedWallets.push(...localWallets)

  // Add backend wallets that aren't already in local storage
  backendWallets.forEach((backendWallet) => {
    if (
      !localWallets.some((local) => local.address === backendWallet.address)
    ) {
      mergedWallets.push({
        ...backendWallet,
        isLocal: false,
      })
    }
  })

  return mergedWallets
}

export const savePassword = async (password: string): Promise<boolean> => {
  try {
    const hashedPassword = CryptoJS.SHA256(password).toString()
    await db.passwords.put({
      id: 'main',
      password: hashedPassword,
    })
    return true
  } catch (error) {
    console.error('Error saving password:', error)
    return false
  }
}

export const verifyPasswordExists = async (): Promise<boolean> => {
  try {
    const password = await db.passwords.get('main')
    return !!password
  } catch (error) {
    console.error('Error checking password:', error)
    return false
  }
}
