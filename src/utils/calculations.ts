import { Bond, PortfolioStats, Currency, CurrencyBalances } from '@/types';
import { differenceInDays, parseISO, isValid } from 'date-fns';
import { convertToUSD, addCurrencies } from './currency';

// ===== BOND CALCULATIONS =====
export const calculateYearlyIncome = (bond: Bond): number => {
  return (bond.amount * bond.couponRate) / 100;
};

export const calculateMonthlyIncome = (bond: Bond): number => {
  return calculateYearlyIncome(bond) / 12;
};

export const calculateDaysToMaturity = (maturityDate: string): number => {
  const today = new Date();
  const maturity = parseISO(maturityDate);
  
  if (!isValid(maturity)) {
    throw new Error(`Invalid maturity date: ${maturityDate}`);
  }
  
  return differenceInDays(maturity, today);
};

export const calculateBondYield = (bond: Bond): number => {
  const daysToMaturity = calculateDaysToMaturity(bond.maturityDate);
  const yearlyIncome = calculateYearlyIncome(bond);
  
  if (daysToMaturity <= 0) return 0;
  
  return (yearlyIncome / bond.amount) * (365 / daysToMaturity) * 100;
};

// ===== PORTFOLIO CALCULATIONS =====
export const calculatePortfolioStats = (bonds: Bond[]): PortfolioStats => {
  if (bonds.length === 0) {
    return {
      totalAmount: 0,
      averageRate: 0,
      bestPerformer: null,
      worstPerformer: null,
      distribution: {},
    };
  }

  // Calculate total amount in USD for proper comparison
  const totalAmount = addCurrencies(
    bonds.map(bond => ({ amount: bond.amount, currency: bond.currency })),
    'USD'
  );

  const averageRate = bonds.reduce((sum, bond) => sum + bond.couponRate, 0) / bonds.length;

  const distribution = bonds.reduce((acc, bond) => {
    const key = `${bond.issuer} (${bond.currency})`;
    acc[key] = (acc[key] || 0) + bond.amount;
    return acc;
  }, {} as Record<string, number>);

  const bestPerformer = bonds.reduce((best, bond) => 
    !best || bond.couponRate > best.couponRate ? bond : best, 
    null as Bond | null
  );
  
  const worstPerformer = bonds.reduce((worst, bond) => 
    !worst || bond.couponRate < worst.couponRate ? bond : worst, 
    null as Bond | null
  );

  return {
    totalAmount,
    averageRate,
    bestPerformer,
    worstPerformer,
    distribution,
  };
};

export const getPortfolioByCurrency = (bonds: Bond[]) => {
  const currencyGroups = bonds.reduce((acc, bond) => {
    if (!acc[bond.currency]) {
      acc[bond.currency] = [];
    }
    acc[bond.currency].push(bond);
    return acc;
  }, {} as Record<Currency, Bond[]>);

  const result: Record<Currency, {
    total: number;
    income: number;
    monthlyIncome: number;
    count: number;
  }> = {} as any;

  Object.entries(currencyGroups).forEach(([currency, bonds]) => {
    const total = bonds.reduce((sum, bond) => sum + bond.amount, 0);
    const income = bonds.reduce((sum, bond) => sum + calculateYearlyIncome(bond), 0);
    const monthlyIncome = bonds.reduce((sum, bond) => sum + calculateMonthlyIncome(bond), 0);
    
    result[currency as Currency] = {
      total,
      income,
      monthlyIncome,
      count: bonds.length,
    };
  });

  return result;
};

// ===== PORTFOLIO PERFORMANCE =====
export const calculatePortfolioPerformance = (bonds: Bond[]): {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
} => {
  const totalInvested = addCurrencies(
    bonds.map(bond => ({ amount: bond.amount, currency: bond.currency })),
    'USD'
  );

  const currentValue = addCurrencies(
    bonds.map(bond => ({ 
      amount: bond.currentValue || bond.amount, 
      currency: bond.currency 
    })),
    'USD'
  );

  const totalReturn = currentValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    totalReturn,
    returnPercentage,
  };
};

// ===== FORMATTING UTILITIES =====
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

// ===== VALIDATION UTILITIES =====
export const validateBond = (bond: Partial<Bond>): string[] => {
  const errors: string[] = [];

  if (!bond.issuer || bond.issuer.trim() === '') {
    errors.push('Issuer is required');
  }

  if (!bond.amount || bond.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!bond.couponRate || bond.couponRate < 0) {
    errors.push('Coupon rate must be non-negative');
  }

  if (!bond.purchaseDate || !isValid(parseISO(bond.purchaseDate))) {
    errors.push('Valid purchase date is required');
  }

  if (!bond.maturityDate || !isValid(parseISO(bond.maturityDate))) {
    errors.push('Valid maturity date is required');
  }

  if (bond.purchaseDate && bond.maturityDate) {
    const purchase = parseISO(bond.purchaseDate);
    const maturity = parseISO(bond.maturityDate);
    
    if (isValid(purchase) && isValid(maturity) && purchase >= maturity) {
      errors.push('Maturity date must be after purchase date');
    }
  }

  return errors;
};

// ===== RISK CALCULATIONS =====
export const calculatePortfolioRisk = (bonds: Bond[]): {
  averageRating: string;
  concentrationRisk: number;
  currencyRisk: number;
} => {
  const ratings = bonds
    .map(bond => bond.rating)
    .filter((rating): rating is string => Boolean(rating));

  const averageRating = ratings.length > 0 
    ? ratings[Math.floor(ratings.length / 2)] 
    : 'Unknown';

  // Calculate concentration risk (max single issuer percentage)
  const issuerTotals = bonds.reduce((acc, bond) => {
    acc[bond.issuer] = (acc[bond.issuer] || 0) + bond.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalAmount = Object.values(issuerTotals).reduce((sum, amount) => sum + amount, 0);
  const maxConcentration = Math.max(...Object.values(issuerTotals));
  const concentrationRisk = totalAmount > 0 ? (maxConcentration / totalAmount) * 100 : 0;

  // Calculate currency risk (percentage in non-USD currencies)
  const nonUSDAmount = bonds
    .filter(bond => bond.currency !== 'USD')
    .reduce((sum, bond) => sum + convertToUSD(bond.amount, bond.currency), 0);
  
  const totalUSDAmount = addCurrencies(
    bonds.map(bond => ({ amount: bond.amount, currency: bond.currency })),
    'USD'
  );
  
  const currencyRisk = totalUSDAmount > 0 ? (nonUSDAmount / totalUSDAmount) * 100 : 0;

  return {
    averageRating,
    concentrationRisk,
    currencyRisk,
  };
};
