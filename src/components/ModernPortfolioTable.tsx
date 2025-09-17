'use client'

import { useState, useMemo } from 'react'
import { CalculatedSecurity } from '@/types'
import { formatCurrency, formatPercentage } from '@/utils/calculations'
import { convertToUSD } from '@/utils/currency'
import { Search, Filter, X, ChevronUp, ChevronDown, DollarSign, TrendingUp, Calendar } from 'lucide-react'

interface ModernPortfolioTableProps {
  securities: CalculatedSecurity[]
  balances: { BYN: number, USD: number, EUR: number, RUB: number }
}

type SortField = 'companyName' | 'name' | 'quantity' | 'averagePrice' | 'currency' | 'couponRate' | 'maturityDate' | 'currentValue'
type SortDirection = 'asc' | 'desc'

export const ModernPortfolioTable = ({ securities, balances }: ModernPortfolioTableProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<SortField>('companyName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filters, setFilters] = useState({
    currencies: [] as string[],
    couponRateFrom: '',
    couponRateTo: '',
    maturityDateFrom: '',
    maturityDateTo: ''
  })

  // Сортировка
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <div className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity">
        <ChevronUp className="w-4 h-4" />
      </div>
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      : <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
  }

  const filteredAndSortedSecurities = useMemo(() => {
    let result = securities

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(security => {
        const companyName = security.companyName?.toLowerCase() || ''
        const securityName = security.name?.toLowerCase() || ''
        const symbol = security.symbol?.toLowerCase() || ''
        return companyName.includes(query) || securityName.includes(query) || symbol.includes(query)
      })
    }

    if (filters.currencies.length > 0) {
      result = result.filter(security => filters.currencies.includes(security.currency))
    }

    if (filters.couponRateFrom) {
      const minRate = parseFloat(filters.couponRateFrom)
      result = result.filter(security => (security.couponRate || 0) >= minRate)
    }
    if (filters.couponRateTo) {
      const maxRate = parseFloat(filters.couponRateTo)
      result = result.filter(security => (security.couponRate || 0) <= maxRate)
    }

    if (filters.maturityDateFrom) {
      result = result.filter(security => {
        if (!security.maturityDate) return false
        return security.maturityDate >= filters.maturityDateFrom
      })
    }
    if (filters.maturityDateTo) {
      result = result.filter(security => {
        if (!security.maturityDate) return false
        return security.maturityDate <= filters.maturityDateTo
      })
    }

    result.sort((a, b) => {
      let aValue: unknown = a[sortField]
      let bValue: unknown = b[sortField]

      if (sortField === 'maturityDate') {
        aValue = a.maturityDate ? new Date(a.maturityDate.split('.').reverse().join('-')).getTime() : 0
        bValue = b.maturityDate ? new Date(b.maturityDate.split('.').reverse().join('-')).getTime() : 0
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      }
      
      return 0
    })

    return result
  }, [securities, searchQuery, filters, sortField, sortDirection])

  const getDaysToMaturity = (maturityDate?: string) => {
    if (!maturityDate) return null
    const today = new Date()
    const maturity = new Date(maturityDate.split('.').reverse().join('-'))
    const diffTime = maturity.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  if (securities.length === 0 && balances.BYN === 0 && balances.USD === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">Портфель пуст</p>
        <p className="text-sm">Добавьте транзакции для формирования портфеля</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cash balances */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <DollarSign size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Денежные средства</h3>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(
                  convertToUSD(balances.USD, 'USD') + 
                  convertToUSD(balances.BYN, 'BYN') + 
                  convertToUSD(balances.EUR, 'EUR') + 
                  convertToUSD(balances.RUB, 'RUB'), 
                  'USD'
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">общий баланс в USD</div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* USD */}
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800/80 dark:to-gray-700/80 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">$</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">USD</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Доллар США</div>
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

            {/* BYN */}
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 dark:from-blue-600/5 dark:to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800/80 dark:to-gray-700/80 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-white">Br</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">BYN</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Белорусский рубль</div>
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

            {/* EUR */}
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800/80 dark:to-gray-700/80 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">€</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">EUR</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Евро</div>
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

            {/* RUB */}
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/5 dark:to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="relative bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800/80 dark:to-gray-700/80 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">₽</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">RUB</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Российский рубль</div>
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

      {/* Portfolio assets */}
      {securities.length > 0 && (
        <div className="space-y-6">
          {/* Search and filters */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3 text-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="Поиск по компаниям, облигациям..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                  </button>
                )}
              </div>
              
              {/* Filter button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl border transition-all duration-300 shadow-sm hover:shadow-md ${
                  showFilters || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== '')
                    ? 'border-blue-500/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200/50 dark:border-gray-600/50 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-600/80'
                }`}
              >
                <Filter className="h-5 w-5" />
                <span className="text-sm font-medium">Фильтры</span>
              </button>
            </div>
          </div>

          {/* Assets table */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/80 dark:to-gray-800/80">
                  <tr>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('companyName')}
                        className="group flex items-center justify-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none w-full"
                      >
                        <span>Компания</span>
                        {getSortIcon('companyName')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('name')}
                        className="group flex items-center justify-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none w-full"
                      >
                        <span>Облигация</span>
                        {getSortIcon('name')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('quantity')}
                        className="group flex items-center justify-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none w-full"
                      >
                        <span>Количество</span>
                        {getSortIcon('quantity')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('averagePrice')}
                        className="group flex items-center justify-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none w-full"
                      >
                        <span>Номинал</span>
                        {getSortIcon('averagePrice')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('currency')}
                        className="group flex items-center justify-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none w-full"
                      >
                        <span>Валюта</span>
                        {getSortIcon('currency')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('couponRate')}
                        className="group flex items-center justify-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none w-full"
                      >
                        <span>Ставка</span>
                        {getSortIcon('couponRate')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('maturityDate')}
                        className="group flex items-center justify-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none w-full"
                      >
                        <span>Погашение</span>
                        {getSortIcon('maturityDate')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('currentValue')}
                        className="group flex items-center justify-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none w-full"
                      >
                        <span>Стоимость</span>
                        {getSortIcon('currentValue')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {filteredAndSortedSecurities.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center space-y-3">
                          <Search className="w-12 h-12 opacity-50" />
                          <p className="text-lg font-medium">Активы не найдены</p>
                          <p className="text-sm">Попробуйте изменить критерии поиска</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedSecurities.map((security) => {
                      const daysToMaturity = getDaysToMaturity(security.maturityDate)
                      
                      return (
                        <tr 
                          key={security.symbol} 
                          className="group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all duration-300"
                        >
                          {/* Company */}
                          <td className="px-6 py-4 text-center align-top">
                            <div className="flex items-center justify-center space-x-3 min-h-[2.5rem]">
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0"></div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {security.companyName || '—'}
                              </div>
                            </div>
                          </td>
                          
                          {/* Bond name */}
                          <td className="px-6 py-4 text-center align-top">
                            <div className="text-sm text-gray-700 dark:text-gray-300 min-h-[2.5rem] flex items-center justify-center">
                              {security.name || '—'}
                            </div>
                          </td>
                          
                          {/* Quantity */}
                          <td className="px-6 py-4 text-center align-top">
                            <div className="flex items-center justify-center space-x-2 min-h-[2.5rem]">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{security.quantity}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">шт.</span>
                            </div>
                          </td>
                          
                          {/* Nominal */}
                          <td className="px-6 py-4 text-center align-top">
                            <div className="text-sm font-medium text-gray-900 dark:text-white min-h-[2.5rem] flex items-center justify-center">
                              {formatCurrency(security.averagePrice, security.currency)}
                            </div>
                          </td>
                          
                          {/* Currency */}
                          <td className="px-6 py-4 text-center align-top">
                            <div className="min-h-[2.5rem] flex items-center justify-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold shadow-sm ${
                                security.currency === 'USD' 
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                                  : security.currency === 'EUR'
                                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                                  : 'bg-blue-200 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-600'
                              }`}>
                                {security.currency}
                              </span>
                            </div>
                          </td>
                          
                          {/* Annual rate */}
                          <td className="px-6 py-4 text-center align-top">
                            <div className="min-h-[2.5rem] flex items-center justify-center">
                              {security.couponRate ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex-shrink-0"></div>
                                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {formatPercentage(security.couponRate)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                          
                          {/* Maturity date */}
                          <td className="px-6 py-4 text-center align-top">
                            <div className="min-h-[2.5rem] flex flex-col justify-center items-center">
                              {security.maturityDate ? (
                                <div className="space-y-1 text-center">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {security.maturityDate}
                                  </div>
                                  {daysToMaturity !== null && (
                                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                                      daysToMaturity > 365 
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        : daysToMaturity > 90
                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    }`}>
                                      {daysToMaturity} дн.
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                          
                          {/* Total value */}
                          <td className="px-6 py-4 text-center align-top">
                            <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[2.5rem] flex items-center justify-center">
                              {formatCurrency(security.currentValue, security.currency)}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
