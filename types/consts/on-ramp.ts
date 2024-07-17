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
}
