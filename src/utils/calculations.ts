import { Bond, PortfolioStats } from '@/types'
import { differenceInDays, parseISO } from 'date-fns'

export const calculatePortfolioStats = (bonds: Bond[]): PortfolioStats => {
  // Separate by currency for proper calculations
  const bynBonds = bonds.filter(bond => bond.currency === 'BYN')
  const usdBonds = bonds.filter(bond => bond.currency === 'USD')
  
  const totalAmountBYN = bynBonds.reduce((sum, bond) => sum + bond.amount, 0)
  const totalAmountUSD = usdBonds.reduce((sum, bond) => sum + bond.amount, 0)
  
  const totalAmount = totalAmountBYN + totalAmountUSD
  
  const averageRate = bonds.length > 0 
    ? bonds.reduce((sum, bond) => sum + bond.couponRate, 0) / bonds.length 
    : 0

  const distribution = bonds.reduce((acc, bond) => {
    const key = `${bond.issuer} (${bond.currency})`
    acc[key] = (acc[key] || 0) + bond.amount
    return acc
  }, {} as { [issuer: string]: number })

  const bestPerformer = bonds.reduce((best, bond) => 
    !best || bond.couponRate > best.couponRate ? bond : best, null as Bond | null)
  
  const worstPerformer = bonds.reduce((worst, bond) => 
    !worst || bond.couponRate < worst.couponRate ? bond : worst, null as Bond | null)

  return {
    totalAmount,
    averageRate,
    bestPerformer,
    worstPerformer,
    distribution
  }
}

export const calculateYearlyIncome = (bond: Bond): number => {
  return (bond.amount * bond.couponRate) / 100
}

export const calculateMonthlyIncome = (bond: Bond): number => {
  return calculateYearlyIncome(bond) / 12
}

export const calculateDaysToMaturity = (maturityDate: string): number => {
  const today = new Date()
  const maturity = parseISO(maturityDate)
  return differenceInDays(maturity, today)
}

export const formatCurrency = (amount: number, currency: 'BYN' | 'USD' | 'EUR' | 'RUB' = 'BYN'): string => {
  return new Intl.NumberFormat('ru-BY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount)
}

export const getPortfolioByCurrency = (bonds: Bond[]) => {
  const bynBonds = bonds.filter(bond => bond.currency === 'BYN')
  const usdBonds = bonds.filter(bond => bond.currency === 'USD')
  
  const bynTotal = bynBonds.reduce((sum, bond) => sum + bond.amount, 0)
  const usdTotal = usdBonds.reduce((sum, bond) => sum + bond.amount, 0)
  
  const bynIncome = bynBonds.reduce((sum, bond) => sum + calculateYearlyIncome(bond), 0)
  const usdIncome = usdBonds.reduce((sum, bond) => sum + calculateYearlyIncome(bond), 0)
  
  const bynMonthlyIncome = bynBonds.reduce((sum, bond) => sum + calculateMonthlyIncome(bond), 0)
  const usdMonthlyIncome = usdBonds.reduce((sum, bond) => sum + calculateMonthlyIncome(bond), 0)
  
  return {
    BYN: { total: bynTotal, income: bynIncome, monthlyIncome: bynMonthlyIncome, count: bynBonds.length },
    USD: { total: usdTotal, income: usdIncome, monthlyIncome: usdMonthlyIncome, count: usdBonds.length }
  }
}

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`
}
