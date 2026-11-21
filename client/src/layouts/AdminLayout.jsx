import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import Loader from '../components/common/Loader';
import CartDrawer from '../components/common/CartDrawer';

export const AdminLayout = () => {
  const { user, loading, isStaff, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <Loader message="Authenticating KHELORA credentials..." />
      </div>
    );
  }

  // Require staff or admin role
  if (!user || (!isStaff && !isAdmin)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Derive title from current path
  const getPageTitle = (pathname) => {
    if (pathname.includes('/admin/pulse')) return { title: 'ClubPulse Dashboard', sub: 'Real-time operational & revenue performance' };
    if (pathname.includes('/admin/members')) return { title: 'Members Directory', sub: 'Plan assignments, renewals and member profiles' };
    if (pathname.includes('/admin/bookings')) return { title: 'Court Bookings Calendar', sub: 'Plexicushion & Cricket net reservations' };
    if (pathname.includes('/admin/courts')) return { title: 'Courts & Facilities', sub: 'Surface specifications and lighting schedules' };
    if (pathname.includes('/admin/products')) return { title: 'Sports Shop Products', sub: 'Catalog, pricing and member discounts' };
    if (pathname.includes('/admin/inventory')) return { title: 'Stock & Inventory Ledger', sub: 'Real-time stock levels and warehouse movements' };
    if (pathname.includes('/admin/shop-orders')) return { title: 'Shop Orders & Deliveries', sub: 'Counter sales and doorstep orders' };
    if (pathname.includes('/admin/bar-pos')) return { title: 'Bar & Cafeteria Point of Sale', sub: 'Table management, active tabs and KOT fulfillment' };
    if (pathname.includes('/admin/leads')) return { title: 'Leads & Enquiries', sub: 'Trial session bookings and prospect follow-ups' };
    if (pathname.includes('/admin/staff')) return { title: 'Staff & Shift Management', sub: 'Employee rosters, attendance and leave approvals' };
    if (pathname.includes('/admin/finance')) return { title: 'Financial Ledger & Expenses', sub: 'Consolidated revenue streams and payments' };
    if (pathname.includes('/admin/reports')) return { title: 'Invoices & Reports', sub: 'Printable club invoices and corporate accounts' };
    return { title: 'KHELORA', sub: 'Arena Operations Center' };
  };

  const { title, sub } = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Sidebar */}
      <Sidebar isMobileOpen={mobileMenuOpen} setIsMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={sub}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <CartDrawer />
    </div>
  );
};
export default AdminLayout;
