'use client';

import { Bond } from '@/types';
import {
  calculatePortfolioStats,
  formatPercentage,
  getPortfolioByCurrency,
} from '@/utils/calculations';
import { formatCurrency } from '@/utils/currency';
import { TrendingUp, DollarSign, Percent, Award } from 'lucide-react';

interface PortfolioStatsProps {
  bonds: Bond[];
}

export const PortfolioStats = ({ bonds }: PortfolioStatsProps) => {
  const stats = calculatePortfolioStats(bonds);
  const currencyStats = getPortfolioByCurrency(bonds);

  const statCards = [
    {
      title: 'Средняя ставка',
      value: formatPercentage(stats.averageRate),
      icon: Percent,
      color: 'text-green-600',
    },
    {
      title: 'Количество облигаций',
      value: bonds.length.toString(),
      icon: Award,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currencyStats.BYN.count > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mr-2">
                BYN
              </span>
              Белорусские рубли
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Общая сумма
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(currencyStats.BYN.total, 'BYN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Годовой доход
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(currencyStats.BYN.income, 'BYN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Месячный доход
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(currencyStats.BYN.monthlyIncome, 'BYN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Облигаций
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currencyStats.BYN.count}
                </p>
              </div>
            </div>
          </div>
        )}

        {currencyStats.USD.count > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 mr-2">
                USD
              </span>
              Доллары США
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Общая сумма
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(currencyStats.USD.total, 'USD')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Годовой доход
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(currencyStats.USD.income, 'USD')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Месячный доход
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(currencyStats.USD.monthlyIncome, 'USD')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Облигаций
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currencyStats.USD.count}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center">
              <div
                className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${stat.color}`}
              >
                <stat.icon size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.bestPerformer && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Лучшие показатели
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Самая доходная облигация:
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {stats.bestPerformer.issuer} (
                {formatPercentage(stats.bestPerformer.couponRate)})
              </p>
            </div>
            {stats.worstPerformer && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Самая консервативная облигация:
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {stats.worstPerformer.issuer} (
                  {formatPercentage(stats.worstPerformer.couponRate)})
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
