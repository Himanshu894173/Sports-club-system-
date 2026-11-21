import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/common/CartDrawer';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-gray-900 selection:bg-gold-500 selection:text-white relative">
      <Navbar />
      <main className="flex-1 w-full relative z-0">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};
export default PublicLayout;
