// Exchange rates (in real app this should come from API)
const EXCHANGE_RATES = {
  BYN_TO_USD: 0.31,
  EUR_TO_USD: 1.05,
  RUB_TO_USD: 0.011,
  USD_TO_BYN: 3.23,
  USD_TO_EUR: 0.95,
  USD_TO_RUB: 91.0
}

export const convertToUSD = (amount: number, currency: 'BYN' | 'USD' | 'EUR' | 'RUB'): number => {
  switch (currency) {
    case 'USD': return amount
    case 'BYN': return amount * EXCHANGE_RATES.BYN_TO_USD
    case 'EUR': return amount * EXCHANGE_RATES.EUR_TO_USD
    case 'RUB': return amount * EXCHANGE_RATES.RUB_TO_USD
    default: return amount
  }
}

export const convertFromUSD = (amount: number, toCurrency: 'BYN' | 'USD' | 'EUR' | 'RUB'): number => {
  switch (toCurrency) {
    case 'USD': return amount
    case 'BYN': return amount * EXCHANGE_RATES.USD_TO_BYN
    case 'EUR': return amount * EXCHANGE_RATES.USD_TO_EUR
    case 'RUB': return amount * EXCHANGE_RATES.USD_TO_RUB
    default: return amount
  }
}

export const getExchangeRate = (from: 'BYN' | 'USD' | 'EUR' | 'RUB', to: 'BYN' | 'USD' | 'EUR' | 'RUB'): number => {
  if (from === to) return 1
  
  // Convert through USD as base currency
  const usdAmount = convertToUSD(1, from)
  return convertFromUSD(usdAmount, to)
}
