'use client';

import { useState, useMemo } from 'react';
import { CalculatedSecurity } from '@/types';
import { formatPercentage } from '@/utils/calculations';
import { formatCurrency } from '@/utils/currency';
import { convertToUSD } from '@/utils/currency';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import DatePicker from './DatePicker';

interface CalculatedPortfolioTableProps {
  securities: CalculatedSecurity[];
  balances: { BYN: number; USD: number; EUR: number; RUB: number };
}

type SortField =
  | 'companyName'
  | 'name'
  | 'quantity'
  | 'averagePrice'
  | 'currency'
  | 'couponRate'
  | 'maturityDate'
  | 'currentValue';
type SortDirection = 'asc' | 'desc';

export const CalculatedPortfolioTable = ({
  securities,
  balances,
}: CalculatedPortfolioTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('currentValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState({
    currencies: [] as string[],
    couponRateFrom: '',
    couponRateTo: '',
    maturityDateFrom: '',
    maturityDateTo: '',
  });

  const filteredSecurities = useMemo(() => {
    let result = securities;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      result = result.filter((security) => {
        const companyName = security.companyName?.toLowerCase() || '';
        if (companyName.includes(query)) return true;

        const securityName = security.name?.toLowerCase() || '';
        if (securityName.includes(query)) return true;

        const symbol = security.symbol?.toLowerCase() || '';
        if (symbol.includes(query)) return true;

        return false;
      });
    }

    if (filters.currencies.length > 0) {
      result = result.filter((security) =>
        filters.currencies.includes(security.currency)
      );
    }

    if (filters.couponRateFrom) {
      const minRate = parseFloat(filters.couponRateFrom);
      result = result.filter(
        (security) => (security.couponRate || 0) >= minRate
      );
    }
    if (filters.couponRateTo) {
      const maxRate = parseFloat(filters.couponRateTo);
      result = result.filter(
        (security) => (security.couponRate || 0) <= maxRate
      );
    }

    if (filters.maturityDateFrom) {
      result = result.filter((security) => {
        if (!security.maturityDate) return false;
        return security.maturityDate >= filters.maturityDateFrom;
      });
    }
    if (filters.maturityDateTo) {
      result = result.filter((security) => {
        if (!security.maturityDate) return false;
        return security.maturityDate <= filters.maturityDateTo;
      });
    }

    result.sort((a, b) => {
      let aValue: unknown = a[sortField];
      let bValue: unknown = b[sortField];

      if (sortField === 'maturityDate') {
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = new Date(aValue.split('.').reverse().join('-'));
          bValue = new Date(bValue.split('.').reverse().join('-'));
        }
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'ru');
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });

    return result;
  }, [securities, searchQuery, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col opacity-40 group-hover:opacity-70 transition-opacity">
          <ChevronUp className="w-4 h-3 -mb-0.5" />
          <ChevronDown className="w-4 h-3" />
        </div>
      );
    }
    return (
      <div className="flex flex-col">
        <ChevronUp
          className={`w-4 h-3 -mb-0.5 ${
            sortDirection === 'asc'
              ? 'text-blue-600 dark:text-blue-400'
              : 'opacity-40'
          }`}
        />
        <ChevronDown
          className={`w-4 h-3 ${
            sortDirection === 'desc'
              ? 'text-blue-600 dark:text-blue-400'
              : 'opacity-40'
          }`}
        />
      </div>
    );
  };

  const getDaysToMaturity = (maturityDate?: string) => {
    if (!maturityDate) return null;
    const today = new Date();
    const maturity = new Date(maturityDate.split('.').reverse().join('-'));
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (securities.length === 0 && balances.BYN === 0 && balances.USD === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <p className="text-base">Портфель пуст</p>
        <p className="text-sm">Добавьте транзакции для формирования портфеля</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Денежные средства
              </h3>
            </div>
            <div className="text-right">
              <div className="text-base font-semibold text-gray-900 dark:text-white">
                {formatCurrency(
                  convertToUSD(balances.USD, 'USD') +
                    convertToUSD(balances.BYN, 'BYN') +
                    convertToUSD(balances.EUR, 'EUR') +
                    convertToUSD(balances.RUB, 'RUB'),
                  'USD'
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                общий баланс в USD
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800/80 dark:to-gray-700/80 rounded-xl p-4 border border-blue-200/50 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">$</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        USD
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Доллар США
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(balances.USD, 'USD')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 dark:from-blue-600/5 dark:to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800/80 dark:to-gray-700/80 rounded-xl p-4 border border-blue-200/50 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-white">Br</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        BYN
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Белорусский рубль
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(balances.BYN, 'BYN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800/80 dark:to-gray-700/80 rounded-xl p-4 border border-blue-200/50 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">€</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        EUR
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Евро
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(balances.EUR, 'EUR')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/5 dark:to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="relative bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800/80 dark:to-gray-700/80 rounded-xl p-4 border border-indigo-200/50 dark:border-gray-600/50 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">₽</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                        RUB
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Российский рубль
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(balances.RUB, 'RUB')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {securities.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Поиск по компаниям, облигациям..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
                  showFilters ||
                  Object.values(filters).some((f) =>
                    Array.isArray(f) ? f.length > 0 : f !== ''
                  )
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Фильтры</span>
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Валюты
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['USD', 'BYN', 'EUR', 'RUB'].map((currency) => (
                        <button
                          key={currency}
                          onClick={() => {
                            if (filters.currencies.includes(currency)) {
                              setFilters((prev) => ({
                                ...prev,
                                currencies: prev.currencies.filter(
                                  (c) => c !== currency
                                ),
                              }));
                            } else {
                              setFilters((prev) => ({
                                ...prev,
                                currencies: [...prev.currencies, currency],
                              }));
                            }
                          }}
                          className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-300 ${
                            filters.currencies.includes(currency)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {currency}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Купонная ставка (%)
                      </label>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="От"
                            value={filters.couponRateFrom}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                couponRateFrom: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 px-1">
                          —
                        </span>
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="До"
                            value={filters.couponRateTo}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                couponRateTo: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Дата погашения
                      </label>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <DatePicker
                            value={filters.maturityDateFrom}
                            onChange={(date) =>
                              setFilters((prev) => ({
                                ...prev,
                                maturityDateFrom: date,
                              }))
                            }
                            placeholder="От даты"
                            className="w-full text-sm"
                          />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 px-1">
                          —
                        </span>
                        <div className="flex-1">
                          <DatePicker
                            value={filters.maturityDateTo}
                            onChange={(date) =>
                              setFilters((prev) => ({
                                ...prev,
                                maturityDateTo: date,
                              }))
                            }
                            placeholder="До даты"
                            className="w-full text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setFilters({
                          currencies: [],
                          couponRateFrom: '',
                          couponRateTo: '',
                          maturityDateFrom: '',
                          maturityDateTo: '',
                        });
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-all duration-300 font-medium"
                    >
                      Очистить все
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('companyName')}
                      className="group flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-100 transition-colors cursor-pointer select-none"
                    >
                      <span>Компания</span>
                      {getSortIcon('companyName')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="group flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-100 transition-colors cursor-pointer select-none"
                    >
                      <span>Название облигации</span>
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('quantity')}
                      className="group flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-100 transition-colors cursor-pointer select-none"
                    >
                      <span>Количество</span>
                      {getSortIcon('quantity')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('averagePrice')}
                      className="group flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-100 transition-colors cursor-pointer select-none"
                    >
                      <span>Номинал</span>
                      {getSortIcon('averagePrice')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('currency')}
                      className="group flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-100 transition-colors cursor-pointer select-none"
                    >
                      <span>Валюта</span>
                      {getSortIcon('currency')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('couponRate')}
                      className="group flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-100 transition-colors cursor-pointer select-none"
                    >
                      <span>Годовая ставка</span>
                      {getSortIcon('couponRate')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('maturityDate')}
                      className="group flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-100 transition-colors cursor-pointer select-none"
                    >
                      <span>Дата погашения</span>
                      {getSortIcon('maturityDate')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('currentValue')}
                      className="group flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-100 transition-colors cursor-pointer select-none"
                    >
                      <span>Общая стоимость</span>
                      {getSortIcon('currentValue')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSecurities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-base">Активы не найдены</p>
                        <p className="text-sm">
                          Попробуйте изменить параметры поиска или фильтры
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSecurities.map((security) => {
                    const daysToMaturity = getDaysToMaturity(
                      security.maturityDate
                    );
                    const isProfit = security.unrealizedPnL >= 0;

                    return (
                      <tr
                        key={security.symbol}
                        className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-300 border-b border-gray-200/50 dark:border-gray-700/50"
                      >
                        {/* Компания */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                              {security.companyName || '—'}
                            </div>
                          </div>
                        </td>

                        {/* Название облигации */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                            {security.name || '—'}
                          </div>
                        </td>

                        {/* Количество */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {security.quantity}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              шт.
                            </span>
                          </div>
                        </td>

                        {/* Номинал */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatCurrency(
                            security.averagePrice,
                            security.currency
                          )}
                        </td>

                        {/* Валюта */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all duration-300 group-hover:shadow-md ${
                              security.currency === 'USD'
                                ? 'bg-gradient-to-r from-blue-100 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                                : security.currency === 'EUR'
                                ? 'bg-gradient-to-r from-indigo-100 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                                : security.currency === 'BYN'
                                ? 'bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-800/30 dark:to-indigo-800/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-600'
                                : 'bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-800/30 dark:to-indigo-800/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-600'
                            }`}
                          >
                            {security.currency}
                          </span>
                        </td>

                        {/* Годовая ставка */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {security.couponRate ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {formatPercentage(security.couponRate)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>

                        {/* Дата погашения */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {security.maturityDate ? (
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(
                                  security.maturityDate
                                ).toLocaleDateString('ru-RU')}
                              </div>
                              {daysToMaturity !== null && (
                                <div
                                  className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                                    daysToMaturity > 365
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                      : daysToMaturity > 90
                                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  }`}
                                >
                                  {daysToMaturity} дн.
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>

                        {/* Общая стоимость */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                              {formatCurrency(
                                security.currentValue,
                                security.currency
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
