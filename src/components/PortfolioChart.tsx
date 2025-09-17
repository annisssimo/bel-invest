'use client';

import { CalculatedSecurity } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/utils/calculations';

interface PortfolioChartProps {
  securities: CalculatedSecurity[];
}

const COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#EC4899',
  '#6366F1',
];

const RADIAN = Math.PI / 180;
interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: LabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={10}
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

export const PortfolioChart = ({ securities }: PortfolioChartProps) => {
  const issuerMap = new Map<
    string,
    { name: string; value: number; currency: string }
  >();

  securities.forEach((security) => {
    const issuer = security.name;
    if (!issuerMap.has(issuer)) {
      issuerMap.set(issuer, {
        name: issuer,
        value: 0,
        currency: security.currency,
      });
    }
    const issuerData = issuerMap.get(issuer)!;
    issuerData.value += security.currentValue;
  });

  const chartData = Array.from(issuerMap.values()).map((issuer) => ({
    name: issuer.name,
    value: issuer.value,
    currency: issuer.currency,
    percentage: 0,
  }));

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  chartData.forEach((item) => {
    (item as any).percentage = ((item.value / totalValue) * 100).toFixed(1);
  });

  chartData.sort((a, b) => {
    if (b.value !== a.value) {
      return b.value - a.value;
    }

    const getRate = (name: string) => {
      const match = name.match(/(\d+(?:\.\d+)?)\s*%/);
      return match ? parseFloat(match[1]) : 0;
    };

    const rateA = getRate(a.name);
    const rateB = getRate(b.name);
    return rateB - rateA;
  });

  const getTotalSummary = () => {
    const currencyTotals = { BYN: 0, USD: 0, EUR: 0, RUB: 0 };
    securities.forEach((security) => {
      currencyTotals[security.currency] += security.currentValue;
    });

    const parts = [];
    if (currencyTotals.BYN > 0)
      parts.push(formatCurrency(currencyTotals.BYN, 'BYN'));
    if (currencyTotals.USD > 0)
      parts.push(formatCurrency(currencyTotals.USD, 'USD'));
    if (currencyTotals.EUR > 0)
      parts.push(formatCurrency(currencyTotals.EUR, 'EUR'));
    if (currencyTotals.RUB > 0)
      parts.push(formatCurrency(currencyTotals.RUB, 'RUB'));

    return parts.join(' + ');
  };

  if (securities.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
        Добавьте активы для отображения диаграммы распределения
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Распределение портфеля
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Общая сумма: {getTotalSummary()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={180}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#374151"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const entry = chartData.find((item) => item.name === name);
                    const currency = entry?.currency || 'USD';
                    return [
                      formatCurrency(
                        value,
                        currency as 'BYN' | 'USD' | 'EUR' | 'RUB'
                      ),
                      'Сумма',
                    ];
                  }}
                  labelFormatter={(name: string) => `${name}`}
                  contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Эмитенты
          </h4>
          {chartData.map((entry, index) => (
            <div
              key={entry.name}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {entry.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                  {entry.percentage}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(
                    entry.value,
                    entry.currency as 'BYN' | 'USD' | 'EUR' | 'RUB'
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
