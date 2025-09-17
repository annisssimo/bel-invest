import { Transaction, Currency } from '@/types';
import { differenceInDays, parseISO, isValid } from 'date-fns';
import { convertToUSD } from './currency';

// ===== TYPES =====
interface CashFlow {
  date: Date;
  amount: number;
}

interface XIRRResult {
  rate: number;
  success: boolean;
  error?: string;
}

interface PortfolioMetrics {
  xirr: number;
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
}

// ===== CONSTANTS =====
const XIRR_CONFIG = {
  PRECISION: 0.000001,
  MAX_ITERATIONS: 100,
  INITIAL_RATE: 0.1,
  MIN_CASH_FLOWS: 2,
} as const;

// ===== CORE XIRR CALCULATIONS =====
const calculateNPV = (rate: number, cashFlows: CashFlow[]): number => {
  if (cashFlows.length === 0) return 0;
  
  const firstDate = cashFlows[0].date;
  return cashFlows.reduce((sum, cf) => {
    const days = differenceInDays(cf.date, firstDate);
    const years = days / 365;
    return sum + cf.amount / Math.pow(1 + rate, years);
  }, 0);
};

const calculateNPVDerivative = (rate: number, cashFlows: CashFlow[]): number => {
  if (cashFlows.length === 0) return 0;
  
  const firstDate = cashFlows[0].date;
  return cashFlows.reduce((sum, cf) => {
    const days = differenceInDays(cf.date, firstDate);
    const years = days / 365;
    return sum - years * cf.amount / Math.pow(1 + rate, years + 1);
  }, 0);
};

const calculateXIRR = (cashFlows: CashFlow[]): XIRRResult => {
  if (cashFlows.length < XIRR_CONFIG.MIN_CASH_FLOWS) {
    return { rate: 0, success: false, error: 'Insufficient cash flows' };
  }

  // Validate cash flows
  const hasPositiveFlow = cashFlows.some(cf => cf.amount > 0);
  const hasNegativeFlow = cashFlows.some(cf => cf.amount < 0);
  
  if (!hasPositiveFlow || !hasNegativeFlow) {
    return { rate: 0, success: false, error: 'Invalid cash flow pattern' };
  }

  let rate: number = XIRR_CONFIG.INITIAL_RATE;
  let iteration = 0;

  while (iteration < XIRR_CONFIG.MAX_ITERATIONS) {
    const npv = calculateNPV(rate, cashFlows);
    
    if (Math.abs(npv) < XIRR_CONFIG.PRECISION) {
      return { rate, success: true };
    }

    const derivative = calculateNPVDerivative(rate, cashFlows);
    
    if (Math.abs(derivative) < XIRR_CONFIG.PRECISION) {
      return { rate: 0, success: false, error: 'Derivative too small' };
    }

    const newRate = rate - npv / derivative;
    
    if (Math.abs(newRate - rate) < XIRR_CONFIG.PRECISION) {
      return { rate: newRate, success: true };
    }
    
    rate = newRate;
    iteration++;
  }

  return { rate, success: false, error: 'Maximum iterations reached' };
};

// ===== CASH FLOW PROCESSING =====
const processTransactionsToCashFlows = (transactions: Transaction[]): CashFlow[] => {
  const cashFlows: CashFlow[] = [];
  const securitiesMap = new Map<string, {
    quantity: number;
    totalCost: number;
    currency: Currency;
  }>();

  // Process buy transactions to track securities
  transactions.forEach(transaction => {
    if (transaction.type === 'buy' && transaction.security) {
      const { symbol, quantity, price, currency } = transaction.security;
      const totalCost = quantity * price;
      
      if (!securitiesMap.has(symbol)) {
        securitiesMap.set(symbol, { quantity: 0, totalCost: 0, currency });
      }
      
      const security = securitiesMap.get(symbol)!;
      security.quantity += quantity;
      security.totalCost += totalCost;
    }
  });

  // Process all transactions for cash flows
  transactions.forEach(transaction => {
    const date = parseISO(transaction.date);
    
    if (!isValid(date)) {
      console.warn(`Invalid date in transaction ${transaction.id}: ${transaction.date}`);
      return;
    }

    switch (transaction.type) {
      case 'deposit':
        if (transaction.cash) {
          cashFlows.push({
            date,
            amount: -convertToUSD(transaction.cash.amount, transaction.cash.currency)
          });
        }
        break;
        
      case 'debit':
        if (transaction.cash) {
          cashFlows.push({
            date,
            amount: convertToUSD(transaction.cash.amount, transaction.cash.currency)
          });
        }
        break;
        
      case 'coupon':
      case 'dividend':
        if (transaction.cash) {
          cashFlows.push({
            date,
            amount: convertToUSD(transaction.cash.amount, transaction.cash.currency)
          });
        }
        break;
    }
  });

  // Add current portfolio value as final cash flow
  const currentValue = Array.from(securitiesMap.values()).reduce((total, security) => {
    return total + convertToUSD(security.totalCost, security.currency);
  }, 0);

  if (currentValue > 0) {
    cashFlows.push({
      date: new Date(),
      amount: currentValue
    });
  }

  return cashFlows.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// ===== MAIN EXPORTED FUNCTIONS =====
export const calculatePortfolioReturn = (transactions: Transaction[]): number => {
  try {
    const cashFlows = processTransactionsToCashFlows(transactions);
    const result = calculateXIRR(cashFlows);
    
    if (!result.success) {
      console.warn('XIRR calculation failed:', result.error);
      return 0;
    }
    
    return result.rate * 100; // Convert to percentage
  } catch (error) {
    console.error('Error calculating portfolio return:', error);
    return 0;
  }
};

export const calculatePortfolioMetrics = (transactions: Transaction[]): PortfolioMetrics => {
  const cashFlows = processTransactionsToCashFlows(transactions);
  
  const totalInvested = Math.abs(cashFlows
    .filter(cf => cf.amount < 0)
    .reduce((sum, cf) => sum + cf.amount, 0)
  );
  
  const currentValue = cashFlows
    .filter(cf => cf.amount > 0)
    .reduce((sum, cf) => sum + cf.amount, 0);
  
  const totalReturn = currentValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  
  const xirrResult = calculateXIRR(cashFlows);
  const xirr = xirrResult.success ? xirrResult.rate * 100 : 0;
  
  return {
    xirr,
    totalInvested,
    currentValue,
    totalReturn,
    returnPercentage,
  };
};

export const validateCashFlows = (cashFlows: CashFlow[]): string[] => {
  const errors: string[] = [];
  
  if (cashFlows.length < XIRR_CONFIG.MIN_CASH_FLOWS) {
    errors.push(`Need at least ${XIRR_CONFIG.MIN_CASH_FLOWS} cash flows`);
  }
  
  const hasPositiveFlow = cashFlows.some(cf => cf.amount > 0);
  const hasNegativeFlow = cashFlows.some(cf => cf.amount < 0);
  
  if (!hasPositiveFlow) {
    errors.push('No positive cash flows found');
  }
  
  if (!hasNegativeFlow) {
    errors.push('No negative cash flows found');
  }
  
  const invalidDates = cashFlows.some(cf => !isValid(cf.date));
  if (invalidDates) {
    errors.push('Invalid dates found in cash flows');
  }
  
  return errors;
};
