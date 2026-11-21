import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, Clock, Calendar as CalendarIcon } from 'lucide-react';

export const Header = ({ title, subtitle, onMobileMenuToggle }) => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="bg-white border-b border-cream-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-4">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-cream-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-serif font-bold text-forest-950 tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-forest-900 bg-cream-100 px-3 py-1.5 rounded-lg border border-cream-300">
          <CalendarIcon className="w-3.5 h-3.5 text-gold-600" />
          <span>{today}</span>
        </div>

        {/* Live Facility Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Courts & Bar Operational
        </div>
      </div>
    </header>
  );
};
export default Header;
