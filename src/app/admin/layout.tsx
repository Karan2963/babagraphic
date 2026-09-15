'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Users,
  Package,
  Wrench,
  ShoppingBag,
  Truck,
  CreditCard,
  BarChart3,
  Receipt,
  Globe,
  Store,
  PlusCircle,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: '+ New Bill', href: '/admin/billing/new', icon: FilePlus, highlight: true },
    { name: 'All Invoices', href: '/admin/invoices', icon: FileText },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Inventory Stock', href: '/admin/inventory', icon: Package },
    { name: 'Assets & Machines', href: '/admin/assets', icon: Wrench },
    { name: 'Purchases', href: '/admin/purchases', icon: ShoppingBag },
    { name: 'Suppliers', href: '/admin/suppliers', icon: Truck },
    { name: 'Payments & Dues', href: '/admin/payments', icon: CreditCard },
    { name: 'Reports & Profit', href: '/admin/reports', icon: BarChart3 },
    { name: 'GST Returns', href: '/admin/gst', icon: Receipt },
    { name: 'Online Orders', href: '/admin/online-orders', icon: Globe },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Logo & Business Branding */}
          <div className="flex items-center gap-3 p-2 mb-6 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md">
              BB
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-wide text-white leading-tight">
                BABA BOOK BINDING
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                ERP & POS System
              </span>
            </div>
          </div>

          {/* Quick Action + New Bill Button */}
          <div className="mb-4">
            <a
              href="/admin/billing/new"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Create New Bill
            </a>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-500'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin User / Clerk Auth */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <UserButton afterSignOutUrl="/" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-200">Shop Admin</p>
              <p className="text-[10px] text-slate-400">GST: 09BTDPY1262P1ZX</p>
            </div>
          </div>
          <a href="/" target="_blank" className="text-slate-400 hover:text-white" title="View Public Website">
            <Store className="w-4 h-4" />
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
