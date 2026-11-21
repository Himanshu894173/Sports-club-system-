import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const UtilizationChart = ({ data = [] }) => {
  if (!data || !data.length) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-xs">No utilization data available</div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F161D] text-white p-2.5 rounded-xl text-xs border border-[#C3FF01]/40">
          <p className="font-semibold text-[#C3FF01]">Time Slot: {label}</p>
          <p className="font-bold mt-0.5">Court Utilization: {payload[0].value}%</p>
          <p className="text-[10px] text-gray-300">{payload[0].payload.bookings} of 5 courts active</p>
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
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#777F83' }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
            tick={{ fontSize: 11, fill: '#777F83' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="utilization" fill="#C3FF01" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default UtilizationChart;
