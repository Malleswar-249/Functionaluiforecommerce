import React from 'react';
import { Outlet } from 'react-router';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="bg-[#342639] text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 E-Commerce Platform. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">Built with React, Supabase, and JWT Authentication</p>
        </div>
      </footer>
    </div>
  );
}
