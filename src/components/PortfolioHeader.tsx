'use client';

import { CalculatedPortfolio, Transaction } from '@/types';
import { convertToUSD } from '@/utils/currency';
import { calculatePortfolioReturn } from '@/utils/xirr';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Target,
} from 'lucide-react';

interface PortfolioHeaderProps {
  portfolio: CalculatedPortfolio;
  transactions: Transaction[];
}

export const PortfolioHeader = ({
  portfolio,
  transactions,
}: PortfolioHeaderProps) => {
  const totalValueUSD =
    convertToUSD(portfolio.totalValue.BYN, 'BYN') +
    portfolio.totalValue.USD +
    convertToUSD(portfolio.totalValue.EUR, 'EUR') +
    convertToUSD(portfolio.totalValue.RUB, 'RUB');
  const totalBalanceUSD =
    convertToUSD(portfolio.balances.BYN, 'BYN') +
    portfolio.balances.USD +
    convertToUSD(portfolio.balances.EUR, 'EUR') +
    convertToUSD(portfolio.balances.RUB, 'RUB');

  const totalCoupons = transactions
    .filter((t) => t.type === 'coupon' && t.cash)
    .reduce(
      (sum, t) => sum + convertToUSD(t.cash!.amount, t.cash!.currency),
      0
    );

  const totalInvested = portfolio.totalDeposited; // Используем общую сумму пополнений
  const totalProfit = totalCoupons;

  const profitPercentage =
    totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const annualCouponIncome = portfolio.securities.reduce((sum, sec) => {
    if (sec.couponRate && sec.totalInvested) {
      const annualIncome = convertToUSD(
        sec.totalInvested * (sec.couponRate / 100),
        sec.currency
      );
      return sum + annualIncome;
    }
    return sum;
  }, 0);

  const yieldPercentage = calculatePortfolioReturn(transactions);

  const passiveIncomePercentage =
    totalValueUSD > 0 ? (annualCouponIncome / totalValueUSD) * 100 : 0;
  const passiveIncomeAnnual = annualCouponIncome;

  const isProfitable = totalProfit >= 0;
  const isYieldPositive = yieldPercentage >= 0;

  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl mb-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400 to-indigo-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-3">
            Портфель
          </h1>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign
                size={14}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <span className="text-sm font-medium">Все суммы в USD</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-5 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                  <Target size={16} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Стоимость
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalValueUSD)}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">
                  {formatCurrency(totalInvested)} вложено
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-5 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className={`p-2 rounded-lg shadow-lg ${
                    isProfitable
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      : 'bg-gradient-to-r from-red-500 to-rose-600'
                  }`}
                >
                  {isProfitable ? (
                    <TrendingUp size={16} className="text-white" />
                  ) : (
                    <TrendingDown size={16} className="text-white" />
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Прибыль
                </span>
              </div>
              <div className="space-y-1">
                <div
                  className={`text-2xl font-bold ${
                    isProfitable
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isProfitable ? '+' : ''}
                  {formatCurrency(totalProfit)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span
                    className={
                      isProfitable
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {formatPercentage(profitPercentage)}
                  </span>
                  <span className="ml-1">за весь период</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/5 dark:to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-5 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-300/50 dark:hover:border-indigo-600/50 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg shadow-lg">
                  <Percent size={16} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Средняя ставка
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {portfolio.securities.length > 0
                    ? (
                        portfolio.securities.reduce(
                          (sum, sec) => sum + (sec.couponRate || 0),
                          0
                        ) / portfolio.securities.length
                      ).toFixed(2)
                    : '0.00'}
                  %
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">
                  по облигациям
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-600/5 dark:to-indigo-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-5 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
                  <DollarSign size={16} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Купонный доход
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(annualCouponIncome)}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">
                  {formatCurrency(annualCouponIncome / 12)} в месяц
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
