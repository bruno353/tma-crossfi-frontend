/* eslint-disable @typescript-eslint/no-inferrable-types */
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

function filterDataPoints(
  data: [number, number][],
  intervalMinutes: number = 30,
): number[] {
  if (data.length === 0) return []

  // Ordenar por timestamp para garantir
  const sortedData = [...data].sort((a, b) => a[0] - b[0])

  const filtered: [number, number][] = []
  let lastTimestamp = sortedData[0][0]

  // Sempre incluir o primeiro ponto
  filtered.push(sortedData[0])

  // Filtrar pontos baseado no intervalo
  for (const point of sortedData) {
    const timeDiff = (point[0] - lastTimestamp) / (1000 * 60) // converter para minutos
    if (timeDiff >= intervalMinutes) {
      filtered.push(point)
      lastTimestamp = point[0]
    }
  }

  // Sempre incluir o último ponto se já não estiver incluído
  if (
    filtered[filtered.length - 1][0] !== sortedData[sortedData.length - 1][0]
  ) {
    filtered.push(sortedData[sortedData.length - 1])
  }

  // Retornar apenas os preços
  return filtered.map(([_, price]) => Number(price.toFixed(4)))
}

async function getHistoricalData(coingeckoId: string): Promise<number[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=1`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: PriceData = await response.json()

    if (!data.prices || data.prices.length === 0) {
      throw new Error('No price data available')
    }

    // Filtrar para intervalos de 30 minutos
    const filteredPrices = filterDataPoints(data.prices, 30)

    console.log(`Historical data for ${coingeckoId}:`, {
      originalDataPoints: data.prices.length,
      filteredDataPoints: filteredPrices.length,
      firstPrice: filteredPrices[0],
      lastPrice: filteredPrices[filteredPrices.length - 1],
    })

    return filteredPrices
  } catch (error) {
    console.error(`Error fetching historical data for ${coingeckoId}:`, error)
    return []
  }
}

function calculatePriceChange(prices: number[]): number {
  if (prices.length < 2) return 0

  const firstPrice = prices[0]
  const lastPrice = prices[prices.length - 1]

  if (firstPrice === 0) return 0

  const change = ((lastPrice - firstPrice) / firstPrice) * 100
  return Number(change.toFixed(2))
}

async function fetchTokensData(): Promise<TokenData[]> {
  try {
    const tokensData = await Promise.all(
      TOKENS_CONFIG.map(async (token) => {
        const historicalPrices = await getHistoricalData(token.coingeckoId)

        const currentPrice =
          historicalPrices.length > 0
            ? historicalPrices[historicalPrices.length - 1]
            : await getCurrentPrice(token.coingeckoId)

        const priceDif = calculatePriceChange(historicalPrices)

        return {
          title: token.title,
          symbol: token.symbol,
          currentPrice,
          priceArray: historicalPrices,
          priceDif,
          coingeckoId: token.coingeckoId,
        }
      }),
    )

    return tokensData
  } catch (error) {
    console.error('Error fetching tokens data:', error)
    return []
  }
}

export { fetchTokensData, type TokenData }
