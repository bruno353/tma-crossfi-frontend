const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // Adicionando suporte a WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true, // Habilita o suporte para WebAssembly assíncrono
      topLevelAwait: true, // Permite uso de 'await' no topo do nível dos módulos
    }

    if (!isServer) {
      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
    }

    // Opções adicionais podem ser configuradas aqui

    return config
  },
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
