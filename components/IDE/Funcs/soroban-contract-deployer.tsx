/* eslint-disable dot-notation */
import {
  SorobanDataBuilder,
  Operation,
  TransactionBuilder,
  BASE_FEE,
  Keypair,
  SorobanRpc,
  Networks,
  Address,
  Contract,
  nativeToScVal,
  StrKey,
} from '@stellar/stellar-sdk'
import { userSignTransaction } from './freighter'
import { getPublicKey } from '@stellar/freighter-api'

import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const rpcUrl = 'https://soroban-testnet.stellar.org'

const contractAddress =
  'CAAN5X32XWBIX3Q52BR4AJDVBAXPC5M3MVVPAVE5HVES2VWJBPO573L2'

const stringToSymbol = (value) => {
  return nativeToScVal(value, { type: 'symbol' })
}

const accountToScVal = (account) => new Address(account).toScVal()

async function deploySmartContract(wasm: Buffer) {
  console.log('aquiii')
  const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org')
  console.log('aquiii2')

  // Criar chave pública a partir da chave privada
  const caller = await getPublicKey()
  console.log('aquiii3')

  const sourceAccount = await server.getAccount(caller)
  try {
    // Construir a transação para fazer o deploy do smart contract
    // const transaction = new TransactionBuilder(account, {
    //   fee: StellarSdk.BASE_FEE,
    //   networkPassphrase: Networks.TESTNET,
    // })
    //   .addOperation(
    //     xdr.SorobanDat
    //   )
    //   .setTimeout(30)
    //   .build();

    // const contractWasm = await readFileSync('./hello_world.wasm')

    const opt = Operation.uploadContractWasm({
      wasm,
      source: sourceAccount.accountId(),
    })

    const params = {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    }

    const builtTransaction = new TransactionBuilder(sourceAccount, params)
      .addOperation(opt)
      .setTimeout(30)
      .build()

    console.log(`builtTransaction=${builtTransaction.toXDR()}`)

    const preparedTransaction = await server.prepareTransaction(
      builtTransaction,
    )
    console.log('foi')

    // Assinar a transação com a chave privada
    // preparedTransaction.sign(sourceKeypair)
    const signedTx = await userSignTransaction(
      preparedTransaction,
      'TESTNET',
      Networks.TESTNET,
      caller,
    )

    // console.log(
    //   `Signed prepared transaction XDR: ${preparedTransaction
    //     .toEnvelope()
    //     .toXDR('base64')}`,
    // )
    // Enviar a transação para a rede Stellar
    // const sendResponse = await server.sendTransaction(preparedTransaction);
    // console.log(`Sent transaction: ${JSON.stringify(sendResponse)}`);

    const tx = TransactionBuilder.fromXDR(signedTx, Networks.TESTNET)
    console.log('signed yes sir')
    try {
      const sendTx = await server.sendTransaction(tx).catch(function (err) {
        return err
      })
      if (sendTx.errorResult) {
        throw new Error('Unable to submit transaction')
      }
      if (sendTx.status === 'PENDING') {
        let txResponse = await server.getTransaction(sendTx.hash)
        while (txResponse.status === 'NOT_FOUND') {
          txResponse = await server.getTransaction(sendTx.hash)
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
        if (txResponse.status === 'SUCCESS') {
          const result = txResponse.returnValue
          console.log('value hereeee')
          console.log(result['_value'])

          return result
        }
      }
    } catch (err) {
      console.log(err)
      return err
    }

    // try {
    //   const sendResponse = await server.sendTransaction(preparedTransaction)
    //   console.log(`Sent transaction: ${JSON.stringify(sendResponse)}`)

    //   if (sendResponse.status === 'PENDING') {
    //     let getResponse = await server.getTransaction(sendResponse.hash)
    //     // Poll `getTransaction` until the status is not "NOT_FOUND"
    //     while (getResponse.status === 'NOT_FOUND') {
    //       console.log('Waiting for transaction confirmation...')
    //       // See if the transaction is complete
    //       getResponse = await server.getTransaction(sendResponse.hash)
    //       // Wait one second
    //       await new Promise((resolve) => setTimeout(resolve, 1000))
    //     }

    //     console.log(`getTransaction response: ${JSON.stringify(getResponse)}`)

    //     if (getResponse.status === 'SUCCESS') {
    //       // Make sure the transaction's resultMetaXDR is not empty
    //       if (!getResponse.resultMetaXdr) {
    //         throw 'Empty resultMetaXDR in getTransaction response'
    //       }
    //       // Find the return value from the contract and return it
    //       const transactionMeta = getResponse.resultMetaXdr
    //       const returnValue = transactionMeta.v3().sorobanMeta().returnValue()
    //       console.log(`Transaction result: ${returnValue}`)
    //       console.log(returnValue['_value'])
    //       console.log(returnValue)

    //       console.log('now deploying it')

    //       const add = new Address(sourceKeypair.publicKey())
    //       const opt2 = Operation.createCustomContract({
    //         address: add,
    //         wasmHash: returnValue['_value'],
    //       })
    //       console.log('now deploying it2')
    //       sourceAccount = await server.getAccount(sourceKeypair.publicKey())

    //       const builtTransaction2 = new TransactionBuilder(
    //         sourceAccount,
    //         params,
    //       )
    //         .addOperation(opt2)
    //         .setTimeout(30)
    //         .build()
    //       console.log('now deploying it3')

    //       console.log(`builtTransaction=${builtTransaction2.toXDR()}`)

    //       const preparedTransaction2 = await server.prepareTransaction(
    //         builtTransaction2,
    //       )
    //       console.log('now deploying it4')

    //       // Assinar a transação com a chave privada
    //       preparedTransaction2.sign(sourceKeypair)

    //       console.log(
    //         `Signed prepared transaction XDR: ${preparedTransaction2
    //           .toEnvelope()
    //           .toXDR('base64')}`,
    //       )
    //       // Enviar a transação para a rede Stellar
    //       const sendResponse2 = await server.sendTransaction(
    //         preparedTransaction2,
    //       )
    //       console.log(`Sent transaction: ${JSON.stringify(sendResponse2)}`)

    //       if (sendResponse2.status === 'PENDING') {
    //         let getResponse = await server.getTransaction(sendResponse.hash)
    //         // Poll `getTransaction` until the status is not "NOT_FOUND"
    //         while (getResponse.status === 'NOT_FOUND') {
    //           console.log('Waiting for transaction confirmation...')
    //           // See if the transaction is complete
    //           getResponse = await server.getTransaction(sendResponse.hash)
    //           // Wait one second
    //           await new Promise((resolve) => setTimeout(resolve, 1000))
    //         }

    //         console.log(
    //           `getTransaction response: ${JSON.stringify(getResponse)}`,
    //         )

    //         if (getResponse.status === 'SUCCESS') {
    //           // Make sure the transaction's resultMetaXDR is not empty
    //           if (!getResponse.resultMetaXdr) {
    //             throw 'Empty resultMetaXDR in getTransaction response'
    //           }
    //           // Find the return value from the contract and return it
    //           const transactionMeta = getResponse.resultMetaXdr
    //           const returnValue = transactionMeta
    //             .v3()
    //             .sorobanMeta()
    //             .returnValue()
    //           console.log(`Transaction result: ${returnValue}`)
    //           console.log(returnValue['_value'])
    //           console.log(returnValue)
    //         } else {
    //           throw `Transaction failed: ${getResponse}`
    //         }
    //       } else {
    //         throw sendResponse.errorResult
    //       }
    //     } else {
    //       throw `Transaction failed: ${getResponse}`
    //     }
    //   } else {
    //     throw sendResponse.errorResult
    //   }
    // } catch (err) {
    //   // Catch and report any errors we've thrown
    //   console.log('Sending transaction failed')
    //   console.log(JSON.stringify(err))
    // }
  } catch (error) {
    console.log(error)
    console.error('Error deploying smart contract:', error)
  }
}

async function contractInt(caller, wasm, network, networkPassphrase) {
  const params = {
    fee: BASE_FEE,
    networkPassphrase,
  }

  console.log('entrei contract Init')
  const provider = new SorobanRpc.Server(rpcUrl, { allowHttp: true })
  const sourceAccount = await provider.getAccount(caller)
  console.log('vAI TER VALUES SIM')
  const opt = Operation.uploadContractWasm({
    wasm,
    source: sourceAccount.accountId(),
  })
  const buildTx = new TransactionBuilder(sourceAccount, params)
    .setNetworkPassphrase(networkPassphrase)
    .setTimeout(30)
    .addOperation(opt)
    .build()
  console.log(buildTx)
  const _buildTx = await provider.prepareTransaction(buildTx)
  const prepareTx = await _buildTx.toXDR()
  console.log('requisitando signing')
  const signedTx = await userSignTransaction(
    prepareTx,
    network,
    networkPassphrase,
    caller,
  )
  const tx = await TransactionBuilder.fromXDR(signedTx, networkPassphrase)
  console.log('requisitando trans')
  try {
    const sendTx = await provider.sendTransaction(tx).catch(function (err) {
      return err
    })
    if (sendTx.errorResult) {
      console.log(sendTx.errorResult)
      throw new Error('Unable to submit transaction')
    }
    if (sendTx.status === 'PENDING') {
      let txResponse = await provider.getTransaction(sendTx.hash)
      while (txResponse.status === 'NOT_FOUND') {
        txResponse = await provider.getTransaction(sendTx.hash)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      if (txResponse.status === 'SUCCESS') {
        const result = txResponse.returnValue
        console.log('result return value')
        console.log(result)
        console.log(result['_value'])
        const sourceAccount2 = await provider.getAccount(caller)
        const add = new Address(sourceAccount2.accountId())
        const opt2 = Operation.createCustomContract({
          address: add,
          wasmHash: result['_value'],
        })
        const buildTx2 = new TransactionBuilder(sourceAccount2, params)
          .setNetworkPassphrase(networkPassphrase)
          .setTimeout(30)
          .addOperation(opt2)
          .build()
        console.log(buildTx2)
        const _buildTx2 = await provider.prepareTransaction(buildTx2)
        const prepareTx2 = await _buildTx2.toXDR()
        console.log('requisitando signing')
        const signedTx2 = await userSignTransaction(
          prepareTx2,
          network,
          networkPassphrase,
          caller,
        )
        const tx2 = await TransactionBuilder.fromXDR(
          signedTx2,
          networkPassphrase,
        )
        const sendTx2 = await provider
          .sendTransaction(tx2)
          .catch(function (err) {
            console.log('err here')
            console.log(err)
            return err
          })
        if (sendTx2.errorResult) {
          console.log(sendTx2.errorResult)
          throw new Error('Unable to submit transaction')
        }
        if (sendTx2.status === 'PENDING') {
          let txResponse2 = await provider.getTransaction(sendTx2.hash)
          while (txResponse2.status === 'NOT_FOUND') {
            txResponse2 = await provider.getTransaction(sendTx2.hash)
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
          if (txResponse2.status === 'SUCCESS') {
            const result2 = txResponse2.returnValue
            console.log('result return value final deployment')
            console.log(result2)
            console.log('result totally')
            console.log(txResponse2)
            console.log('metadata')
            const transactionMeta = txResponse2.resultMetaXdr
            const returnValue = transactionMeta.v3().sorobanMeta().returnValue()
            const contractIdBuffer = Buffer.from(
              returnValue['_value']['_value'].toString('hex'),
              'hex',
            )

            // Derive o endereço do contrato (strkey) a partir do Buffer do contractId.
            const contractAddress = StrKey.encodeContract(contractIdBuffer)

            console.log('cotnract')
            console.log(contractAddress)
            return contractAddress
          }
        }
      }
    }
  } catch (err) {
    console.log(err)
    throw err
  }
}

async function contractTransaction(
  caller,
  functName,
  contractAddress,
  network,
  networkPassphrase,
  values,
) {
  const params = {
    fee: BASE_FEE,
    networkPassphrase,
  }

  console.log('entrei contract Init')
  const provider = new SorobanRpc.Server(rpcUrl, { allowHttp: true })
  const sourceAccount = await provider.getAccount(caller)
  const contract = new Contract(contractAddress)
  let buildTx
  console.log('valuies auqi')
  console.log(values)
  if (values == null) {
    buildTx = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functName))
      .setNetworkPassphrase(networkPassphrase)
      .setTimeout(30)
      .build()
  } else {
    buildTx = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functName, ...values))
      .setNetworkPassphrase(networkPassphrase)
      .setTimeout(30)
      .build()
  }
  console.log('preparando')
  console.log(buildTx)
  const _buildTx = await provider.prepareTransaction(buildTx)
  console.log('xdr agr')
  const prepareTx = await _buildTx.toXDR()
  console.log('requisitando signing')
  const signedTx = await userSignTransaction(
    prepareTx,
    network,
    networkPassphrase,
    caller,
  )
  const tx = await TransactionBuilder.fromXDR(signedTx, networkPassphrase)
  console.log('requisitando trans')
  try {
    const sendTx = await provider.sendTransaction(tx).catch(function (err) {
      return err
    })
    if (sendTx.errorResult) {
      console.log(sendTx.errorResult)
      throw new Error('Unable to submit transaction')
    }
    if (sendTx.status === 'PENDING') {
      let txResponse = await provider.getTransaction(sendTx.hash)
      while (txResponse.status === 'NOT_FOUND') {
        txResponse = await provider.getTransaction(sendTx.hash)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      if (txResponse.status === 'SUCCESS') {
        const result = txResponse.returnValue
        console.log('result return value')
        console.log(result)
        console.log(result['_value'])
        return result['_value']
      }
    }
  } catch (err) {
    console.log(err)
    throw err
  }
}

async function deployContractFreighter(
  wasm: any,
  network: string,
  networkPassphrase: string,
) {
  console.log('recebido')
  console.log(network)
  console.log(networkPassphrase)
  const caller = await getPublicKey()
  const result = await contractInt(caller, wasm, network, networkPassphrase)
  return result
}

async function transactionContractFreighter(
  functName: string,
  contractAddress: string,
  network: string,
  networkPassphrase: string,
  values?: any,
) {
  console.log('recebido')
  console.log(network)
  console.log(networkPassphrase)
  const caller = await getPublicKey()
  const result = await contractTransaction(
    caller,
    functName,
    contractAddress,
    network,
    networkPassphrase,
    values,
  )
  return result
}

export {
  deployContractFreighter,
  deploySmartContract,
  transactionContractFreighter,
}
