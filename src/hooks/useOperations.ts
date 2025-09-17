'use client'

import { useState, useEffect } from 'react'
import { Operation, Broker } from '@/types'

const OPERATIONS_STORAGE_KEY = 'bel-invest-operations'

export const useOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(OPERATIONS_STORAGE_KEY)
      if (saved) {
        setOperations(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading operations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save to localStorage when operations change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(OPERATIONS_STORAGE_KEY, JSON.stringify(operations))
    }
  }, [operations, isLoading])

  const addOperation = (operation: Omit<Operation, 'id'>) => {
    const newOperation: Operation = {
      ...operation,
      id: Date.now().toString()
    }
    setOperations(prev => [...prev, newOperation].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ))
  }

  const updateOperation = (id: string, updates: Partial<Operation>) => {
    setOperations(prev => prev.map(op => 
      op.id === id ? { ...op, ...updates } : op
    ).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ))
  }

  const deleteOperation = (id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id))
  }

  const getOperationsByBond = (bondId: string) => {
    return operations.filter(op => op.bondId === bondId)
  }

  const getOperationsByType = (type: Operation['type']) => {
    return operations.filter(op => op.type === type)
  }

  const getOperationsByBroker = (broker: Broker) => {
    return operations.filter(op => op.broker === broker)
  }

  return {
    operations,
    addOperation,
    updateOperation,
    deleteOperation,
    getOperationsByBond,
    getOperationsByType,
    getOperationsByBroker,
    isLoading
  }
}
