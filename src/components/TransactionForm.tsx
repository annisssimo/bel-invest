'use client';

import { useState, useEffect, useRef } from 'react';
import { Transaction } from '@/types';
import {
  X,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  ChevronDown,
  Info,
} from 'lucide-react';
import DatePicker from './DatePicker';

interface TransactionFormProps {
  transaction?: Transaction | null;
  onSubmit: (
    transaction: Omit<Transaction, 'id'>,
    continueAdding?: boolean
  ) => void;
  onCancel: () => void;
  transactions?: Transaction[];
}

const Tooltip = ({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl max-w-56 leading-relaxed z-[9999]">
          <div className="whitespace-normal break-words">{text}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Выберите...',
  openUpward = false,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; icon?: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  openUpward?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 flex items-center justify-between shadow-lg hover:shadow-xl hover:border-gray-300/70 dark:hover:border-gray-500/70 transition-all duration-200 h-10"
        >
          <span className="flex items-center">
            {selectedOption ? (
              selectedOption.label
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div
            className={`absolute z-50 w-full ${
              openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
            } bg-white/95 dark:bg-gray-700/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-2xl max-h-60 overflow-auto`}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center hover:bg-blue-50/80 dark:hover:bg-gray-600/80 focus:bg-blue-50/80 dark:focus:bg-gray-600/80 focus:outline-none text-gray-900 dark:text-white transition-all duration-200 hover:scale-[1.02]"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DateTimePicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const date = new Date(value);
  const [dateString, setDateString] = useState(
    `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${date.getFullYear()}`
  );
  const [timeString, setTimeString] = useState(
    `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
  );
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');

  // Обновляем локальное состояние при изменении value
  useEffect(() => {
    const date = new Date(value);
    setDateString(
      `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}.${date.getFullYear()}`
    );
    setTimeString(
      `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`
    );
  }, [value]);

  const validateDate = (dateStr: string): boolean => {
    // Проверяем формат дд.мм.гггг
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(dateStr)) {
      setDateError('Формат: дд.мм.гггг');
      return false;
    }

    const parts = dateStr.split('.');
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    // Проверяем диапазоны
    if (day < 1 || day > 31) {
      setDateError('День должен быть от 1 до 31');
      return false;
    }
    if (month < 1 || month > 12) {
      setDateError('Месяц должен быть от 1 до 12');
      return false;
    }
    if (year < 1900 || year > 2100) {
      setDateError('Год должен быть от 1900 до 2100');
      return false;
    }

    // Проверяем корректность даты
    const testDate = new Date(year, month - 1, day);
    if (
      testDate.getDate() !== day ||
      testDate.getMonth() !== month - 1 ||
      testDate.getFullYear() !== year
    ) {
      setDateError('Некорректная дата');
      return false;
    }

    setDateError('');
    return true;
  };

  const validateTime = (timeStr: string): boolean => {
    // Проверяем формат чч:мм
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(timeStr)) {
      setTimeError('Формат: чч:мм');
      return false;
    }

    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    if (hours < 0 || hours > 23) {
      setTimeError('Часы: 00-23');
      return false;
    }
    if (minutes < 0 || minutes > 59) {
      setTimeError('Минуты: 00-59');
      return false;
    }

    setTimeError('');
    return true;
  };

  const updateDateTime = (newDateString: string, newTimeString: string) => {
    const isDateValid = validateDate(newDateString);
    const isTimeValid = validateTime(newTimeString);

    if (isDateValid && isTimeValid) {
      const dateParts = newDateString.split('.');
      const timeParts = newTimeString.split(':');

      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1;
      const year = parseInt(dateParts[2]);
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);

      // Формируем строку в формате YYYY-MM-DDTHH:MM без конвертации в UTC
      const formattedDate = `${year}-${(month + 1)
        .toString()
        .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
      onChange(`${formattedDate}T${formattedTime}`);
    }
  };

  const formatDateInput = (value: string): string => {
    // Убираем все, кроме цифр
    const numbers = value.replace(/\D/g, '');

    // Форматируем как дд.мм.гггг
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return numbers.slice(0, 2) + '.' + numbers.slice(2);
    } else if (numbers.length <= 8) {
      return (
        numbers.slice(0, 2) + '.' + numbers.slice(2, 4) + '.' + numbers.slice(4)
      );
    } else {
      return (
        numbers.slice(0, 2) +
        '.' +
        numbers.slice(2, 4) +
        '.' +
        numbers.slice(4, 8)
      );
    }
  };

  const handleDateChange = (newDateString: string) => {
    const formatted = formatDateInput(newDateString);
    setDateString(formatted);
    updateDateTime(formatted, timeString);
  };

  const formatTimeInput = (value: string): string => {
    // Убираем все, кроме цифр
    const numbers = value.replace(/\D/g, '');

    // Форматируем как чч:мм
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return numbers.slice(0, 2) + ':' + numbers.slice(2);
    } else {
      return numbers.slice(0, 2) + ':' + numbers.slice(2, 4);
    }
  };

  const handleTimeChange = (newTimeString: string) => {
    const formatted = formatTimeInput(newTimeString);
    setTimeString(formatted);
    updateDateTime(dateString, formatted);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            value={dateString}
            onChange={(e) => handleDateChange(e.target.value)}
            className={`w-full px-3 py-2.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:border-transparent h-10 shadow-sm hover:shadow-md transition-all duration-200 ${
              dateError
                ? 'border-red-500/50 focus:ring-red-500/50 shadow-red-500/20'
                : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50 hover:border-gray-300/70 dark:hover:border-gray-500/70'
            }`}
            placeholder="дд.мм.гггг"
          />
          {dateError && (
            <p className="mt-1 text-xs text-red-500">{dateError}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            value={timeString}
            onChange={(e) => handleTimeChange(e.target.value)}
            className={`w-full px-3 py-2.5 text-center bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:border-transparent h-10 shadow-sm hover:shadow-md transition-all duration-200 ${
              timeError
                ? 'border-red-500/50 focus:ring-red-500/50 shadow-red-500/20'
                : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50 hover:border-gray-300/70 dark:hover:border-gray-500/70'
            }`}
            placeholder="чч:мм"
          />
          {timeError && (
            <p className="mt-1 text-xs text-red-500">{timeError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const TransactionForm = ({
  transaction,
  onSubmit,
  onCancel,
  transactions = [],
}: TransactionFormProps) => {
  const getInitialFormType = (): 'cash' | 'security' => {
    if (transaction) {
      const isCashOperation = ['deposit', 'debit', 'credit'].includes(
        transaction.type
      );
      return isCashOperation ? 'cash' : 'security';
    }
    return 'cash';
  };

  const [formType, setFormType] = useState<'cash' | 'security'>(
    getInitialFormType()
  );
  const [formData, setFormData] = useState({
    broker: 'finstore' as const,
    type: '' as Transaction['type'] | '',
    date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format in local time
    // Security fields
    symbol: '',
    name: '',
    companyName: '',
    securityType: 'bond' as 'bond' | 'stock' | 'etf',
    quantity: '',
    securityCurrency: 'USD' as 'BYN' | 'USD' | 'EUR' | 'RUB',
    nominalValue: '',
    couponRate: '',
    maturityDate: '',
    cashAmount: '',
    cashCurrency: 'BYN' as 'BYN' | 'USD' | 'EUR' | 'RUB',
    selectedSecurity: '', // symbol выбранной бумаги для купонного платежа
    note: '',
  });

  const [errors, setErrors] = useState({
    type: '',
    companyName: '',
    name: '',
    quantity: '',
    nominalValue: '',
    couponRate: '',
    maturityDate: '',
    cashAmount: '',
  });

  const [formattedValues, setFormattedValues] = useState({
    quantity: '',
    cashAmount: '',
    nominalValue: '',
    couponRate: '',
  });

  const validateNumber = (
    value: string,
    fieldName: string,
    min = 0
  ): string => {
    if (!value.trim()) {
      return 'Поле обязательно для заполнения';
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'Введите корректное число';
    }

    if (num <= min) {
      return `Значение должно быть больше ${min}`;
    }

    const maxValue = 999999999999999999;
    if (num > maxValue) {
      return 'Слишком большое число';
    }

    const decimalPlaces = (value.split('.')[1] || '').length;
    if (decimalPlaces > 8) {
      return 'Максимум 8 знаков после запятой';
    }

    return '';
  };

  const validateCompanyName = (value: string): string => {
    if (!value.trim()) {
      return 'Название компании обязательно';
    }
    if (value.trim().length < 2) {
      return 'Минимум 2 символа';
    }
    if (value.trim().length > 100) {
      return 'Максимум 100 символов';
    }
    return '';
  };

  const validateBondName = (value: string): string => {
    if (value.trim() && value.trim().length < 2) {
      return 'Минимум 2 символа';
    }
    if (value.trim().length > 100) {
      return 'Максимум 100 символов';
    }
    return '';
  };

  const validateQuantity = (value: string): string => {
    if (!value.trim()) {
      return 'Количество обязательно';
    }

    const num = parseFloat(value.replace(/,/g, ''));
    if (isNaN(num)) {
      return 'Введите корректное число';
    }

    if (num <= 0) {
      return 'Количество должно быть больше 0';
    }

    if (num > 1000000) {
      return 'Слишком большое количество';
    }

    if (formData.securityType === 'bond' && !Number.isInteger(num)) {
      return 'Количество облигаций должно быть целым числом';
    }

    return '';
  };

  const validateNominalValue = (value: string): string => {
    if (!value.trim()) {
      return 'Номинал обязателен';
    }

    const num = parseFloat(value.replace(/,/g, ''));
    if (isNaN(num)) {
      return 'Введите корректное число';
    }

    if (num <= 0) {
      return 'Номинал должен быть больше 0';
    }

    if (num > 100000) {
      return 'Слишком большой номинал';
    }

    return '';
  };

  const validateCouponRate = (value: string): string => {
    if (!value.trim()) {
      return 'Ставка обязательна';
    }

    const num = parseFloat(value.replace(/,/g, ''));
    if (isNaN(num)) {
      return 'Введите корректное число';
    }

    if (num < 0) {
      return 'Ставка не может быть отрицательной';
    }

    if (num > 100) {
      return 'Ставка не может превышать 100%';
    }

    return '';
  };

  const validateMaturityDate = (value: string): string => {
    if (!value.trim()) {
      return 'Дата погашения обязательна';
    }

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      return 'Дата погашения должна быть в будущем';
    }

    // Проверка на разумный период (не более 50 лет)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 50);

    if (selectedDate > maxDate) {
      return 'Дата погашения слишком далеко в будущем';
    }

    return '';
  };

  const validateCashAmount = (value: string): string => {
    if (!value.trim()) {
      return 'Сумма обязательна';
    }

    const num = parseFloat(value.replace(/,/g, ''));
    if (isNaN(num)) {
      return 'Введите корректное число';
    }

    if (num <= 0) {
      return 'Сумма должна быть больше 0';
    }

    if (num > 10000000) {
      return 'Слишком большая сумма';
    }

    const decimalPlaces = (value.split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return 'Максимум 2 знака после запятой';
    }

    return '';
  };

  const validateOperationType = (value: string): string => {
    if (!value.trim()) {
      return 'Выберите тип операции';
    }
    return '';
  };

  const updateError = (field: keyof typeof errors, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const formatNumberInput = (value: string): string => {
    const cleaned = value.replace(/[^\d.]/g, '');

    const parts = cleaned.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return decimalPart !== undefined
      ? `${integerPart}.${decimalPart}`
      : integerPart;
  };

  const parseFormattedNumber = (value: string): string => {
    return value.replace(/\s/g, '');
  };

  useEffect(() => {
    if (transaction) {
      const quantity = transaction.security?.quantity.toString() || '';
      const nominalValue =
        (
          transaction.security?.nominalValue || transaction.security?.price
        )?.toString() || '';
      const cashAmount = transaction.cash?.amount.toString() || '';

      let companyName = transaction.security?.companyName || '';
      let bondName = transaction.security?.name || '';

      if (!companyName && bondName) {
        const match = bondName.match(/^(.+?)\s+\d+\.\d+%$/);
        if (match) {
          companyName = match[1].replace(/^["']|["']$/g, '');
          bondName = '';
        }
      }

      setFormData({
        broker: transaction.broker as 'finstore',
        type: transaction.type,
        date: transaction.date.slice(0, 10), // Извлекаем только дату
        symbol: transaction.security?.symbol || '',
        name: bondName,
        companyName: companyName,
        securityType: transaction.security?.type || 'bond',
        quantity,
        nominalValue,
        securityCurrency: transaction.security?.currency || 'USD',
        couponRate: transaction.security?.couponRate?.toString() || '',
        maturityDate: transaction.security?.maturityDate || '',
        cashAmount,
        cashCurrency: transaction.cash?.currency || 'BYN', // По умолчанию BYN для кеша
        selectedSecurity: transaction.security?.symbol || '', // Для купонного платежа
        note: transaction.note || '',
      });

      setFormattedValues({
        quantity: quantity ? formatNumberInput(quantity) : '',
        nominalValue: nominalValue ? formatNumberInput(nominalValue) : '',
        cashAmount: cashAmount ? formatNumberInput(cashAmount) : '',
        couponRate: transaction.security?.couponRate
          ? formatNumberInput(transaction.security.couponRate.toString())
          : '',
      });
    } else {
      setFormData({
        broker: 'finstore',
        type: '',
        date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format in local time
        symbol: '',
        name: '',
        companyName: '',
        securityType: 'bond',
        quantity: '',
        securityCurrency: 'USD',
        nominalValue: '',
        couponRate: '',
        maturityDate: '',
        cashAmount: '',
        cashCurrency: 'BYN',
        selectedSecurity: '',
        note: '',
      });
      setFormattedValues({
        quantity: '',
        nominalValue: '',
        cashAmount: '',
        couponRate: '',
      });
      setFormType('cash');
    }
  }, [transaction]);

  // Block background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = (e: React.FormEvent, continueAdding = false) => {
    e.preventDefault();

    let hasErrors = false;

    const typeError = validateOperationType(formData.type);
    updateError('type', typeError);

    if (typeError) {
      hasErrors = true;
    }

    if (formData.type === 'coupon') {
      const cashAmountError = validateCashAmount(formattedValues.cashAmount);
      const securityError = formData.selectedSecurity ? '' : 'Выберите бумагу';

      updateError('cashAmount', cashAmountError);
      updateError('companyName', securityError);
      updateError('name', '');
      updateError('quantity', '');
      updateError('nominalValue', '');
      updateError('couponRate', '');
      updateError('maturityDate', '');

      if (cashAmountError || securityError) {
        hasErrors = true;
      }
    } else if (formType === 'security') {
      const companyNameError = validateCompanyName(formData.companyName);
      const bondNameError = validateBondName(formData.name);
      const quantityError = validateQuantity(formattedValues.quantity);
      const nominalValueError = validateNominalValue(
        formattedValues.nominalValue
      );
      const couponRateError = validateCouponRate(formattedValues.couponRate);
      const maturityDateError = validateMaturityDate(formData.maturityDate);

      updateError('companyName', companyNameError);
      updateError('name', bondNameError);
      updateError('quantity', quantityError);
      updateError('nominalValue', nominalValueError);
      updateError('couponRate', couponRateError);
      updateError('maturityDate', maturityDateError);
      updateError('cashAmount', '');

      if (
        companyNameError ||
        bondNameError ||
        quantityError ||
        nominalValueError ||
        couponRateError ||
        maturityDateError
      ) {
        hasErrors = true;
      }
    } else {
      const cashAmountError = validateCashAmount(formattedValues.cashAmount);

      updateError('cashAmount', cashAmountError);
      updateError('companyName', '');
      updateError('name', '');
      updateError('quantity', '');
      updateError('nominalValue', '');
      updateError('couponRate', '');
      updateError('maturityDate', '');

      if (cashAmountError) {
        hasErrors = true;
      }
    }

    if (hasErrors) {
      return;
    }

    const baseTransaction = {
      broker: formData.broker,
      type: formData.type as Transaction['type'],
      date: formData.date.includes('T')
        ? formData.date
        : `${formData.date}T12:00:00`,
      note: formData.note.trim() || undefined,
    };

    if (formData.type === 'coupon') {
      onSubmit(
        {
          ...baseTransaction,
          security: {
            symbol: formData.symbol,
            name: formData.name,
            companyName: formData.companyName || undefined,
            type: 'bond' as const,
            quantity: 0, // Для купонного платежа количество не важно
            price: 0,
            currency: formData.securityCurrency,
          },
          cash: {
            amount: parseFloat(formData.cashAmount),
            currency: formData.cashCurrency,
          },
        },
        continueAdding
      );
    } else if (formType === 'security') {
      onSubmit(
        {
          ...baseTransaction,
          security: {
            symbol: formData.symbol,
            name: formData.name,
            companyName: formData.companyName || undefined,
            type: formData.securityType,
            quantity: parseFloat(formData.quantity),
            price: formData.nominalValue
              ? parseFloat(formData.nominalValue)
              : 100, // Используем номинал как цену или 100 по умолчанию
            currency: formData.securityCurrency,
            // Дополнительные поля для облигаций
            nominalValue: formData.nominalValue
              ? parseFloat(formData.nominalValue)
              : undefined,
            couponRate: formData.couponRate
              ? parseFloat(formData.couponRate)
              : undefined,
            maturityDate: formData.maturityDate || undefined,
          },
        },
        continueAdding
      );
    } else {
      onSubmit(
        {
          ...baseTransaction,
          cash: {
            amount: parseFloat(formData.cashAmount),
            currency: formData.cashCurrency,
          },
        },
        continueAdding
      );
    }

    if (continueAdding) {
      setFormData({
        broker: 'finstore',
        type: '',
        date: new Date().toLocaleDateString('en-CA'),
        symbol: '',
        name: '',
        companyName: '',
        securityType: 'bond',
        quantity: '',
        securityCurrency: 'USD',
        nominalValue: '',
        couponRate: '',
        maturityDate: '',
        cashAmount: '',
        cashCurrency: 'BYN',
        selectedSecurity: '',
        note: '',
      });
      setErrors({
        type: '',
        companyName: '',
        name: '',
        quantity: '',
        nominalValue: '',
        couponRate: '',
        maturityDate: '',
        cashAmount: '',
      });
      setFormattedValues({
        quantity: '',
        cashAmount: '',
        nominalValue: '',
        couponRate: '',
      });
    }
  };

  const getOperationIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'buy':
        return <Plus className="w-4 h-4" />;
      case 'sell':
        return <Minus className="w-4 h-4" />;
      case 'deposit':
        return <TrendingUp className="w-4 h-4" />;
      case 'debit':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const securityOperations = [
    { value: 'buy', label: 'Покупка облигации' },
    { value: 'coupon', label: 'Купонный платеж' },
  ];

  const cashOperations = [
    { value: 'deposit', label: 'Пополнение счета' },
    { value: 'debit', label: 'Вывод средств' },
  ];

  const getPortfolioSecurities = () => {
    const securitiesMap = new Map<
      string,
      {
        symbol: string;
        name: string;
        companyName?: string;
        currency: 'BYN' | 'USD' | 'EUR' | 'RUB';
        quantity: number;
      }
    >();

    // Обрабатываем все транзакции для получения текущих активов
    transactions.forEach((t) => {
      if (t.type === 'buy' && t.security) {
        const { symbol, name, companyName, currency, quantity } = t.security;
        if (!securitiesMap.has(symbol)) {
          securitiesMap.set(symbol, {
            symbol,
            name,
            companyName,
            currency,
            quantity: 0,
          });
        }
        const security = securitiesMap.get(symbol)!;
        security.quantity += quantity;
      } else if (t.type === 'sell' && t.security) {
        const { symbol, quantity } = t.security;
        if (securitiesMap.has(symbol)) {
          const security = securitiesMap.get(symbol)!;
          security.quantity -= quantity;
        }
      }
    });

    // Возвращаем только активы с положительным количеством
    return Array.from(securitiesMap.values())
      .filter((sec) => sec.quantity > 0)
      .map((sec) => ({
        value: sec.symbol,
        label: `${sec.name} (${sec.quantity} шт.)`,
      }));
  };

  const currencies = [
    { value: 'USD', label: 'USD' },
    { value: 'BYN', label: 'BYN' },
    { value: 'EUR', label: 'EUR' },
    { value: 'RUB', label: 'RUB' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center pt-8 p-4 z-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-md max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
        <div className="px-6 pt-6 pb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              {transaction ? 'Редактировать транзакцию' : 'Добавить транзакцию'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={(e) => handleSubmit(e, false)}
            className="space-y-4 transition-all duration-200 ease-in-out"
          >
            <div className="mb-6">
              <div
                className={`flex bg-gray-100/80 dark:bg-gray-700/50 p-1 rounded-xl backdrop-blur-sm ${
                  transaction ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <button
                  type="button"
                  disabled={!!transaction}
                  onClick={() => {
                    if (!transaction) {
                      setFormType('cash');
                      setErrors({
                        type: '',
                        companyName: '',
                        name: '',
                        quantity: '',
                        nominalValue: '',
                        couponRate: '',
                        maturityDate: '',
                        cashAmount: '',
                      });
                      setFormattedValues({
                        quantity: '',
                        nominalValue: '',
                        cashAmount: '',
                        couponRate: '',
                      });
                    }
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    formType === 'cash'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
                  } ${transaction ? 'cursor-not-allowed' : ''}`}
                >
                  Денежные операции
                </button>
                <button
                  type="button"
                  disabled={!!transaction}
                  onClick={() => {
                    if (!transaction) {
                      setFormType('security');
                      setFormData({
                        ...formData,
                        type: '' as Transaction['type'] | '',
                      });
                      setErrors({
                        type: '',
                        companyName: '',
                        name: '',
                        quantity: '',
                        nominalValue: '',
                        couponRate: '',
                        maturityDate: '',
                        cashAmount: '',
                      });
                      setFormattedValues({
                        quantity: '',
                        nominalValue: '',
                        cashAmount: '',
                        couponRate: '',
                      });
                    }
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    formType === 'security'
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20 scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
                  } ${transaction ? 'cursor-not-allowed' : ''}`}
                >
                  Операции с активами
                </button>
              </div>
            </div>

            <div>
              <CustomDropdown
                label="Тип операции"
                value={formData.type}
                options={
                  formType === 'security' ? securityOperations : cashOperations
                }
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    type: value as Transaction['type'] | '',
                  });
                  updateError('type', validateOperationType(value));
                }}
                placeholder="Выберите тип операции"
              />
              {errors.type && (
                <p className="mt-1 text-xs text-red-500">{errors.type}</p>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Дата операции
                </label>
                <Tooltip text="Дата совершения операции">
                  <Info
                    size={12}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  />
                </Tooltip>
              </div>
              <DatePicker
                value={formData.date}
                onChange={(value) => {
                  setFormData({ ...formData, date: value || '' });
                }}
                placeholder="Выберите дату операции"
              />
            </div>

            {formData.type === 'coupon' ? (
              // Специальная форма для купонного платежа
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Выберите бумагу
                  </label>
                  <CustomDropdown
                    label=""
                    value={formData.selectedSecurity}
                    options={getPortfolioSecurities()}
                    onChange={(value) => {
                      setFormData({ ...formData, selectedSecurity: value });
                      const selectedSec = getPortfolioSecurities().find(
                        (sec) => sec.value === value
                      );
                      if (selectedSec) {
                        const secTransaction = transactions.find(
                          (t) =>
                            t.type === 'buy' && t.security?.symbol === value
                        );
                        if (secTransaction?.security) {
                          setFormData((prev) => ({
                            ...prev,
                            symbol: secTransaction.security!.symbol,
                            name: secTransaction.security!.name,
                            companyName:
                              secTransaction.security!.companyName || '',
                            securityCurrency: secTransaction.security!.currency,
                          }));
                        }
                      }
                    }}
                    placeholder="Выберите бумагу из портфеля"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Сумма купона
                    </label>
                    <input
                      type="text"
                      step="0.01"
                      value={formattedValues.cashAmount}
                      onChange={(e) => {
                        const formatted = formatNumberInput(e.target.value);
                        const parsed = parseFormattedNumber(formatted);
                        setFormattedValues({
                          ...formattedValues,
                          cashAmount: formatted,
                        });
                        setFormData({ ...formData, cashAmount: parsed });
                        updateError(
                          'cashAmount',
                          validateCashAmount(formatted)
                        );
                      }}
                      className={`w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:border-transparent h-10 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
                        errors.cashAmount
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="50.00"
                      required
                    />
                    {errors.cashAmount && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.cashAmount}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Валюта
                    </label>
                    <CustomDropdown
                      label=""
                      value={formData.cashCurrency}
                      options={currencies}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          cashCurrency: value as 'BYN' | 'USD' | 'EUR' | 'RUB',
                        })
                      }
                      placeholder="USD"
                      openUpward={true}
                    />
                  </div>
                </div>
              </>
            ) : formType === 'security' ? (
              <>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Название компании
                    </label>
                    <Tooltip text="Название компании-эмитента">
                      <Info
                        size={12}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => {
                      setFormData({ ...formData, companyName: e.target.value });
                      updateError(
                        'companyName',
                        validateCompanyName(e.target.value)
                      );
                    }}
                    className={`w-full px-3 py-2.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:border-transparent h-10 shadow-sm hover:shadow-md transition-all duration-200 ${
                      errors.companyName
                        ? 'border-red-500/50 focus:ring-red-500/50 shadow-red-500/20'
                        : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50 hover:border-gray-300/70 dark:hover:border-gray-500/70'
                    }`}
                    placeholder="СОАО ПП Полесье"
                    required
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Название облигации
                    </label>
                    <Tooltip text="Полное название облигации">
                      <Info
                        size={14}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormData({
                        ...formData,
                        name: newName,
                        symbol: newName.replace(/\s+/g, '_').toUpperCase(),
                      });
                      updateError('name', validateBondName(newName));
                    }}
                    className="w-full px-3 py-2.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent h-10 shadow-sm hover:shadow-md hover:border-gray-300/70 dark:hover:border-gray-500/70 transition-all duration-200"
                    placeholder="Облигация серии А"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Количество
                      </label>
                      <Tooltip text="Количество облигаций (например: 6)">
                        <Info
                          size={14}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        />
                      </Tooltip>
                    </div>
                    <input
                      type="text"
                      step="1"
                      value={formattedValues.quantity}
                      onChange={(e) => {
                        const formatted = formatNumberInput(e.target.value);
                        const parsed = parseFormattedNumber(formatted);
                        setFormattedValues({
                          ...formattedValues,
                          quantity: formatted,
                        });
                        setFormData({ ...formData, quantity: parsed });
                        updateError('quantity', validateQuantity(formatted));
                      }}
                      className={`w-full px-3 py-2.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:border-transparent h-10 shadow-sm hover:shadow-md transition-all duration-200 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
                        errors.quantity
                          ? 'border-red-500/50 focus:ring-red-500/50 shadow-red-500/20'
                          : 'border-gray-200/50 dark:border-gray-600/50 focus:ring-blue-500/50 hover:border-gray-300/70 dark:hover:border-gray-500/70'
                      }`}
                      placeholder="6"
                      required
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.quantity}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Валюта
                      </label>
                      <Tooltip text="Валюта облигации">
                        <Info
                          size={14}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        />
                      </Tooltip>
                    </div>
                    <CustomDropdown
                      label=""
                      value={formData.securityCurrency}
                      options={currencies}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          securityCurrency: value as
                            | 'BYN'
                            | 'USD'
                            | 'EUR'
                            | 'RUB',
                        })
                      }
                      placeholder="USD"
                      openUpward={true}
                    />
                  </div>
                </div>

                {/* Дополнительные поля для облигаций */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Годовая ставка (%)
                      </label>
                      <Tooltip text="Годовая купонная ставка в процентах (например: 7.70)">
                        <Info
                          size={14}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        />
                      </Tooltip>
                    </div>
                    <input
                      type="text"
                      value={formattedValues.couponRate}
                      onChange={(e) => {
                        const formatted = formatNumberInput(e.target.value);
                        setFormattedValues({
                          ...formattedValues,
                          couponRate: formatted,
                        });
                        setFormData({ ...formData, couponRate: formatted });
                        updateError(
                          'couponRate',
                          validateCouponRate(formatted)
                        );
                      }}
                      className="w-full px-3 py-2.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent h-10 shadow-sm hover:shadow-md hover:border-gray-300/70 dark:hover:border-gray-500/70 transition-all duration-200"
                      placeholder="7.70"
                    />
                    {errors.couponRate && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.couponRate}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Номинал
                      </label>
                      <Tooltip text="Номинальная стоимость облигации (например: 300)">
                        <Info
                          size={14}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        />
                      </Tooltip>
                    </div>
                    <input
                      type="text"
                      value={formattedValues.nominalValue}
                      onChange={(e) => {
                        const formatted = formatNumberInput(e.target.value);
                        const parsed = parseFormattedNumber(formatted);
                        setFormattedValues({
                          ...formattedValues,
                          nominalValue: formatted,
                        });
                        setFormData({ ...formData, nominalValue: formatted });
                        updateError(
                          'nominalValue',
                          validateNominalValue(formatted)
                        );
                      }}
                      className="w-full px-3 py-2.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent h-10 shadow-sm hover:shadow-md hover:border-gray-300/70 dark:hover:border-gray-500/70 transition-all duration-200"
                      placeholder="300"
                    />
                    {errors.nominalValue && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.nominalValue}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Дата погашения
                    </label>
                    <Tooltip text="Дата погашения облигации">
                      <Info
                        size={14}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      />
                    </Tooltip>
                  </div>
                  <DatePicker
                    value={formData.maturityDate}
                    onChange={(value) => {
                      setFormData({ ...formData, maturityDate: value });
                      updateError('maturityDate', validateMaturityDate(value));
                    }}
                    placeholder="Выберите дату погашения"
                    error={!!errors.maturityDate}
                  />
                  {errors.maturityDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.maturityDate}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Сумма
                      </label>
                    </div>
                    <input
                      type="text"
                      step="0.01"
                      value={formattedValues.cashAmount}
                      onChange={(e) => {
                        const formatted = formatNumberInput(e.target.value);
                        const parsed = parseFormattedNumber(formatted);
                        setFormattedValues({
                          ...formattedValues,
                          cashAmount: formatted,
                        });
                        setFormData({ ...formData, cashAmount: parsed });
                        updateError(
                          'cashAmount',
                          validateCashAmount(formatted)
                        );
                      }}
                      className={`w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:border-transparent h-10 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
                        errors.cashAmount
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="1000.00"
                      required
                    />
                    {errors.cashAmount && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.cashAmount}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Валюта
                      </label>
                      <Tooltip text="Валюта операции">
                        <Info
                          size={14}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        />
                      </Tooltip>
                    </div>
                    <CustomDropdown
                      label=""
                      value={formData.cashCurrency}
                      options={currencies}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          cashCurrency: value as 'BYN' | 'USD' | 'EUR' | 'RUB',
                        })
                      }
                      placeholder="BYN"
                      openUpward={true}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Поле примечания */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Примечание
                </label>
                <span className="text-xs text-gray-400">(необязательно)</span>
                <Tooltip text="Дополнительная информация о транзакции">
                  <Info
                    size={14}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  />
                </Tooltip>
              </div>
              <textarea
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none shadow-sm hover:shadow-md hover:border-gray-300/70 dark:hover:border-gray-500/70 transition-all duration-200"
                placeholder="Дополнительная информация..."
                rows={2}
                maxLength={500}
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {formData.note.length}/500
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-600/50">
              {!transaction && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium py-2.5 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
                >
                  Сохранить и добавить ещё
                </button>
              )}
              <button
                type="submit"
                onClick={(e) => handleSubmit(e, false)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium py-2.5 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
              >
                {transaction ? 'Обновить' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
