import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const BAR_COLORS = ['#1E4252', '#C3FF01', '#193847', '#27864A'];

export const PaymentChart = ({ data = [] }) => {
  if (!data || !data.length) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-xs">No payment data available</div>;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#0F161D] text-white p-2.5 rounded-xl text-xs border border-[#C3FF01]/40">
          <p className="font-semibold text-[#C3FF01]">{item.method}</p>
          <p className="font-bold">{formatCurrency(item.amount)} ({item.percentage}%)</p>
          <p className="text-[10px] text-gray-300">{item.count} Transactions</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D0D8D8" />
          <XAxis dataKey="method" tick={{ fontSize: 11, fill: '#777F83' }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            tick={{ fontSize: 11, fill: '#777F83' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default PaymentChart;
