import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs tracking-wide',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base font-semibold',
  };

  const variantClasses = {
    primary: 'bg-forest-950 text-white hover:bg-forest-800 border border-forest-800 shadow-sm focus:ring-forest-700',
    gold: 'bg-gold-500 text-forest-950 font-bold hover:bg-gold-600 border border-gold-400 shadow-volt focus:ring-gold-500',
    outline: 'bg-transparent border border-forest-900 text-forest-900 hover:bg-forest-900 hover:text-white focus:ring-forest-800',
    outlineGold: 'bg-transparent border-2 border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-forest-950 focus:ring-gold-500 font-semibold',
    secondary: 'bg-cream-200 text-forest-950 hover:bg-cream-300 border border-cream-300 focus:ring-cream-400',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 border border-rose-700 focus:ring-rose-500',
    ghost: 'bg-transparent text-forest-900 hover:bg-forest-50 focus:ring-forest-200',
    volt: 'bg-secondary text-primary-dark font-bold hover:bg-secondary-hover shadow-volt border border-secondary',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
export default Button;
