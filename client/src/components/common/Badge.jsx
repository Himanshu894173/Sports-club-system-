import React from 'react';
import { getStatusBadge, getPlanBadge } from '../../utils/formatters';

export const Badge = ({ children, variant = 'status', className = '' }) => {
  const badgeClass = variant === 'plan' ? getPlanBadge(children) : getStatusBadge(children);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass} ${className}`}>
      {children}
    </span>
  );
};
export default Badge;
