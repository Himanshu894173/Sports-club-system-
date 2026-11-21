/**
 * Format currency to Indian Rupee (INR)
 * @param {number} amount
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(amount));
};

/**
 * Format date string to readable format
 * @param {string|Date} date
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    const parsed = new Date(String(date).replace(' ', 'T'));
    if (!isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(parsed);
    }
    return String(date);
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(d);
};

/**
 * Format time string
 * Handles "HH:mm" strings (e.g. "06:00", "14:30"), ISO timestamps, and Date objects safely
 * @param {string|Date} time
 * @returns {string} Formatted time string
 */
export const formatTime = (time) => {
  if (!time) return 'N/A';

  // If time is already in "HH:mm" or "HH:mm:ss" format (e.g. "06:00", "14:30")
  if (typeof time === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(time.trim())) {
    const parts = time.trim().split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours < 10 ? `0${hours}` : hours;
    return `${strHours}:${minutes} ${ampm}`;
  }

  // Handle standard Date object or ISO string
  const d = new Date(time);
  if (isNaN(d.getTime())) {
    const parsed = new Date(String(time).replace(' ', 'T'));
    if (!isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(parsed);
    }
    return String(time);
  }

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d);
};

/**
 * Get status color badge CSS classes
 * @param {string} status
 * @returns {string} CSS classes
 */
export const getStatusBadgeClass = (status) => {
  const s = String(status || '').toLowerCase();
  switch (s) {
    case 'active':
    case 'confirmed':
    case 'settled':
    case 'approved':
    case 'completed':
    case 'paid':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
    case 'pending':
    case 'open':
    case 'in_progress':
    case 'preparing':
    case 'trial_scheduled':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
    case 'expired':
    case 'cancelled':
    case 'rejected':
    case 'failed':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
    case 'gold':
      return 'bg-gold-100 text-forest-950 font-bold border-gold-300 ring-gold-400/30';
    case 'silver':
      return 'bg-slate-100 text-slate-800 border-slate-300 ring-slate-400/20';
    case 'junior':
      return 'bg-blue-50 text-blue-800 border-blue-200 ring-blue-400/20';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 ring-gray-400/20';
  }
};
