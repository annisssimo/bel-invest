import { Transaction } from '@/types'
import { differenceInDays } from 'date-fns'
import { convertToUSD } from './currency'

interface CashFlow {
  date: Date
  amount: number
}

// Function to calculate NPV (Net Present Value)
function npv(rate: number, cashFlows: CashFlow[]): number {
  const firstDate = cashFlows[0].date
  return cashFlows.reduce((sum, cf) => {
    const days = differenceInDays(cf.date, firstDate)
    return sum + cf.amount / Math.pow(1 + rate, days / 365)
  }, 0)
}

// Function to calculate XIRR using Newton's method
function calculateXIRR(cashFlows: CashFlow[]): number {
  if (cashFlows.length < 2) return 0

  const PRECISION = 0.000001
  const MAX_ITERATIONS = 100
  let rate = 0.1
  let iteration = 0

  while (iteration < MAX_ITERATIONS) {
    const value = npv(rate, cashFlows)
    if (Math.abs(value) < PRECISION) {
      return rate
    }

    // NPV derivative with respect to rate
    const derivative = cashFlows.reduce((sum, cf) => {
      const days = differenceInDays(cf.date, cashFlows[0].date)
      return sum - (days / 365) * cf.amount / Math.pow(1 + rate, days / 365 + 1)
    }, 0)

    // Next approximation using Newton's method
    const newRate = rate - value / derivative
    if (Math.abs(newRate - rate) < PRECISION) {
      return newRate
    }
    rate = newRate
    iteration++
  }

  return rate
}

// Main function to calculate portfolio return
export function calculatePortfolioReturn(transactions: Transaction[]): number {
  const finStoreTransactions = transactions

  const securitiesMap = new Map<string, {
    quantity: number
    totalCost: number
    currency: string
  }>()

  const cashFlows: CashFlow[] = []

  finStoreTransactions.forEach(t => {
    if (t.type === 'buy' && t.security) {
      const { symbol, quantity, price, currency } = t.security
      const totalCost = quantity * price
      
      if (!securitiesMap.has(symbol)) {
        securitiesMap.set(symbol, { quantity: 0, totalCost: 0, currency })
      }
      const security = securitiesMap.get(symbol)!
      security.quantity += quantity
      security.totalCost += totalCost
    }
  })

  finStoreTransactions.forEach(t => {
    const date = new Date(t.date)

    if (t.type === 'deposit' && t.cash) {
      // Deposits as negative flow (investments)
      cashFlows.push({
        date,
        amount: -convertToUSD(t.cash.amount, t.cash.currency)
      })
    } 
    else if (t.type === 'coupon' && t.cash) {
      // Coupons as positive flow
      cashFlows.push({
        date,
        amount: convertToUSD(t.cash.amount, t.cash.currency)
      })
    }
  })

  const currentValue = Array.from(securitiesMap.values()).reduce((total, security) => {
    return total + convertToUSD(security.totalCost, security.currency as 'BYN' | 'USD' | 'EUR' | 'RUB')
  }, 0)

  if (currentValue > 0) {
    cashFlows.push({
      date: new Date(),
      amount: currentValue
    })
  }

  if (cashFlows.length < 2) {
    return 0
  }

  cashFlows.sort((a, b) => a.date.getTime() - b.date.getTime())

  try {
    const xirr = calculateXIRR(cashFlows)
    return xirr * 100
  } catch (error) {
    console.error('Error calculating XIRR:', error)
    return 0
  }
}
