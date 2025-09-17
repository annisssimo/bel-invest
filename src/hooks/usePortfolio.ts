import { useState, useEffect } from 'react';
import { Bond, Broker } from '@/types';

const STORAGE_KEY = 'bel-invest-portfolio';

export const usePortfolio = () => {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const loadedBonds = JSON.parse(saved || '[]');
        const updatedBonds = loadedBonds.map((bond: Partial<Bond>) => ({
          ...bond,
          currency: bond.currency || 'BYN',
          broker: bond.broker || 'finstore',
        }));
        setBonds(updatedBonds);
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bonds));
    }
  }, [bonds, isLoading]);

  const addBond = (bond: Omit<Bond, 'id'>) => {
    const newBond: Bond = {
      ...bond,
      id: Date.now().toString(),
    };
    setBonds((prev) => [...prev, newBond]);
  };

  const updateBond = (id: string, updates: Partial<Bond>) => {
    setBonds((prev) =>
      prev.map((bond) => (bond.id === id ? { ...bond, ...updates } : bond))
    );
  };

  const deleteBond = (id: string) => {
    setBonds((prev) => prev.filter((bond) => bond.id !== id));
  };

  const getBondsByBroker = (broker: Broker) => {
    return bonds.filter((bond) => bond.broker === broker);
  };

  return {
    bonds,
    addBond,
    updateBond,
    deleteBond,
    getBondsByBroker,
    isLoading,
  };
};
