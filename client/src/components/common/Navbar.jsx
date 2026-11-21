import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, User, Menu, X, Shield, ChevronDown, LogOut, LayoutDashboard, Calendar, Sparkles, ArrowUpRight } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isStaff } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Membership', path: '/membership' },
    { name: 'Court Booking', path: '/courts' },
    { name: 'Sports Shop', path: '/shop' },
    { name: 'Cafeteria & Bar', path: '/bar' },
    { name: 'Book Trial', path: '/trial' },
    { name: 'Contact', path: '/contact' },
  ];

  const getDashboardPath = () => {
    if (isAdmin || isStaff) return '/admin/pulse';
    return '/member/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 bg-forest-950 border-b border-forest-800 shadow-premium">
      {/* Top Bar for Members */}
      <div className="bg-forest-900 border-b border-forest-800 text-cream-200 text-xs py-2 px-4 hidden md:block h-[38px]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gold-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Championship Grass & Clay Courts Open Today: 06:00 - 22:00
            </span>
            <span className="text-gray-400">|</span>
            <span>Front Desk & Concierge: +91 (0124) 488-9000</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/membership" className="text-gold-400 hover:text-gold-300 transition-colors font-medium">
              Join Gold Membership →
            </Link>
            <span className="text-gray-400">|</span>
            <Link to="/trial" className="hover:text-cream-50 transition-colors">
              Schedule 45-Min Trial Session
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-[#193847] border border-[#C3FF01]/40 p-1.5 flex items-center justify-center shadow-lg group-hover:border-[#C3FF01] transition-all">
              <img src="/logo.svg" alt="KHELORA" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif font-black text-2xl tracking-wider text-white block leading-none">
                KHELORA
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links - Matching mockup pill capsule */}
          <nav className="hidden lg:flex items-center space-x-1 bg-forest-900/90 border border-forest-700/60 rounded-full px-2.5 py-1.5 shadow-inner backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${isActive
                    ? 'text-forest-950 bg-secondary shadow-volt'
                    : 'text-cream-200 hover:text-white hover:bg-forest-800/60'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: CTA Button, Cart & Auth */}
          <div className="flex items-center gap-3">
            {/* Quick Action Pill Button matching reference "записаться ↗" */}
            <Link to="/courts" className="hidden sm:inline-flex">
              <button className="px-4 py-2 rounded-full bg-forest-900 border border-forest-700 hover:border-secondary text-cream-50 hover:text-secondary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm">
                Book a Slot <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-forest-900/60 border border-forest-800 text-cream-100 hover:text-secondary hover:border-secondary/40 transition-all"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-forest-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth Buttons / Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 pr-2.5 rounded-xl bg-forest-900 border border-gold-500/30 hover:border-gold-500/60 text-cream-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-forest-800 flex items-center justify-center border border-gold-400/40">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-gold-400" />
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold leading-none">{user?.name?.split(' ')[0]}</p>
                    <p className="text-[10px] text-gold-400 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-cream-300 py-2 z-50 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-cream-200">
                      <p className="text-sm font-semibold text-forest-950">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      {user?.plan && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold-100 text-gold-800">
                          {user.plan} Member
                        </span>
                      )}
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-cream-100 hover:text-forest-950 font-medium"
                    >
                      <LayoutDashboard className="w-4 h-4 text-forest-900" />
                      {isAdmin || isStaff ? 'Admin / Staff Portal' : 'Member Portal'}
                    </Link>

                    {!isAdmin && !isStaff && (
                      <>
                        <Link
                          to="/member/bookings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-cream-100"
                        >
                          <Calendar className="w-4 h-4 text-forest-900" />
                          My Court Bookings
                        </Link>
                        <Link
                          to="/member/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-cream-100"
                        >
                          <ShoppingBag className="w-4 h-4 text-forest-900" />
                          My Orders
                        </Link>
                      </>
                    )}

                    <div className="border-t border-cream-200 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-cream-100 hover:text-gold-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/membership"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold-500 text-forest-950 hover:bg-gold-400 shadow-md transition-all hidden sm:inline-block"
                >
                  Join Club
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-cream-100 hover:bg-forest-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-forest-950 border-b border-forest-800 px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-cream-200 hover:bg-forest-900 hover:text-gold-400"
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block mt-4 px-4 py-3 rounded-xl bg-gold-500 text-forest-950 font-semibold text-center"
            >
              Go to {isAdmin || isStaff ? 'Admin Portal' : 'Member Portal'}
            </Link>
          ) : (
            <div className="pt-4 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg border border-gold-500 text-gold-400 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/membership"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg bg-gold-500 text-forest-950 font-semibold"
              >
                Join Club
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
export default Navbar;
