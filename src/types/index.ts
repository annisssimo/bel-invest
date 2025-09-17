// ===== CORE TYPES =====
export type Broker = 'finstore' | 'freedom';

export type Currency = 'BYN' | 'USD' | 'EUR' | 'RUB';

export type SecurityType = 'bond' | 'stock' | 'etf';

export type OperationType =
  | 'buy'
  | 'sell'
  | 'coupon'
  | 'maturity'
  | 'deposit'
  | 'credit'
  | 'debit'
  | 'dividend';

export type BondRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B';

// ===== CURRENCY UTILITIES =====
export interface CurrencyAmount {
  amount: number;
  currency: Currency;
}

export interface CurrencyBalances {
  BYN: number;
  USD: number;
  EUR: number;
  RUB: number;
}

// ===== BOND INTERFACE =====
export interface Bond {
  id: string;
  broker: Broker;
  issuer: string;
  amount: number;
  currency: Currency;
  couponRate: number;
  purchaseDate: string;
  maturityDate: string;
  currentValue?: number;
  rating?: BondRating | string;
}

// ===== PORTFOLIO INTERFACES =====
export interface Portfolio {
  bonds: Bond[];
  totalInvestment: number;
  totalCurrentValue: number;
  totalReturn: number;
  averageYield: number;
}

export interface PortfolioStats {
  totalAmount: number;
  averageRate: number;
  bestPerformer: Bond | null;
  worstPerformer: Bond | null;
  distribution: Record<string, number>;
}

// ===== SECURITY INTERFACE =====
export interface Security {
  symbol: string;
  name: string;
  companyName?: string;
  type: SecurityType;
  quantity: number;
  price: number;
  currency: Currency;
  // Additional fields for bonds
  nominalValue?: number;
  couponRate?: number;
  maturityDate?: string;
}

// ===== TRANSACTION INTERFACE =====
export interface Transaction {
  id: string;
  broker: Broker;
  type: OperationType;
  date: string;
  security?: Security;
  cash?: CurrencyAmount;
  fee?: number;
  note?: string;
  description?: string;
}

// ===== LEGACY OPERATION INTERFACES =====
export interface Operation {
  id: string;
  broker: Broker;
  bondId?: string;
  type: OperationType;
  date: string;
  amount: number;
  quantity?: number;
  price?: number;
  currency: Currency;
  fee?: number;
  description?: string;
}

export interface FundingOperation {
  id: string;
  broker: Broker;
  type: 'deposit' | 'withdrawal';
  date: string;
  amount: number;
  currency: Currency;
  method?: string;
  description?: string;
}

// ===== CALCULATED PORTFOLIO INTERFACES =====
export interface CalculatedPortfolio {
  balances: CurrencyBalances;
  securities: CalculatedSecurity[];
  totalValue: CurrencyBalances;
  totalDeposited: number;
  lastUpdated: string;
}

export interface CalculatedSecurity {
  symbol: string;
  name: string;
  companyName?: string;
  type: SecurityType;
  quantity: number;
  averagePrice: number;
  currency: Currency;
  currentValue: number;
  totalInvested: number;
  unrealizedPnL: number;
  // For bonds
  couponRate?: number;
  maturityDate?: string;
  monthlyIncome?: number;
}

export interface PortfolioPerformance {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  realizedGains: number;
  unrealizedGains: number;
  totalCoupons: number;
}

// ===== UTILITY TYPES =====
export type TransactionFormData = Omit<Transaction, 'id'>;

export type TransactionSortField = 'date' | 'type' | 'amount';

export type TransactionSortOrder = 'asc' | 'desc';

export interface TransactionFilters {
  type?: OperationType;
  broker?: Broker;
  currency?: Currency;
  dateFrom?: string;
  dateTo?: string;
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
