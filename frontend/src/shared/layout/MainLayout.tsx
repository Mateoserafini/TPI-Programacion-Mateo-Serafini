import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/shared/layout/Navbar';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900 antialiased">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-200 bg-white py-4 text-center text-xs text-zinc-500">
        Food Store · Programación 4 · UTN
      </footer>
    </div>
  );
};
