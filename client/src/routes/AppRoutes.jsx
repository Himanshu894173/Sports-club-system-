import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import MemberLayout from '../layouts/MemberLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Membership from '../pages/public/Membership';
import Courts from '../pages/public/Courts';
import Shop from '../pages/public/Shop';
import CafeMenu from '../pages/public/CafeMenu';
import Trial from '../pages/public/Trial';
import Contact from '../pages/public/Contact';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import OrderConfirmation from '../pages/public/OrderConfirmation';

// Member Portal Pages
import MemberDashboard from '../pages/member/MemberDashboard';
import MyBookings from '../pages/member/MyBookings';
import MyMembership from '../pages/member/MyMembership';
import MyOrders from '../pages/member/MyOrders';
import OrderDetails from '../pages/member/OrderDetails';

// Admin / Staff Management Pages
import ClubPulse from '../pages/admin/ClubPulse';
import Members from '../pages/admin/Members';
import Bookings from '../pages/admin/Bookings';
import CourtsAdmin from '../pages/admin/Courts';
import Products from '../pages/admin/Products';
import Inventory from '../pages/admin/Inventory';
import ShopOrders from '../pages/admin/ShopOrders';
import BarPOS from '../pages/admin/BarPOS';
import Leads from '../pages/admin/Leads';
import Staff from '../pages/admin/Staff';
import Finance from '../pages/admin/Finance';
import Reports from '../pages/admin/Reports';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/courts" element={<Courts />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/bar" element={<CafeMenu />} />
        <Route path="/trial" element={<Trial />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
      </Route>

      {/* Member Portal */}
      <Route path="/member" element={<MemberLayout />}>
        <Route index element={<Navigate to="/member/dashboard" replace />} />
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="membership" element={<MyMembership />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />
      </Route>

      {/* Admin & Staff Management Portal */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/pulse" replace />} />
        <Route path="pulse" element={<ClubPulse />} />
        <Route path="members" element={<Members />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="courts" element={<CourtsAdmin />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="shop-orders" element={<ShopOrders />} />
        <Route path="orders" element={<ShopOrders />} />
        <Route path="bar-pos" element={<BarPOS />} />
        <Route path="kitchen" element={<BarPOS defaultTab="kds" />} />
        <Route path="leads" element={<Leads />} />
        <Route path="staff" element={<Staff />} />
        <Route path="finance" element={<Finance />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRoutes;
