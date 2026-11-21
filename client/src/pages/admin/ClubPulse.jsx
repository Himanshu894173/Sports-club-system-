import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Calendar,
  Grid,
  ShoppingBag,
  Coffee,
  DollarSign,
  AlertTriangle,
  UserCheck,
  Briefcase,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import RevenueChart from '../../components/charts/RevenueChart';
import CategoryChart from '../../components/charts/CategoryChart';
import PaymentChart from '../../components/charts/PaymentChart';
import UtilizationChart from '../../components/charts/UtilizationChart';
import Loader from '../../components/common/Loader';

export const ClubPulse = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('this_month'); // today, this_week, this_month

  const fetchStats = (range) => {
    setLoading(true);
    financeService.getDashboardStats({ timeRange: range })
      .then((res) => setData(res))
      .catch((err) => console.error('Dashboard stats fetch failed:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats(timeRange);
  }, [timeRange]);

  if (loading && !data) {
    return <Loader message="Compiling ClubPulse real-time analytics..." />;
  }

  const overview = data?.overview || {};
  const charts = data?.charts || {};
  const recentTransactions = data?.recentTransactions || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-cream-300 shadow-premium">
        <div>
          <h2 className="font-serif font-bold text-xl text-forest-950">Executive Operations Pulse</h2>
          <p className="text-xs text-gray-500">Live consolidated metrics across courts, pro shop, and cafeteria</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cream-100 border border-cream-300">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === 'today'
                ? 'bg-forest-900 text-cream-50 font-bold shadow'
                : 'text-gray-600 hover:text-forest-950'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('this_week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === 'this_week'
                ? 'bg-forest-900 text-cream-50 font-bold shadow'
                : 'text-gray-600 hover:text-forest-950'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('this_month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === 'this_month'
                ? 'bg-forest-900 text-cream-50 font-bold shadow'
                : 'text-gray-600 hover:text-forest-950'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* 1. PRIMARY METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={overview.totalMembers || 0}
          subtitle={`${overview.activeMemberships || 0} Active • ${overview.expiredMemberships || 0} Expired`}
          icon={Users}
          color="gold"
        />
        <StatCard
          title="Today's Court Bookings"
          value={overview.todaysBookings || 0}
          subtitle={`${overview.availableCourts || 0} Courts Currently Open`}
          icon={Calendar}
          color="forest"
        />
        <StatCard
          title="Total Gross Revenue"
          value={formatCurrency(overview.totalRevenue || 0)}
          subtitle="Courts, Shop, Bar & Memberships"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Actionable Alerts"
          value={(overview.lowStockCount || 0) + (overview.pendingEnquiries || 0) + (overview.pendingLeaveRequests || 0)}
          subtitle={`${overview.lowStockCount || 0} Low Stock • ${overview.pendingEnquiries || 0} Leads • ${overview.pendingLeaveRequests || 0} Leaves`}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* 2. REVENUE STREAMS SUB-STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-premium flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pro Shop Sales</p>
            <h4 className="text-xl font-bold text-forest-950 mt-1">{formatCurrency(overview.shopRevenue || 0)}</h4>
            <p className="text-[11px] text-emerald-600 font-medium">Shared Counter & Online Inventory</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-premium flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Bar & Cafeteria</p>
            <h4 className="text-xl font-bold text-forest-950 mt-1">{formatCurrency(overview.barRevenue || 0)}</h4>
            <p className="text-[11px] text-emerald-600 font-medium">Open Tabs & POS Settlements</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
            <Coffee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-premium flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Court Booking Fees</p>
            <h4 className="text-xl font-bold text-forest-950 mt-1">{formatCurrency(overview.courtsRevenue || 0)}</h4>
            <p className="text-[11px] text-emerald-600 font-medium">Walk-ins & Discounted Silver Tiers</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Grid className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. CHARTS ROW: Revenue Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-forest-950">Daily Revenue & Expense Trajectory</h3>
              <p className="text-xs text-gray-500">7-Day trendline of income vs operations expenses</p>
            </div>
            <span className="text-xs font-bold text-gold-600">Live Feed</span>
          </div>
          <RevenueChart data={charts.dailyRevenue} />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
          <div className="mb-4">
            <h3 className="font-serif font-bold text-lg text-forest-950">Revenue Distribution</h3>
            <p className="text-xs text-gray-500">By operational department</p>
          </div>
          <CategoryChart data={charts.categoryRevenue} />
        </div>
      </div>

      {/* 4. CHARTS ROW: Payment Methods & Court Peak Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
          <div className="mb-4">
            <h3 className="font-serif font-bold text-lg text-forest-950">Payment Channels</h3>
            <p className="text-xs text-gray-500">Breakdown across UPI, Credit/Debit Card, Cash & Net Banking</p>
          </div>
          <PaymentChart data={charts.paymentMethods} />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
          <div className="mb-4">
            <h3 className="font-serif font-bold text-lg text-forest-950">Court Utilization Heatcurve</h3>
            <p className="text-xs text-gray-500">Peak hour occupancy rates across Plexicushion & Cricket nets</p>
          </div>
          <UtilizationChart data={charts.bookingUtilization} />
        </div>
      </div>

      {/* 5. RECENT CLUB TRANSACTIONS */}
      <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-premium">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-forest-950">Recent Real-time Ledger Transactions</h3>
            <p className="text-xs text-gray-500">Latest income receipts and verified expenditure entries</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {recentTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-cream-50">
                  <td className="p-3.5 font-mono font-bold text-forest-950">{txn.invoiceNumber}</td>
                  <td className="p-3.5">{formatDate(txn.date)}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cream-200 text-forest-900">
                      {txn.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-gray-800">{txn.description}</td>
                  <td className="p-3.5">{txn.paymentMethod}</td>
                  <td className={`p-3.5 text-right font-bold ${txn.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </td>
                  <td className="p-3.5 capitalize font-semibold">{txn.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ClubPulse;
