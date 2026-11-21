import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import {
  Calendar,
  ShoppingBag,
  Award,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export const MemberDashboard = () => {
  const { user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingService.getMyBookings().catch(() => []),
      orderService.getMyOrders().catch(() => [])
    ]).then(([bookings, orders]) => {
      const today = new Date().toISOString().split('T')[0];
      const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelled').slice(0, 3);
      setUpcomingBookings(upcoming);
      setRecentOrders(orders.slice(0, 3));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Loader message="Accessing your member account..." />;
  }

  return (
    <div className="space-y-8">
      {/* 1. Digital Membership Pass & Quick Stat Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Digital Membership Pass Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 text-cream-50 p-6 rounded-3xl border-2 border-gold-500/60 shadow-premium-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-gold-500/10 rounded-full blur-2xl"></div>

          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#193847] border border-[#C3FF01]/50 p-1 flex items-center justify-center">
                  <img src="/logo.svg" alt="KHELORA" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-serif font-black text-sm tracking-wider text-cream-50">KHELORA</h4>
                  <p className="text-[9px] uppercase tracking-widest text-[#C3FF01] font-semibold">Official Member Pass</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-500 text-forest-950 shadow">
                {user?.plan || 'Gold'} Tier
              </span>
            </div>

            <div className="space-y-1 mb-6">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Cardholder Name</p>
              <h3 className="text-xl font-serif font-bold text-cream-50">{user?.name}</h3>
              <p className="font-mono text-xs text-gold-400">{user?.memberId || 'MEM-2026-001'}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-forest-800/80 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-gray-400">Status</p>
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active & Verified
              </p>
            </div>
            <div className="w-10 h-10 bg-white/10 p-1.5 rounded-lg border border-gold-500/30 flex items-center justify-center">
              <QrCode className="w-full h-full text-gold-400" />
            </div>
          </div>
        </div>

        {/* Quick Privilege Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-premium flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-900 flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-forest-800" />
              </div>
              <h4 className="font-serif font-bold text-base text-forest-950">Complimentary Court Access</h4>
              <p className="text-xs text-gray-500 mt-1">
                Your {user?.plan || 'Gold'} membership entitles you to up to two 1-hour sessions daily with 7 days advance booking.
              </p>
            </div>
            <Link to="/courts" className="mt-4">
              <Button variant="primary" size="sm" className="w-full">
                Book Next Session →
              </Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-premium flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-forest-950">15% Pro Shop & Bar Savings</h4>
              <p className="text-xs text-gray-500 mt-1">
                Exclusive VIP discounts applied automatically at the pro shop checkout and veranda cafeteria tabs.
              </p>
            </div>
            <Link to="/shop" className="mt-4">
              <Button variant="gold" size="sm" className="w-full font-bold">
                Shop Sports Equipment →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Court Bookings */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-premium">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif font-bold text-xl text-forest-950">Upcoming Court Reservations</h3>
            <p className="text-xs text-gray-500 mt-0.5">Your confirmed sessions at the club grounds</p>
          </div>
          <Link to="/member/bookings" className="text-xs font-bold text-forest-900 hover:text-gold-600 flex items-center gap-1">
            View All ({upcomingBookings.length}) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-10 bg-cream-50 rounded-2xl border border-cream-200">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-serif font-bold text-base text-gray-700">No upcoming court sessions</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">Book your favorite court or cricket net for today or tomorrow.</p>
            <Link to="/courts">
              <Button variant="gold" size="sm" className="font-bold">
                Reserve Court Slot
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingBookings.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-forest-900 text-cream-50">
                    {b.bookingType}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {b.amount === 0 ? 'Complimentary' : formatCurrency(b.amount)}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-forest-950">{b.courtName}</h4>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold-600" />
                  {formatDate(b.date)} • {formatTime(b.startTime)} - {formatTime(b.endTime)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Recent Shop Orders */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-premium">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif font-bold text-xl text-forest-950">Recent Pro Shop Orders</h3>
            <p className="text-xs text-gray-500 mt-0.5">Equipment and apparel ordered for pickup or delivery</p>
          </div>
          <Link to="/member/orders" className="text-xs font-bold text-forest-900 hover:text-gold-600 flex items-center gap-1">
            View All Orders <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 bg-cream-50 rounded-2xl border border-cream-200">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-serif font-bold text-base text-gray-700">No recent gear orders</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">Explore high-performance rackets, balls, and apparel.</p>
            <Link to="/shop">
              <Button variant="outline" size="sm">
                Browse Pro Shop
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((ord) => (
              <Link
                key={ord.orderId || ord.id}
                to={`/member/orders/${ord.orderId || ord.id}`}
                className="p-4 rounded-2xl border border-cream-300 hover:border-cream-400 bg-cream-50/50 hover:bg-cream-100/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 block"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-forest-950">#{ord.orderId || ord.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {ord.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {ord.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-forest-950">{formatCurrency(ord.total)}</span>
                  <p className="text-[11px] text-gray-500">{ord.fulfillmentType} ({ord.paymentMethod})</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MemberDashboard;
