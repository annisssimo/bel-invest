'use client'

import { useMemo } from 'react'
import { Transaction, CalculatedPortfolio, CalculatedSecurity } from '@/types'
import { convertToUSD } from '@/utils/currency'

export const useCalculatedPortfolio = (transactions: Transaction[]): CalculatedPortfolio => {
  return useMemo(() => {

    const brokerTransactions = transactions
    
    const deposits = { BYN: 0, USD: 0, EUR: 0, RUB: 0 }
    const withdrawals = { BYN: 0, USD: 0, EUR: 0, RUB: 0 }
    const couponIncome = { BYN: 0, USD: 0, EUR: 0, RUB: 0 }
    const assetPurchases = { BYN: 0, USD: 0, EUR: 0, RUB: 0 }
    
    const securitiesMap = new Map<string, {
      symbol: string
      name: string
      type: 'bond' | 'stock' | 'etf'
      currency: 'BYN' | 'USD' | 'EUR' | 'RUB'
      quantity: number
      totalCost: number
      transactions: Transaction[]
      couponRate?: number
      maturityDate?: string
    }>()

    for (const transaction of brokerTransactions) {
      const { type, security, cash, fee = 0 } = transaction



      if (cash) {
        if (type === 'deposit') {
          deposits[cash.currency] += cash.amount
        } else if (type === 'debit') {
          withdrawals[cash.currency] += cash.amount
        } else if (type === 'coupon' || type === 'dividend') {
          couponIncome[cash.currency] += cash.amount
        }
      }

      if (security) {
        const { symbol, name, type: secType, quantity, price, currency } = security
        
        if (!securitiesMap.has(symbol)) {
          securitiesMap.set(symbol, {
            symbol,
            name,
            type: secType,
            currency,
            quantity: 0,
            totalCost: 0,
            transactions: [],
            couponRate: security.couponRate,
            maturityDate: security.maturityDate
          })
        }

        const secData = securitiesMap.get(symbol)!
        secData.transactions.push(transaction)

        if (type === 'buy') {
          secData.quantity += quantity
          secData.totalCost += quantity * price
          assetPurchases[currency] += quantity * price
        } else if (type === 'sell') {
          secData.quantity -= quantity
          const avgCost = secData.totalCost / (secData.quantity + quantity)
          secData.totalCost -= quantity * avgCost
        } else if (type === 'maturity') {
          secData.quantity -= quantity
          const avgCost = secData.totalCost / (secData.quantity + quantity)
          secData.totalCost -= quantity * avgCost
        }
      }
    }

    const securities: CalculatedSecurity[] = Array.from(securitiesMap.values())
      .filter(sec => sec.quantity > 0)
      .map(sec => {
        const averagePrice = sec.totalCost / sec.quantity
        const currentValue = sec.quantity * averagePrice
        
        const couponTransactions = sec.transactions.filter(t => t.type === 'coupon')
        const totalCoupons = couponTransactions.reduce((sum, t) => sum + (t.cash?.amount || 0), 0)
        
        const bondTransaction = sec.transactions.find(t => t.type === 'buy')
        const couponRate = sec.couponRate || bondTransaction?.security?.couponRate || extractCouponRate(sec.name)
        const maturityDate = sec.maturityDate || bondTransaction?.security?.maturityDate || extractMaturityDate(sec.name)

        return {
          symbol: sec.symbol,
          name: sec.name,
          companyName: bondTransaction?.security?.companyName,
          type: sec.type,
          quantity: sec.quantity,
          averagePrice,
          currency: sec.currency,
          currentValue,
          totalInvested: sec.totalCost,
          unrealizedPnL: currentValue - sec.totalCost + totalCoupons,
          couponRate,
          maturityDate,
          monthlyIncome: couponRate ? (sec.totalCost * couponRate / 100 / 12) : undefined
        }
      })

    const totalValue = {
      BYN: deposits.BYN - withdrawals.BYN + couponIncome.BYN,
      USD: deposits.USD - withdrawals.USD + couponIncome.USD,
      EUR: deposits.EUR - withdrawals.EUR + couponIncome.EUR,
      RUB: deposits.RUB - withdrawals.RUB + couponIncome.RUB
    }
    
    const pureCashBalances = {
      BYN: deposits.BYN - withdrawals.BYN + couponIncome.BYN - assetPurchases.BYN,
      USD: deposits.USD - withdrawals.USD + couponIncome.USD - assetPurchases.USD,
      EUR: deposits.EUR - withdrawals.EUR + couponIncome.EUR - assetPurchases.EUR,
      RUB: deposits.RUB - withdrawals.RUB + couponIncome.RUB - assetPurchases.RUB
    }

    const totalDeposited = convertToUSD(deposits.BYN, 'BYN') + 
                          convertToUSD(deposits.USD, 'USD') + 
                          convertToUSD(deposits.EUR, 'EUR') + 
                          convertToUSD(deposits.RUB, 'RUB')

    return {
      balances: pureCashBalances,
      securities,
      totalValue,
      totalDeposited,
      lastUpdated: new Date().toISOString()
    }
  }, [transactions, transactions.length])
}

// Helper functions to extract data from names
function extractCouponRate(name: string): number | undefined {
  const match = name.match(/(\d+(?:\.\d+)?)\s*%/)
  return match ? parseFloat(match[1]) : undefined
}

function extractMaturityDate(name: string): string | undefined {
  const match = name.match(/(\d{2}.\d{2}.\d{4})/)
  return match ? match[1] : undefined
}
