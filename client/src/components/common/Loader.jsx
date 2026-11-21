import React from 'react';

export const Loader = ({ message = 'Loading KHELORA data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-16 h-16">
        <div className="w-16 h-16 rounded-full border-4 border-gold-200 border-t-gold-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center font-serif text-forest-900 font-bold text-xs">
          KH
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-forest-900/80 tracking-wide">{message}</p>
    </div>
  );
};
export default Loader;
