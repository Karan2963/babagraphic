'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FilePlus,
  FileText,
  Users,
  Package,
  Wrench,
  ArrowUpRight,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [reportsRes, lowStockRes, invoicesRes] = await Promise.all([
        fetch('/api/reports?range=today'),
        fetch('/api/inventory?lowStock=true'),
        fetch('/api/invoices'),
      ]);

      const reportsData = await reportsRes.json();
      const lowStockData = await lowStockRes.json();
      const invoicesData = await invoicesRes.json();

      setStats(reportsData.summary || {});
      setLowStockItems(Array.isArray(lowStockData) ? lowStockData : []);
      setRecentInvoices(Array.isArray(invoicesData) ? invoicesData.slice(0, 8) : []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">BABA BOOK BINDING ── Dashboard</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Business & POS Overview | GSTIN: 09BTDPY1262P1ZX | Lanka, Varanasi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/billing/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-md"
          >
            <FilePlus className="w-4 h-4" /> + Create New Bill
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Sales</span>
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{stats?.totalSales?.toLocaleString('en-IN') || '0'}
          </p>

          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Total billed today ({stats?.invoiceCount || 0} bills)
          </p>
        </div>

        {/* Received Payment */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Received Payment</span>
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
              ✓
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            ₹{stats?.totalReceived?.toLocaleString('en-IN') || '0'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Cash, UPI & Card received
          </p>
        </div>

        {/* Pending Credit / Dues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Dues</span>
            <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">
              !
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">
            ₹{stats?.totalPending?.toLocaleString('en-IN') || '0'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Customer credit pending
          </p>
        </div>

        {/* Profit Estimation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Est. Net Profit</span>
            <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700">
            ₹{stats?.netProfit?.toLocaleString('en-IN') || '0'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Sales minus expenses & paper costs
          </p>
        </div>
      </div>

      {/* Low-Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">⚠ LOW STOCK WARNING ({lowStockItems.length} Consumable Items)</h3>
              <p className="text-xs text-amber-700">
                {lowStockItems.map((item) => `${item.name} (${item.currentStock} ${item.unit})`).join(' • ')}
              </p>
            </div>
          </div>
          <Link
            href="/admin/purchases"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex-shrink-0 transition"
          >
            + Create Purchase Entry
          </Link>
        </div>
      )}

      {/* Quick Access Menu Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <Link href="/admin/billing/new" className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl text-center font-bold text-xs transition flex flex-col items-center gap-1.5 shadow-sm">
          <FilePlus className="w-5 h-5" /> 📄 New Bill
        </Link>
        <Link href="/admin/invoices" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 p-3.5 rounded-xl text-center font-bold text-xs transition flex flex-col items-center gap-1.5 shadow-sm">
          <FileText className="w-5 h-5 text-blue-600" /> 📋 All Bills
        </Link>
        <Link href="/admin/customers" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 p-3.5 rounded-xl text-center font-bold text-xs transition flex flex-col items-center gap-1.5 shadow-sm">
          <Users className="w-5 h-5 text-emerald-600" /> 👥 Customers
        </Link>
        <Link href="/admin/inventory" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 p-3.5 rounded-xl text-center font-bold text-xs transition flex flex-col items-center gap-1.5 shadow-sm">
          <Package className="w-5 h-5 text-purple-600" /> 📦 Inventory
        </Link>
        <Link href="/admin/assets" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 p-3.5 rounded-xl text-center font-bold text-xs transition flex flex-col items-center gap-1.5 shadow-sm">
          <Wrench className="w-5 h-5 text-amber-600" /> 🛠 Assets
        </Link>
        <Link href="/admin/reports" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 p-3.5 rounded-xl text-center font-bold text-xs transition flex flex-col items-center gap-1.5 shadow-sm">
          <TrendingUp className="w-5 h-5 text-indigo-600" /> 📊 Reports
        </Link>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
          <h2 className="text-lg font-bold text-slate-900">Recent Transactions & Bills</h2>
          <Link href="/admin/invoices" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            View All Invoices <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500 py-6 text-center">Loading recent transactions...</p>
        ) : recentInvoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500">No invoices created yet today.</p>
            <Link href="/admin/billing/new" className="inline-block mt-3 bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
              Create First Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3 rounded-l-xl">Invoice No</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Payment</th>
                  <th className="p-3 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-blue-900 font-mono">{inv.invoiceNo}</td>
                    <td className="p-3 font-semibold text-slate-900">{inv.customer?.name}</td>
                    <td className="p-3 text-slate-600">{inv.customer?.mobile}</td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">₹{inv.totalAmount}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
                        inv.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-600 font-semibold">{inv.paymentMethod}</td>
                    <td className="p-3 text-right">
                      <Link href={`/admin/invoices?id=${inv.id}`} className="text-blue-600 hover:underline font-bold">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
