// Primeiro, vamos criar tipos para os dados:
interface TokenData {
  title: string
  symbol: string
  priceDif: number
  priceArray: number[]
  currentPrice: number
  coingeckoId: string
}

interface PriceData {
  prices: [number, number][] // [timestamp, price]
}

// Constantes para os tokens
const TOKENS_CONFIG = [
  {
    title: 'Crossfi',
    symbol: 'XFI',
    coingeckoId: 'crossfi-2',
  },
  {
    title: 'Bitcoin',
    symbol: 'BTC',
    coingeckoId: 'bitcoin',
  },
]

// Função para buscar preço atual
async function getCurrentPrice(coingeckoId: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`,
    )
    const data = await response.json()
    return data[coingeckoId]?.usd || 0
  } catch (error) {
    console.error(`Error fetching price for ${coingeckoId}:`, error)
    return 0
  }
}

// Função para buscar dados históricos (últimas 24h)
async function getHistoricalData(coingeckoId: string): Promise<number[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=1&interval=hourly`,
    )
    const data: PriceData = await response.json()

    // Extrair apenas os preços do array de dados históricos
    return data.prices.map(([_, price]) => price)
  } catch (error) {
    console.error(`Error fetching historical data for ${coingeckoId}:`, error)
    return []
  }
}

// Função para calcular a variação percentual
function calculatePriceChange(prices: number[]): number {
  if (prices.length < 2) return 0
  const firstPrice = prices[0]
  const lastPrice = prices[prices.length - 1]
  return ((lastPrice - firstPrice) / firstPrice) * 100
}

// Função principal para buscar todos os dados dos tokens
async function fetchTokensData(): Promise<TokenData[]> {
  const tokensData = await Promise.all(
    TOKENS_CONFIG.map(async (token) => {
      const [currentPrice, historicalPrices] = await Promise.all([
        getCurrentPrice(token.coingeckoId),
        getHistoricalData(token.coingeckoId),
      ])

      return {
        title: token.title,
        symbol: token.symbol,
        currentPrice,
        priceArray: historicalPrices,
        priceDif: calculatePriceChange(historicalPrices),
        coingeckoId: token.coingeckoId,
      }
    }),
  )

  return tokensData
}

export { fetchTokensData, type TokenData }
