export const netEnvironmentToLabel = {
  CROSSFI: {
    TESTNET: 'CROSSFI_TESTNET',
  },
  FRAXTAL: {
    Mainnet: 'FRAXTAL_MAINNET',
    Testnet: 'FRAXTAL_TESTNET',
  },
  DCHAIN: {
    Mainnet: 'DCHAIN_TESTNET',
    Testnet: 'DCHAIN_TESTNET',
  },
  CORE_DAO: {
    Mainnet: 'CORE_DAO_MAINNET',
    Testnet: 'CORE_DAO_TESTNET',
  },
  EDUCHAIN: {
    Testnet: 'EDUCHAIN_TESTNET',
  },
}

export const netEnvironmentToConfigs = {
  FRAXTAL: {
    label: 'Frax',
    token: 'frxETH',
    imageSrc: '/images/workspace/frax.svg',
    imageStyle: 'w-[35px]',
  },
  DCHAIN: {
    label: 'Dchain',
    token: 'WETH',
    imageSrc: '/images/workspace/dchain.jpg',
    imageStyle: 'w-[35px]',
  },
  CORE_DAO: {
    label: 'Core Dao',
    token: 'TCORE',
    imageSrc: '/images/workspace/core-logo.svg',
    imageStyle: 'w-[35px]',
  },
  EDUCHAIN: {
    label: 'Educhain',
    token: 'EDU',
    imageSrc: '/images/workspace/educhain-logo.svg',
    imageStyle: 'w-[35px]',
  },
}
