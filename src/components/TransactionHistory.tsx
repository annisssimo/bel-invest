'use client'

import { useState, useMemo } from 'react'
import { Transaction } from '@/types'
import { Edit2, Trash2, DollarSign, TrendingUp, TrendingDown, Plus, Minus, Target, Gift, Search, X, Filter, Calendar, Banknote } from 'lucide-react'
import { formatCurrency } from '@/utils/calculations'
import DatePicker from './DatePicker'

interface TransactionHistoryProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

export const TransactionHistory = ({ transactions, onEdit, onDelete }: TransactionHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    types: [] as Transaction['type'][],
    currencies: [] as string[],
    dateFrom: '',
    dateTo: '',
    amountFrom: '',
    amountTo: ''
  })

  // Фильтрация транзакций по поисковому запросу и фильтрам
  const filteredTransactions = useMemo(() => {
    let result = transactions

    // Применяем поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      
      result = result.filter(transaction => {
        // Поиск в названии компании
        const companyName = transaction.security?.companyName?.toLowerCase() || ''
        if (companyName.includes(query)) return true

        // Поиск в названии облигации
        const securityName = transaction.security?.name?.toLowerCase() || ''
        if (securityName.includes(query)) return true

        // Поиск в символе
        const symbol = transaction.security?.symbol?.toLowerCase() || ''
        if (symbol.includes(query)) return true

        // Поиск в примечании
        const note = transaction.note?.toLowerCase() || ''
        if (note.includes(query)) return true

        return false
      })
    }

    // Применяем фильтры
    // Фильтр по типам операций
    if (filters.types.length > 0) {
      result = result.filter(transaction => filters.types.includes(transaction.type))
    }

    // Фильтр по валютам
    if (filters.currencies.length > 0) {
      result = result.filter(transaction => {
        const currency = transaction.security?.currency || transaction.cash?.currency
        return currency && filters.currencies.includes(currency)
      })
    }

    // Фильтр по датам
    if (filters.dateFrom) {
      result = result.filter(transaction => transaction.date >= filters.dateFrom)
    }
    if (filters.dateTo) {
      result = result.filter(transaction => transaction.date <= filters.dateTo + 'T23:59:59')
    }

    // Фильтр по сумме
    if (filters.amountFrom || filters.amountTo) {
      result = result.filter(transaction => {
        const amount = transaction.security 
          ? transaction.security.quantity * transaction.security.price
          : transaction.cash?.amount || 0

        if (filters.amountFrom && amount < parseFloat(filters.amountFrom)) return false
        if (filters.amountTo && amount > parseFloat(filters.amountTo)) return false
        
        return true
      })
    }

    return result
  }, [transactions, searchQuery, filters])

  // Функции для работы с фильтрами
  const toggleTypeFilter = (type: Transaction['type']) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }))
  }

  const toggleCurrencyFilter = (currency: string) => {
    setFilters(prev => ({
      ...prev,
      currencies: prev.currencies.includes(currency)
        ? prev.currencies.filter(c => c !== currency)
        : [...prev.currencies, currency]
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      types: [],
      currencies: [],
      dateFrom: '',
      dateTo: '',
      amountFrom: '',
      amountTo: ''
    })
    setSearchQuery('')
  }

  const hasActiveFilters = filters.types.length > 0 || filters.currencies.length > 0 || 
    filters.dateFrom || filters.dateTo || filters.amountFrom || filters.amountTo || searchQuery

  // Получаем уникальные валюты из транзакций
  const availableCurrencies = Array.from(new Set(transactions.map(t => 
    t.security?.currency || t.cash?.currency
  ).filter(Boolean)))

  // Функции для форматирования числовых полей
  const formatNumberInput = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '')
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const parseFormattedNumber = (value: string): string => {
    return value.replace(/\s/g, '')
  }

  const handleAmountFromChange = (value: string) => {
    const formatted = formatNumberInput(value)
    setFilters(prev => ({ ...prev, amountFrom: parseFormattedNumber(formatted) }))
  }

  const handleAmountToChange = (value: string) => {
    const formatted = formatNumberInput(value)
    setFilters(prev => ({ ...prev, amountTo: parseFormattedNumber(formatted) }))
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Нет транзакций</p>
        <p className="text-sm">Добавьте первую транзакцию для формирования портфеля</p>
      </div>
    )
  }

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'buy': return <Plus className="w-4 h-4 text-white" />
      case 'sell': return <Minus className="w-4 h-4 text-white" />
      case 'deposit': return <TrendingUp className="w-4 h-4 text-white" />
      case 'credit': return <TrendingUp className="w-4 h-4 text-white" />
      case 'debit': return <TrendingDown className="w-4 h-4 text-white" />
      case 'coupon': return <Gift className="w-4 h-4 text-white" />
      case 'dividend': return <Gift className="w-4 h-4 text-white" />
      case 'maturity': return <Target className="w-4 h-4 text-white" />
      default: return <DollarSign className="w-4 h-4 text-white" />
    }
  }

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'buy': return 'Покупка'
      case 'sell': return 'Продажа'
      case 'deposit': return 'Пополнение'
      case 'credit': return 'Зачисление'
      case 'debit': return 'Вывод'
      case 'coupon': return 'Купон'
      case 'dividend': return 'Дивиденд'
      case 'maturity': return 'Погашение'
      default: return type
    }
  }

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'buy': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'sell': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      case 'deposit': case 'credit': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
      case 'debit': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      case 'coupon': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
      case 'dividend': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
      case 'maturity': return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
    }
  }

  return (
    <div className="space-y-3">
      {/* Поисковое поле и кнопка фильтров */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск по компаниям, облигациям, примечаниям..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-8 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 rounded-xl border transition-all duration-300 flex items-center gap-1.5 text-sm ${
            hasActiveFilters
              ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          Фильтры
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
              {[...filters.types, ...filters.currencies].length + 
               (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0) + 
               (filters.amountFrom ? 1 : 0) + (filters.amountTo ? 1 : 0) + 
               (searchQuery ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Панель фильтров */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Фильтры
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Очистить все
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Фильтр по типам операций */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Тип операции
              </label>
              <div className="flex flex-wrap gap-2">
                {(['buy', 'deposit', 'debit', 'coupon'] as Transaction['type'][]).map(type => (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      filters.types.includes(type)
                        ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600'
                    }`}
                  >
                    {getTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Фильтр по валютам */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Валюта
              </label>
              <div className="flex flex-wrap gap-2">
                {(['BYN', 'USD', 'EUR', 'RUB'] as const).map(currency => (
                  <button
                    key={currency}
                    onClick={() => toggleCurrencyFilter(currency)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      filters.currencies.includes(currency)
                        ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600'
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>
            </div>

            {/* Фильтр по датам */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Период
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <DatePicker
                    value={filters.dateFrom}
                    onChange={(value) => setFilters(prev => ({ ...prev, dateFrom: value || '' }))}
                    placeholder="От"
                  />
                </div>
                <div className="flex-1">
                  <DatePicker
                    value={filters.dateTo}
                    onChange={(value) => setFilters(prev => ({ ...prev, dateTo: value || '' }))}
                    placeholder="До"
                  />
                </div>
              </div>
            </div>

            {/* Фильтр по сумме */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Banknote className="inline w-4 h-4 mr-1" />
                Сумма
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formatNumberInput(filters.amountFrom)}
                  onChange={(e) => handleAmountFromChange(e.target.value)}
                  className="flex-1 h-10 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="От"
                />
                <input
                  type="text"
                  value={formatNumberInput(filters.amountTo)}
                  onChange={(e) => handleAmountToChange(e.target.value)}
                  className="flex-1 h-10 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="До"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Результаты поиска */}
      {filteredTransactions.length === 0 && searchQuery ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Ничего не найдено</p>
          <p className="text-sm">Попробуйте изменить поисковый запрос</p>
        </div>
      ) : (
        filteredTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 hover:shadow-lg hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300">
                {getTypeIcon(transaction.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className={`px-2 py-0.5 text-xs font-medium border rounded-full ${getTypeColor(transaction.type)}`}>
                    {getTypeLabel(transaction.type)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString('ru-RU', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                {transaction.security && (
                  <div className="mb-2">
                    <div className="font-semibold text-base text-gray-900 dark:text-white mb-0.5">
                      {transaction.security.companyName || transaction.security.name}
                    </div>
                    
                    {transaction.security.companyName && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                        {transaction.security.name}
                      </div>
                    )}
                    
                    {transaction.type !== 'coupon' && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Количество:</span>
                          <span className="font-medium text-sm text-gray-900 dark:text-white">{transaction.security.quantity} шт.</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Цена за единицу:</span>
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {formatCurrency(transaction.security.price, transaction.security.currency)}
                          </span>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Общая сумма:</span>
                            <span className="font-semibold text-base text-gray-900 dark:text-white">
                              {formatCurrency(transaction.security.quantity * transaction.security.price, transaction.security.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {transaction.cash && (
                  <div className="mb-1.5">
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {['deposit', 'credit', 'coupon', 'dividend'].includes(transaction.type) ? '+' : '-'}
                      {formatCurrency(transaction.cash.amount, transaction.cash.currency)}
                    </div>
                  </div>
                )}
                
                
                {transaction.note && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-2 rounded-r-lg mb-1.5">
                    <div className="flex items-start">
                      <div className="text-amber-600 dark:text-amber-400 mr-1.5 mt-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-xs text-amber-800 dark:text-amber-200">
                        {transaction.note}
                      </div>
                    </div>
                  </div>
                )}
                

              </div>
            </div>
            
            <div className="flex space-x-1">
              <button
                onClick={() => onEdit(transaction)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Редактировать"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(transaction.id)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Удалить"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
        ))
      )}
    </div>
  )
}
