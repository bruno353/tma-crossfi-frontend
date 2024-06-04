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
} from '@stellar/stellar-sdk'
import { userSignTransaction } from './freighter'
import { getPublicKey } from '@stellar/freighter-api'

const rpcUrl = 'https://soroban-testnet.stellar.org:443'

const params = {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
}

async function deploySmartContract(wasm) {
  console.log('aquiii')
  const server = new SorobanRpc.Server(
    'https://soroban-testnet.stellar.org:443',
  )
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

export { deploySmartContract }
