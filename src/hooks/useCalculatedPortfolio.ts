'use client';

import { useMemo } from 'react';
import { 
  Transaction, 
  CalculatedPortfolio, 
  CalculatedSecurity, 
  CurrencyBalances,
  Currency,
  SecurityType 
} from '@/types';
import { convertToUSD, addCurrencies } from '@/utils/currency';

// ===== INTERNAL TYPES =====
interface SecurityData {
  symbol: string;
  name: string;
  type: SecurityType;
  currency: Currency;
  quantity: number;
  totalCost: number;
  transactions: Transaction[];
  couponRate?: number;
  maturityDate?: string;
}

interface CashFlows {
  deposits: CurrencyBalances;
  withdrawals: CurrencyBalances;
  couponIncome: CurrencyBalances;
  assetPurchases: CurrencyBalances;
}

// ===== MAIN HOOK =====
export const useCalculatedPortfolio = (transactions: Transaction[]): CalculatedPortfolio => {
  return useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return createEmptyPortfolio();
    }

    const cashFlows = calculateCashFlows(transactions);
    const securitiesMap = processSecurities(transactions);
    const securities = calculateSecurities(securitiesMap);
    const balances = calculateBalances(cashFlows);
    const totalValue = calculateTotalValue(cashFlows);
    const totalDeposited = calculateTotalDeposited(cashFlows.deposits);

    return {
      balances,
      securities,
      totalValue,
      totalDeposited,
      lastUpdated: new Date().toISOString(),
    };
  }, [transactions]);
};

// ===== HELPER FUNCTIONS =====
const createEmptyPortfolio = (): CalculatedPortfolio => ({
  balances: { BYN: 0, USD: 0, EUR: 0, RUB: 0 },
  securities: [],
  totalValue: { BYN: 0, USD: 0, EUR: 0, RUB: 0 },
  totalDeposited: 0,
  lastUpdated: new Date().toISOString(),
});

const calculateCashFlows = (transactions: Transaction[]): CashFlows => {
  const cashFlows: CashFlows = {
    deposits: { BYN: 0, USD: 0, EUR: 0, RUB: 0 },
    withdrawals: { BYN: 0, USD: 0, EUR: 0, RUB: 0 },
    couponIncome: { BYN: 0, USD: 0, EUR: 0, RUB: 0 },
    assetPurchases: { BYN: 0, USD: 0, EUR: 0, RUB: 0 },
  };

  transactions.forEach(transaction => {
    const { type, cash, security, fee = 0 } = transaction;

    // Process cash flows
    if (cash) {
      switch (type) {
        case 'deposit':
          cashFlows.deposits[cash.currency] += cash.amount;
          break;
        case 'debit':
          cashFlows.withdrawals[cash.currency] += cash.amount;
          break;
        case 'coupon':
        case 'dividend':
          cashFlows.couponIncome[cash.currency] += cash.amount;
          break;
      }
    }

    // Process asset purchases
    if (security && type === 'buy') {
      const totalCost = (security.quantity * security.price) + fee;
      cashFlows.assetPurchases[security.currency] += totalCost;
    }
  });

  return cashFlows;
};

const processSecurities = (transactions: Transaction[]): Map<string, SecurityData> => {
  const securitiesMap = new Map<string, SecurityData>();

  transactions.forEach(transaction => {
    const { type, security, fee = 0 } = transaction;

    if (!security) return;

    const { symbol, name, type: secType, quantity, price, currency } = security;

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
        maturityDate: security.maturityDate,
      });
    }

    const secData = securitiesMap.get(symbol)!;
    secData.transactions.push(transaction);

    switch (type) {
      case 'buy': {
        const totalCost = (quantity * price) + fee;
        secData.quantity += quantity;
        secData.totalCost += totalCost;
        break;
      }
      case 'sell':
      case 'maturity': {
        if (secData.quantity > 0) {
          const avgCost = secData.totalCost / secData.quantity;
          const costToRemove = quantity * avgCost;
          
          secData.quantity = Math.max(0, secData.quantity - quantity);
          secData.totalCost = Math.max(0, secData.totalCost - costToRemove);
        }
        break;
      }
    }
  });

  return securitiesMap;
};

const calculateSecurities = (securitiesMap: Map<string, SecurityData>): CalculatedSecurity[] => {
  return Array.from(securitiesMap.values())
    .filter(sec => sec.quantity > 0)
    .map(sec => {
      const averagePrice = sec.totalCost / sec.quantity;
      const currentValue = sec.quantity * averagePrice;
      
      const couponTransactions = sec.transactions.filter(t => t.type === 'coupon');
      const totalCoupons = couponTransactions.reduce(
        (sum, t) => sum + (t.cash?.amount || 0), 
        0
      );
      
      const bondTransaction = sec.transactions.find(t => t.type === 'buy');
      const couponRate = sec.couponRate || 
                        bondTransaction?.security?.couponRate || 
                        extractCouponRate(sec.name);
      
      const maturityDate = sec.maturityDate || 
                          bondTransaction?.security?.maturityDate || 
                          extractMaturityDate(sec.name);

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
        monthlyIncome: couponRate ? (sec.totalCost * couponRate / 100 / 12) : undefined,
      };
    });
};

const calculateBalances = (cashFlows: CashFlows): CurrencyBalances => {
  const { deposits, withdrawals, couponIncome, assetPurchases } = cashFlows;
  
  return {
    BYN: deposits.BYN - withdrawals.BYN + couponIncome.BYN - assetPurchases.BYN,
    USD: deposits.USD - withdrawals.USD + couponIncome.USD - assetPurchases.USD,
    EUR: deposits.EUR - withdrawals.EUR + couponIncome.EUR - assetPurchases.EUR,
    RUB: deposits.RUB - withdrawals.RUB + couponIncome.RUB - assetPurchases.RUB,
  };
};

const calculateTotalValue = (cashFlows: CashFlows): CurrencyBalances => {
  const { deposits, withdrawals, couponIncome } = cashFlows;
  
  return {
    BYN: deposits.BYN - withdrawals.BYN + couponIncome.BYN,
    USD: deposits.USD - withdrawals.USD + couponIncome.USD,
    EUR: deposits.EUR - withdrawals.EUR + couponIncome.EUR,
    RUB: deposits.RUB - withdrawals.RUB + couponIncome.RUB,
  };
};

const calculateTotalDeposited = (deposits: CurrencyBalances): number => {
  return addCurrencies([
    { amount: deposits.BYN, currency: 'BYN' },
    { amount: deposits.USD, currency: 'USD' },
    { amount: deposits.EUR, currency: 'EUR' },
    { amount: deposits.RUB, currency: 'RUB' },
  ], 'USD');
};

// ===== UTILITY FUNCTIONS =====
const extractCouponRate = (name: string): number | undefined => {
  const match = name.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? parseFloat(match[1]) : undefined;
};

const extractMaturityDate = (name: string): string | undefined => {
  const match = name.match(/(\d{2}\.\d{2}\.\d{4})/);
  return match ? match[1] : undefined;
};
