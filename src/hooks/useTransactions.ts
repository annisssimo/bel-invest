'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Transaction, 
  TransactionFormData, 
  TransactionFilters,
  TransactionSortField,
  TransactionSortOrder 
} from '@/types';
import { demoTransactions } from '@/utils/demo-data';

// ===== CONSTANTS =====
const TRANSACTIONS_STORAGE_KEY = 'bel-invest-transactions';
const SORT_FUNCTIONS = {
  date: (a: Transaction, b: Transaction) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  },
  type: (a: Transaction, b: Transaction) => a.type.localeCompare(b.type),
  amount: (a: Transaction, b: Transaction) => {
    const amountA = a.cash?.amount || a.security?.quantity || 0;
    const amountB = b.cash?.amount || b.security?.quantity || 0;
    return amountB - amountA;
  },
} as const;

// ===== MAIN HOOK =====
export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== LOADING LOGIC =====
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setError(null);
        const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);

        if (stored) {
          const parsedTransactions = JSON.parse(stored);
          if (Array.isArray(parsedTransactions)) {
            setTransactions(sortTransactions(parsedTransactions));
          } else {
            throw new Error('Invalid stored data format');
          }
        } else {
          setTransactions(sortTransactions([...demoTransactions]));
        }
      } catch (err) {
        console.error('Error loading transactions:', err);
        setError('Failed to load transactions');
        setTransactions(sortTransactions([...demoTransactions]));
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // ===== PERSISTENCE =====
  useEffect(() => {
    if (!isLoading && transactions.length > 0) {
      try {
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
      } catch (err) {
        console.error('Error saving transactions:', err);
        setError('Failed to save transactions');
      }
    }
  }, [transactions, isLoading]);

  // ===== SORTING UTILITY =====
  const sortTransactions = useCallback((
    transactions: Transaction[],
    field: TransactionSortField = 'date',
    order: TransactionSortOrder = 'desc'
  ): Transaction[] => {
    const sorted = [...transactions].sort(SORT_FUNCTIONS[field]);
    return order === 'asc' ? sorted.reverse() : sorted;
  }, []);

  // ===== TRANSACTION OPERATIONS =====
  const addTransaction = useCallback((transactionData: TransactionFormData) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
    };
    
    setTransactions(prev => sortTransactions([...prev, newTransaction]));
  }, [sortTransactions]);

  const updateTransaction = useCallback((
    id: string,
    transactionData: TransactionFormData
  ) => {
    setTransactions(prev => 
      sortTransactions(prev.map(t => 
        t.id === id ? { ...transactionData, id } : t
      ))
    );
  }, [sortTransactions]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const deleteAllTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  // ===== QUERY METHODS =====
  const getTransactionsByType = useCallback((type: Transaction['type']) => {
    return transactions.filter(t => t.type === type);
  }, [transactions]);

  const getTransactionsBySecurity = useCallback((symbol: string) => {
    return transactions.filter(t => t.security?.symbol === symbol);
  }, [transactions]);

  const getTransactionsByBroker = useCallback((broker: Transaction['broker']) => {
    return transactions.filter(t => t.broker === broker);
  }, [transactions]);

  const getTransactionsByCurrency = useCallback((currency: string) => {
    return transactions.filter(t => 
      t.cash?.currency === currency || t.security?.currency === currency
    );
  }, [transactions]);

  const filterTransactions = useCallback((filters: TransactionFilters) => {
    return transactions.filter(transaction => {
      if (filters.type && transaction.type !== filters.type) return false;
      if (filters.broker && transaction.broker !== filters.broker) return false;
      if (filters.currency) {
        const transactionCurrency = transaction.cash?.currency || transaction.security?.currency;
        if (transactionCurrency !== filters.currency) return false;
      }
      if (filters.dateFrom) {
        const transactionDate = new Date(transaction.date);
        const fromDate = new Date(filters.dateFrom);
        if (transactionDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const transactionDate = new Date(transaction.date);
        const toDate = new Date(filters.dateTo);
        if (transactionDate > toDate) return false;
      }
      return true;
    });
  }, [transactions]);

  // ===== MEMOIZED VALUES =====
  const transactionStats = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalDeposits = transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + (t.cash?.amount || 0), 0);
    const totalWithdrawals = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + (t.cash?.amount || 0), 0);
    const totalFees = transactions
      .reduce((sum, t) => sum + (t.fee || 0), 0);

    return {
      totalTransactions,
      totalDeposits,
      totalWithdrawals,
      totalFees,
    };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  // ===== RETURN OBJECT =====
  return {
    // State
    transactions,
    isLoading,
    error,
    
    // Operations
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteAllTransactions,
    
    // Queries
    getTransactionsByType,
    getTransactionsBySecurity,
    getTransactionsByBroker,
    getTransactionsByCurrency,
    filterTransactions,
    
    // Utilities
    sortTransactions,
    
    // Computed values
    transactionStats,
    recentTransactions,
  };
};
