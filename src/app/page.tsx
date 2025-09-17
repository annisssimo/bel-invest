'use client'

import { useState } from 'react'
import { Transaction } from '@/types'
import { useTransactions } from '@/hooks/useTransactions'
import { useCalculatedPortfolio } from '@/hooks/useCalculatedPortfolio'
import { ModernPortfolioTable } from '@/components/ModernPortfolioTable'
import { TransactionHistory } from '@/components/TransactionHistory'
import { TransactionForm } from '@/components/TransactionForm'
import { PortfolioHeader } from '@/components/PortfolioHeader'
import { PortfolioChart } from '@/components/PortfolioChart'
import { ConfirmModal } from '@/components/ConfirmModal'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'


import { Plus, PieChart, BarChart3, Activity } from 'lucide-react'

export default function Home() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, isLoading } = useTransactions()
  const calculatedPortfolio = useCalculatedPortfolio(transactions)
  
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [activeView, setActiveView] = useState<'portfolio' | 'chart' | 'transactions'>('portfolio')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null)

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>, continueAdding?: boolean) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData)
      setEditingTransaction(null)
    } else {
      addTransaction(transactionData)
    }
    
    // Close form only if not continuing to add more transactions
    if (!continueAdding) {
      setShowTransactionForm(false)
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowTransactionForm(true)
  }

  const handleDeleteTransaction = (id: string) => {
    setDeletingTransactionId(id)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    if (deletingTransactionId) {
      deleteTransaction(deletingTransactionId)
      setDeletingTransactionId(null)
    }
    setShowDeleteConfirm(false)
  }

  const handleDeleteCancel = () => {
    setDeletingTransactionId(null)
    setShowDeleteConfirm(false)
  }

  const handleCancelTransactionForm = () => {
    setShowTransactionForm(false)
    setEditingTransaction(null)
  }




  const activeTransactions = transactions

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-6">
          {/* Minimalist logo */}
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-xl flex items-center justify-center relative overflow-hidden animate-pulse">
            {/* Minimalist logo - white treasure chest */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {/* Chest base - white */}
              <rect x="3" y="10" width="18" height="10" rx="2" fill="white"/>
              
              {/* Chest lid - white */}
              <path d="M3 10 C3 6, 7 4, 12 4 C17 4, 21 6, 21 10" stroke="white" strokeWidth="2" fill="none"/>
              
              {/* Lock - white */}
              <circle cx="12" cy="15" r="1.8" fill="white"/>
            </svg>
          </div>

          {/* Simple spinner */}
          <div className="relative">
            <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-purple-600/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-400/10 to-blue-600/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 animate-pulse"></div>
      </div>
      
      <div className="relative container mx-auto px-4 pt-6 pb-8">
      {/* Navigation and settings */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              {/* Minimalist logo - white treasure chest */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="group-hover:scale-110 transition-transform duration-300">
                {/* Chest base - white */}
                <rect x="3" y="10" width="18" height="10" rx="2" fill="white"/>
                
                {/* Chest lid - white */}
                <path d="M3 10 C3 6, 7 4, 12 4 C17 4, 21 6, 21 10" stroke="white" strokeWidth="2" fill="none"/>
                
                {/* Lock - white */}
                <circle cx="12" cy="15" r="1.8" fill="white"/>
              </svg>
              
              {/* Animated particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-200 rounded-full animate-ping" style={{animationDelay: '0ms'}}></div>
                <div className="absolute top-3 right-3 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{animationDelay: '200ms'}}></div>
                <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-amber-200 rounded-full animate-ping" style={{animationDelay: '400ms'}}></div>
              </div>
              
              {/* Decorative highlight */}
              <div className="absolute top-1 right-1 w-2 h-2 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors duration-300"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Skarbnica
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Add button */}
          <button
            onClick={() => setShowTransactionForm(true)}
            className="group flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Добавить</span>
          </button>
          
          <ThemeSwitcher />
        </div>
      </div>

      {/* Portfolio header */}
      <PortfolioHeader portfolio={calculatedPortfolio} transactions={transactions} />

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-4">
        {(
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                {/* Modern tabs */}
                <div className="flex bg-gray-100/80 dark:bg-gray-700/50 p-1 rounded-xl backdrop-blur-sm">
                  <button
                    onClick={() => setActiveView('portfolio')}
                    className={`relative px-4 py-2.5 flex items-center space-x-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      activeView === 'portfolio'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 scale-105'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
                    }`}
                  >
                    <BarChart3 size={16} />
                    <span>Активы</span>
                  </button>
                  <button
                    onClick={() => setActiveView('chart')}
                    className={`relative px-4 py-2.5 flex items-center space-x-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      activeView === 'chart'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 scale-105'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
                    }`}
                  >
                    <PieChart size={16} />
                    <span>Диаграмма</span>
                  </button>
                  <button
                    onClick={() => setActiveView('transactions')}
                    className={`relative px-4 py-2.5 flex items-center space-x-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      activeView === 'transactions'
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20 scale-105'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
                    }`}
                  >
                    <Activity size={16} />
                    <span>Транзакции</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  {activeView === 'transactions' ? 'История транзакций' : 
                   activeView === 'chart' ? 'Распределение портфеля' : 'Портфель'}
                </h2>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className="transition-all duration-500 ease-in-out">
            {activeView === 'portfolio' ? (
              <div className="animate-in fade-in duration-500">
                <ModernPortfolioTable
                  securities={calculatedPortfolio.securities}
                  balances={calculatedPortfolio.balances}
                />
              </div>
            ) : activeView === 'chart' ? (
              <div className="animate-in fade-in duration-500">
                <PortfolioChart securities={calculatedPortfolio.securities} />
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <TransactionHistory
                  transactions={activeTransactions}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showTransactionForm && (
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleAddTransaction}
          onCancel={handleCancelTransactionForm}
          transactions={transactions}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Удалить транзакцию?"
        message="Это действие нельзя отменить. Удаление транзакции повлияет на расчет портфеля и может изменить ваши показатели доходности."
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="danger"
      />
      </div>
      
      <Footer />
      <ScrollToTop />
    </div>
  )
}
