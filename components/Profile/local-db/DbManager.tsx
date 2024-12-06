import CryptoJS from 'crypto-js'

export const setupDatabase = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('WalletDB', 1)

    // Função chamada quando a versão do banco de dados é alterada
    request.onupgradeneeded = (event) => {
      const db = event.target['result']

      // Cria as objectStores apenas se não existirem
      if (!db.objectStoreNames.contains('WalletStore')) {
        db.createObjectStore('WalletStore', { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains('PasswordStore')) {
        db.createObjectStore('PasswordStore', { keyPath: 'key' })
      }
    }

    // Função chamada quando a base de dados é aberta com sucesso
    request.onsuccess = (event) => {
      const db = event.target['result']
      resolve(db)
    }

    // Caso ocorra algum erro na abertura do banco
    request.onerror = (event) => {
      reject(event.target['error'])
    }
  })
}

// Função para salvar a senha no IndexedDB
export const savePassword = async (password: string) => {
  const request = indexedDB.open('WalletDB', 1)

  request.onupgradeneeded = (event) => {
    const db = event.target.result
    db.createObjectStore('PasswordStore', { keyPath: 'id' })
  }
  request.onsuccess = (event) => {
    const hash = CryptoJS.SHA256(password).toString()
    const db = event.target.result;
    const transaction = db.transaction(['PasswordStore'], 'readwrite')
    const store = transaction.objectStore('PasswordStore')

    store.put({ key: 'userPassword', hash })
  }
}

// Função para verificar se a senha existe no IndexedDB
export const verifyPasswordExist = async () => {
  const db = await setupDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('PasswordStore', 'readonly')
    const store = transaction.objectStore('PasswordStore')
    const request = store.get('userPassword')

    request.onsuccess = (event) => {
      const storedHash = event.target.result?.hash
      resolve(!!storedHash) // Retorna true se a senha existir
    }

    request.onerror = (event) => {
      console.error('Error accessing PasswordStore:', event.target.error)
      reject(event.target.error)
    }

    transaction.onerror = (event) => {
      console.error('Transaction error:', event.target.error)
      reject(event.target.error)
    }
  })
}

// Valida a senha fornecida pelo usuário
export const validatePassword = async (password) => {
  const db = await setupDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('PasswordStore', 'readonly')
    const store = transaction.objectStore('PasswordStore')
    const request = store.get('userPassword')

    request.onsuccess = (event) => {
      const storedHash = event.target.result?.hash

      if (!storedHash) {
        reject('Senha não configurada.')
      } else {
        const inputHash = CryptoJS.SHA256(password).toString()
        if (storedHash === inputHash) {
          resolve(true) // Senha válida
        } else {
          reject('Senha incorreta.')
        }
      }
    }

    request.onerror = (event) => reject(event.target.error)
  })
}

// Salva uma carteira criptografada no IndexedDB
export const saveWallet = async (
  walletAddress: string,
  walletMnemonic: string,
  password,
) => {
  const encryptedMnemonic = CryptoJS.AES.encrypt(
    walletMnemonic,
    password,
  ).toString()

  const db = await setupDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('WalletStore', 'readwrite')
    const store = transaction.objectStore('WalletStore')
    store.put({ id: walletAddress, mnemonic: encryptedMnemonic })

    transaction.oncomplete = () => resolve(true)
    transaction.onerror = (event) => reject(event.target.error)
  })
}
