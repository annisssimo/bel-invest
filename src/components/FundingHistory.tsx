'use client'

import { FundingOperation } from '@/types'
import { Edit2, Trash2, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { formatCurrency } from '@/utils/currency';

interface FundingHistoryProps {
  operations: FundingOperation[]
  onEdit: (operation: FundingOperation) => void
  onDelete: (id: string) => void
}

export const FundingHistory = ({ operations, onEdit, onDelete }: FundingHistoryProps) => {
  if (operations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Нет операций пополнения или вывода</p>
        <p className="text-sm">Добавьте первую операцию пополнения счета</p>
      </div>
    )
  }

  const getTypeIcon = (type: FundingOperation['type']) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
      case 'withdrawal':
        return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
    }
  }

  const getTypeLabel = (type: FundingOperation['type']) => {
    switch (type) {
      case 'deposit':
        return 'Пополнение'
      case 'withdrawal':
        return 'Вывод'
    }
  }

  const getTypeColor = (type: FundingOperation['type']) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'withdrawal':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
    }
  }

  return (
    <div className="space-y-4">
      {operations.map((operation) => (
        <div
          key={operation.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {getTypeIcon(operation.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getTypeColor(operation.type)}`}>
                    {getTypeLabel(operation.type)}
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {operation.type === 'deposit' ? '+' : '-'}{formatCurrency(operation.amount, operation.currency)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(operation.date).toLocaleDateString('ru-RU', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                {operation.method && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <span className="font-medium">Способ:</span> {operation.method}
                  </div>
                )}
                
                {operation.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {operation.description}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-1">
              <button
                onClick={() => onEdit(operation)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Редактировать"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(operation.id)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Удалить"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
