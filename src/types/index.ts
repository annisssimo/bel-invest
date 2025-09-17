export type Broker = 'finstore' | 'freedom'

export interface Bond {
  id: string
  broker: Broker
  issuer: string
  amount: number
  currency: 'BYN' | 'USD' | 'EUR' | 'RUB'
  couponRate: number
  purchaseDate: string
  maturityDate: string
  currentValue?: number
  rating?: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | string
}

export interface Portfolio {
  bonds: Bond[]
  totalInvestment: number
  totalCurrentValue: number
  totalReturn: number
  averageYield: number
}

export interface PortfolioStats {
  totalAmount: number
  averageRate: number
  bestPerformer: Bond | null
  worstPerformer: Bond | null
  distribution: { [issuer: string]: number }
}

export type OperationType = 'buy' | 'sell' | 'coupon' | 'maturity' | 'deposit' | 'credit' | 'debit' | 'dividend'

// Main operation in the system - all money and asset movements
export interface Transaction {
  id: string
  broker: Broker
  type: OperationType
  date: string
  // Assets
  security?: {
    symbol: string 
    name: string
    companyName?: string
    type: 'bond' | 'stock' | 'etf'
    quantity: number
    price: number
    currency: 'BYN' | 'USD' | 'EUR' | 'RUB'
    // Additional fields for bonds
    nominalValue?: number
    couponRate?: number
    maturityDate?: string
  }
  // Money
  cash?: {
    amount: number
    currency: 'BYN' | 'USD' | 'EUR' | 'RUB'
  }
  // Metadata
  note?: string
}

export interface Operation {
  id: string
  broker: Broker
  bondId?: string
  type: OperationType
  date: string
  amount: number
  quantity?: number
  price?: number
  currency: 'BYN' | 'USD' | 'EUR' | 'RUB'
  fee?: number
  description?: string
}

export interface FundingOperation {
  id: string
  broker: Broker
  type: 'deposit' | 'withdrawal'
  date: string
  amount: number
  currency: 'BYN' | 'USD' | 'EUR' | 'RUB'
  method?: string
  description?: string
}

// Calculated portfolio based on operations
export interface CalculatedPortfolio {
  balances: {
    BYN: number
    USD: number
    EUR: number
    RUB: number
  }
  securities: CalculatedSecurity[]
  totalValue: {
    BYN: number
    USD: number
    EUR: number
    RUB: number
  }
  totalDeposited: number
  lastUpdated: string
}

export interface CalculatedSecurity {
  symbol: string
  name: string
  companyName?: string
  type: 'bond' | 'stock' | 'etf'
  quantity: number
  averagePrice: number
  currency: 'BYN' | 'USD' | 'EUR' | 'RUB'
  currentValue: number
  totalInvested: number
  unrealizedPnL: number
  // For bonds
  couponRate?: number
  maturityDate?: string
  monthlyIncome?: number
}

export interface PortfolioPerformance {
  totalInvested: number
  currentValue: number
  totalReturn: number
  returnPercentage: number
  realizedGains: number
  unrealizedGains: number
  totalCoupons: number
}
