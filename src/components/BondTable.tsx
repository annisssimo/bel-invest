'use client'

import { Bond } from '@/types'
import { calculateYearlyIncome, calculateMonthlyIncome, calculateDaysToMaturity, formatCurrency, formatPercentage } from '@/utils/calculations'
import { Trash2, Edit } from 'lucide-react'

interface BondTableProps {
  bonds: Bond[]
  onEdit: (bond: Bond) => void
  onDelete: (id: string) => void
}

export const BondTable = ({ bonds, onEdit, onDelete }: BondTableProps) => {
  if (bonds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Нет добавленных облигаций. Добавьте первую инвестицию.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Брокер
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Эмитент
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Сумма
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Валюта
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Ставка
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Дата покупки
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Дата погашения
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Годовой доход
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Месячный доход
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Дней до погашения
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {bonds.map((bond) => (
            <tr key={bond.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  bond.broker === 'finstore' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {bond.broker === 'finstore' ? 'FINSTORE' : 'Freedom'}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {bond.issuer}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {formatCurrency(bond.amount, bond.currency)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  bond.currency === 'USD' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {bond.currency}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {formatPercentage(bond.couponRate)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {new Date(bond.purchaseDate).toLocaleDateString('ru-RU')}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {new Date(bond.maturityDate).toLocaleDateString('ru-RU')}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {formatCurrency(calculateYearlyIncome(bond), bond.currency)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {formatCurrency(calculateMonthlyIncome(bond), bond.currency)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {calculateDaysToMaturity(bond.maturityDate)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(bond)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(bond.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
