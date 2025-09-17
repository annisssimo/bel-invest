import { Transaction } from '@/types'

export const demoTransactions: Transaction[] = [
  {
    id: 'demo-1',
    broker: 'finstore',
    type: 'deposit',
    date: '2024-01-15T10:00:00',
    cash: {
      amount: 2000,
      currency: 'USD'
    },
    description: 'Account funding for investments'
  },
  
  {
    id: 'demo-2', 
    broker: 'finstore',
    type: 'buy',
    date: '2024-01-16T14:30:00',
    security: {
      symbol: 'BY_POLESYE_01',
      name: 'СОАО "ПП Полесье" 7.70%',
      type: 'bond',
      quantity: 6,
      price: 100,
      currency: 'USD'
    },
    fee: 5,
    description: 'Polesie bonds purchase'
  },

  {
    id: 'demo-3',
    broker: 'finstore', 
    type: 'buy',
    date: '2024-01-20T11:15:00',
    security: {
      symbol: 'BY_ZUBR_AUTO_01',
      name: 'ООО "ЗУБР АВТОГРУПП" 10.00%',
      type: 'bond',
      quantity: 5,
      price: 100,
      currency: 'USD'
    },
    fee: 4,
    description: 'Zubr Auto bonds purchase'
  },

  {
    id: 'demo-4',
    broker: 'finstore',
    type: 'coupon',
    date: '2024-02-15T09:00:00',
    cash: {
      amount: 23.10,
      currency: 'USD'
    },
    description: 'Polesie bonds coupon income (semi-annual)'
  },

  {
    id: 'demo-5',
    broker: 'finstore',
    type: 'coupon', 
    date: '2024-02-20T09:00:00',
    cash: {
      amount: 25.00,
      currency: 'USD'
    },
    description: 'Zubr Auto bonds coupon income (semi-annual)'
  }
]
