import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

export const RevenueChart = ({ data = [] }) => {
  if (!data || !data.length) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-xs">No revenue data available</div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F161D] text-white p-3 rounded-xl shadow-xl border border-[#C3FF01]/40 text-xs">
          <p className="font-semibold text-[#C3FF01] mb-1">{label}</p>
          <p className="flex justify-between gap-4 text-gray-100">
            <span>Revenue:</span>
            <span className="font-bold">{formatCurrency(payload[0].value)}</span>
          </p>
          {payload[1] && (
            <p className="flex justify-between gap-4 text-rose-300">
              <span>Expenses:</span>
              <span className="font-bold">{formatCurrency(payload[1].value)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C3FF01" stopOpacity={0.45}/>
              <stop offset="95%" stopColor="#C3FF01" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D94343" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#D94343" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D0D8D8" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#777F83' }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            tick={{ fontSize: 11, fill: '#777F83' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#A8DF00"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorRev)"
          />
          {data[0]?.expenses !== undefined && (
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#D94343"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExp)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
export default RevenueChart;
