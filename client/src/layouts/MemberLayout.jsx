import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/common/CartDrawer';
import Loader from '../components/common/Loader';
import { LayoutDashboard, Calendar, Award, ShoppingBag } from 'lucide-react';

export const MemberLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <Loader message="Loading member portal..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const tabs = [
    { name: 'Member Overview', path: '/member/dashboard', icon: LayoutDashboard },
    { name: 'My Court Bookings', path: '/member/bookings', icon: Calendar },
    { name: 'My Membership Plan', path: '/member/membership', icon: Award },
    { name: 'My Shop Orders', path: '/member/orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-gray-900 relative">
      <Navbar />

      {/* Member Portal Banner */}
      <div className="bg-forest-900 text-cream-50 py-8 border-b border-forest-800 shadow-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500 text-forest-950">
                  {user?.plan || 'Gold'} Member
                </span>
                <span className="text-xs text-cream-200">ID: {user?.memberId || 'MEM-2026-001'}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-cream-50 mt-1">
                Welcome back, {user?.name}
              </h1>
              <p className="text-xs text-gold-300 mt-1">
                Enjoy complimentary court bookings and 15% privileges across the gear shop and cafeteria.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/courts"
                className="px-4 py-2.5 rounded-xl bg-gold-500 text-forest-950 font-bold text-xs hover:bg-gold-400 transition-all shadow"
              >
                Book a Court Slot
              </Link>
              <Link
                to="/shop"
                className="px-4 py-2.5 rounded-xl bg-forest-800 text-cream-100 font-medium text-xs hover:bg-forest-700 transition-all border border-forest-700"
              >
                Visit Pro Shop
              </Link>
            </div>
          </div>

          {/* Member Sub Navigation */}
          <div className="flex space-x-1 mt-6 border-b border-forest-800 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.name}
                  to={tab.path}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-gold-500 text-gold-400 bg-forest-950/60 font-bold'
                      : 'border-transparent text-cream-200 hover:text-cream-50 hover:bg-forest-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};
export default MemberLayout;
