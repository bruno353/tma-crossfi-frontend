import { ethers } from 'ethers'
import { bech32 } from 'bech32'
import { Buffer } from 'buffer'

export const createMXWallet = () => {
  // Generate random bytes for private key
  const privateKeyBytes = new Uint8Array(32)
  crypto.getRandomValues(privateKeyBytes)
  const privateKey = '0x' + Buffer.from(privateKeyBytes).toString('hex')

  // Create wallet from private key
  const wallet = new ethers.Wallet(privateKey)

  // Convert Ethereum address to bech32 format
  const ethAddressBytes = Buffer.from(wallet.address.slice(2), 'hex')
  const words = bech32.toWords(ethAddressBytes)
  const mxAddress = bech32.encode('mx', words)

  console.log('mx address')
  console.log(mxAddress)
  console.log('private key')
  console.log(privateKey)

  return {
    address: mxAddress,
    privateKey: privateKey,
  }
}
