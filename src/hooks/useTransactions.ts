'use client'

import { useState, useEffect } from 'react'
import { Transaction } from '@/types'
import { demoTransactions } from '@/utils/demo-data'

const TRANSACTIONS_STORAGE_KEY = 'bel-invest-transactions'

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        // Пытаемся загрузить из localStorage
        const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY)
        
        if (stored) {
          const parsedTransactions = JSON.parse(stored)
          const sortedTransactions = [...parsedTransactions].sort((a, b) => {
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()
            
            // Сначала сортируем по дате (новые сверху)
            if (dateB !== dateA) {
              return dateB - dateA
            }
            
            // При одинаковой дате сортируем по ID (новые сверху)
            return b.id.localeCompare(a.id)
          })
          setTransactions(sortedTransactions)
        } else {
          // Если localStorage пуст, загружаем демо-данные
          const sortedDemoTransactions = [...demoTransactions].sort((a, b) => {
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()
            
            // Сначала сортируем по дате (новые сверху)
            if (dateB !== dateA) {
              return dateB - dateA
            }
            
            // При одинаковой дате сортируем по ID (новые сверху)
            return b.id.localeCompare(a.id)
          })
          setTransactions(sortedDemoTransactions)
        }
        
      } catch (error) {
        // Fallback - загружаем демо-данные даже при ошибке
        setTransactions([...demoTransactions])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTransactions()
  }, [])

  // Save to localStorage whenever transactions change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions))
    }
  }, [transactions, isLoading])

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID()
    }
    setTransactions(prev => [...prev, newTransaction].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      
      // Сначала сортируем по дате (новые сверху)
      if (dateB !== dateA) {
        return dateB - dateA
      }
      
      // При одинаковой дате сортируем по ID (новые сверху)
      // Новые ID будут больше по алфавиту (UUID v4)
      return b.id.localeCompare(a.id)
    }))
  }

  const updateTransaction = (id: string, transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...transaction, id } : t)
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          
          // Сначала сортируем по дате (новые сверху)
          if (dateB !== dateA) {
            return dateB - dateA
          }
          
          // При одинаковой дате сортируем по ID (новые сверху)
          return b.id.localeCompare(a.id)
        })
    )
  }

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const deleteAllTransactions = () => {
    setTransactions([])
  }


  const getTransactionsByType = (type: Transaction['type']) => {
    return transactions.filter(t => t.type === type)
  }

  const getTransactionsBySecurity = (symbol: string) => {
    return transactions.filter(t => t.security?.symbol === symbol)
  }

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteAllTransactions,
    getTransactionsByType,
    getTransactionsBySecurity,
    isLoading
  }
}
