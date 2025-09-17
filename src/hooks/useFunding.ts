'use client'

import { useState, useEffect } from 'react'
import { FundingOperation, Broker } from '@/types'

const FUNDING_STORAGE_KEY = 'bel-invest-funding'

export const useFunding = () => {
  const [fundingOperations, setFundingOperations] = useState<FundingOperation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FUNDING_STORAGE_KEY)
      if (saved) {
        const loadedOperations = JSON.parse(saved)
        setFundingOperations(loadedOperations)
      }
    } catch (error) {
      console.error('Error loading funding operations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save to localStorage whenever funding operations change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(FUNDING_STORAGE_KEY, JSON.stringify(fundingOperations))
    }
  }, [fundingOperations, isLoading])

  const addFundingOperation = (operation: Omit<FundingOperation, 'id'>) => {
    const newOperation: FundingOperation = {
      ...operation,
      id: crypto.randomUUID()
    }
    setFundingOperations(prev => [newOperation, ...prev])
  }

  const updateFundingOperation = (id: string, operation: Omit<FundingOperation, 'id'>) => {
    setFundingOperations(prev => 
      prev.map(op => op.id === id ? { ...operation, id } : op)
    )
  }

  const deleteFundingOperation = (id: string) => {
    setFundingOperations(prev => prev.filter(op => op.id !== id))
  }

  const getFundingByBroker = (broker: Broker) => {
    return fundingOperations.filter(op => op.broker === broker)
  }

  const getFundingByType = (type: FundingOperation['type']) => {
    return fundingOperations.filter(op => op.type === type)
  }

  const getTotalByBroker = (broker: Broker) => {
    const operations = getFundingByBroker(broker)
    const deposits = operations.filter(op => op.type === 'deposit').reduce((sum, op) => sum + op.amount, 0)
    const withdrawals = operations.filter(op => op.type === 'withdrawal').reduce((sum, op) => sum + op.amount, 0)
    return { deposits, withdrawals, net: deposits - withdrawals }
  }

  return {
    fundingOperations,
    addFundingOperation,
    updateFundingOperation,
    deleteFundingOperation,
    getFundingByBroker,
    getFundingByType,
    getTotalByBroker,
    isLoading
  }
}
