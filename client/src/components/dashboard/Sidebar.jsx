import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  Users,
  Calendar,
  Grid,
  ShoppingBag,
  Package,
  ShoppingCart,
  Coffee,
  Utensils,
  UserCheck,
  DollarSign,
  FileText,
  Briefcase,
  ChevronLeft,
  LogOut,
  ShieldAlert
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { name: 'ClubPulse Overview', path: '/admin/pulse', icon: Activity },
    { name: 'Members Directory', path: '/admin/members', icon: Users },
    { name: 'Court Bookings', path: '/admin/bookings', icon: Calendar },
    { name: 'Court Facilities', path: '/admin/courts', icon: Grid },
    { name: 'Pro Shop Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Stock & Inventory', path: '/admin/inventory', icon: Package },
    { name: 'Shop Orders', path: '/admin/shop-orders', icon: ShoppingCart },
    { name: 'Bar & Cafeteria POS', path: '/admin/bar-pos', icon: Coffee },
    { name: 'Kitchen Display (KDS)', path: '/admin/kitchen', icon: Utensils },
    { name: 'Leads & Enquiries', path: '/admin/leads', icon: UserCheck },
    { name: 'Staff & Shifts', path: '/admin/staff', icon: Briefcase },
    { name: 'Finance Ledger', path: '/admin/finance', icon: DollarSign },
    { name: 'Invoices & Reports', path: '/admin/reports', icon: FileText },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-forest-950 text-cream-100 border-r border-forest-900 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-forest-900 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#193847] border border-[#C3FF01]/40 p-1 flex items-center justify-center">
            <img src="/logo.svg" alt="KHELORA" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-serif font-black text-lg text-white tracking-wider leading-tight">KHELORA</h2>
            <p className="text-[10px] text-[#C3FF01] font-semibold uppercase tracking-widest">
              {isAdmin ? 'Arena Admin Suite' : 'Staff Operations'}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Club Management</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gold-500 text-forest-950 font-bold shadow-md'
                    : 'text-cream-200 hover:bg-forest-900 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Info & Footer */}
      <div className="p-4 border-t border-forest-900 bg-forest-900/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name}
              className="w-8 h-8 rounded-lg object-cover border border-gold-500/40"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-cream-50 truncate">{user?.name}</p>
              <p className="text-[10px] text-gold-400 capitalize">{user?.role} Access</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-forest-900 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <Link
          to="/"
          className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg text-xs font-medium bg-forest-900 text-cream-200 hover:text-gold-400 hover:bg-forest-800 transition-colors border border-forest-800"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Website</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 fixed inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-forest-950/70 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-64 max-w-xs h-full bg-forest-950 z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
export default Sidebar;
