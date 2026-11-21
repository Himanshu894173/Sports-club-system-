import React from 'react';

export const StatCard = ({ title, value, icon: Icon, trend, subtitle, color = 'gold', onClick }) => {
  const colorStyles = {
    gold: {
      iconBg: 'bg-gold-100 text-gold-700',
      border: 'border-gold-200/60',
      highlight: 'hover:border-gold-400'
    },
    forest: {
      iconBg: 'bg-forest-50 text-forest-800',
      border: 'border-forest-200/60',
      highlight: 'hover:border-forest-400'
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-700',
      border: 'border-emerald-200/60',
      highlight: 'hover:border-emerald-400'
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-700',
      border: 'border-rose-200/60',
      highlight: 'hover:border-rose-400'
    },
    blue: {
      iconBg: 'bg-sky-50 text-sky-700',
      border: 'border-sky-200/60',
      highlight: 'hover:border-sky-400'
    }
  };

  const currentTheme = colorStyles[color] || colorStyles.gold;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border ${currentTheme.border} ${currentTheme.highlight} shadow-premium transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-premium-lg' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentTheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-serif font-bold text-forest-950 tracking-tight">{value}</h3>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
export default StatCard;
