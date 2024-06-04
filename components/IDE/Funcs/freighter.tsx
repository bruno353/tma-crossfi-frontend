import {
  requestAccess,
  signTransaction,
  setAllowed,
} from '@stellar/freighter-api'

async function checkConnection() {
  const isAllowed = await setAllowed()
  if (isAllowed) {
    return true
  }
}

const retrievePublicKey = async () => {
  let publicKey = ''
  let error = ''
  try {
    publicKey = await requestAccess()
  } catch (e) {
    error = e
  }
  if (error) {
    return error
  }
  return publicKey
}

const userSignTransaction = async (xdr, network, signWith) => {
  let signedTransaction = ''
  let error = ''
  try {
    signedTransaction = await signTransaction(xdr, {
      accountToSign: signWith,
    })
  } catch (e) {
    console.log('error here')
    console.log(e)
    error = e
  }
  if (error) {
    console.log('error here 2')
    console.log(error)
    return error
  }
  return signedTransaction
}

export { retrievePublicKey, checkConnection, userSignTransaction }
