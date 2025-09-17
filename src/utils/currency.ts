import { Currency } from '@/types';

// ===== EXCHANGE RATES =====
// In production, these should come from a real API
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.0,
  BYN: 0.31,
  EUR: 1.05,
  RUB: 0.011,
} as const;

// ===== CURRENCY CONVERSION UTILITIES =====
export const convertToUSD = (amount: number, currency: Currency): number => {
  return amount * EXCHANGE_RATES[currency];
};

export const convertFromUSD = (amount: number, toCurrency: Currency): number => {
  return amount / EXCHANGE_RATES[toCurrency];
};

export const convertCurrency = (
  amount: number,
  from: Currency,
  to: Currency
): number => {
  if (from === to) return amount;
  
  const usdAmount = convertToUSD(amount, from);
  return convertFromUSD(usdAmount, to);
};

export const getExchangeRate = (from: Currency, to: Currency): number => {
  if (from === to) return 1;
  return EXCHANGE_RATES[from] / EXCHANGE_RATES[to];
};

// ===== CURRENCY FORMATTING =====
export const formatCurrency = (
  amount: number,
  currency: Currency,
  locale: string = 'ru-BY'
): string => {
  const currencyCodes: Record<Currency, string> = {
    USD: 'USD',
    BYN: 'BYN',
    EUR: 'EUR',
    RUB: 'RUB',
  };

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCodes[currency],
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// ===== CURRENCY VALIDATION =====
export const isValidCurrency = (currency: string): currency is Currency => {
  return ['USD', 'BYN', 'EUR', 'RUB'].includes(currency);
};

// ===== CURRENCY ARITHMETIC =====
export const addCurrencies = (
  amounts: Array<{ amount: number; currency: Currency }>,
  targetCurrency: Currency
): number => {
  return amounts.reduce((sum, { amount, currency }) => {
    return sum + convertCurrency(amount, currency, targetCurrency);
  }, 0);
};

export const subtractCurrencies = (
  minuend: { amount: number; currency: Currency },
  subtrahend: { amount: number; currency: Currency },
  targetCurrency: Currency
): number => {
  const minuendAmount = convertCurrency(minuend.amount, minuend.currency, targetCurrency);
  const subtrahendAmount = convertCurrency(subtrahend.amount, subtrahend.currency, targetCurrency);
  return minuendAmount - subtrahendAmount;
};
