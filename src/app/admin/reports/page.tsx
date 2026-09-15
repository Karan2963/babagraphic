'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Plus, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [range, setRange] = useState('month');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Expense modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expense, setExpense] = useState({
    category: 'Electricity',
    title: '',
    amount: 0,
    notes: '',
  });

  useEffect(() => {
    fetchReport();
  }, [range]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?range=${range}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense.title || expense.amount <= 0) return;

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });

      if (res.ok) {
        setShowExpenseModal(false);
        setExpense({ category: 'Electricity', title: '', amount: 0, notes: '' });
        fetchReport();
      }
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const summary = data?.summary || {};
  const serviceBreakdown = data?.serviceBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">FINANCIAL REPORTS & ANALYTICS</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Profit & Loss, Service Demand Breakdown, and Expense Tracker
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Financial Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Billed Sales</span>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{summary.totalSales?.toLocaleString('en-IN') || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{summary.invoiceCount || 0} Invoices Billed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-red-600 uppercase">Total Shop Expenses</span>
          <p className="text-2xl font-black text-red-600 mt-1">₹{summary.totalExpenses?.toLocaleString('en-IN') || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Electricity, Rent & Maintenance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-purple-600 uppercase">Stock Purchases</span>
          <p className="text-2xl font-black text-purple-600 mt-1">₹{summary.totalPurchases?.toLocaleString('en-IN') || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Paper reams & materials</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase">Estimated Net Profit</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{summary.netProfit?.toLocaleString('en-IN') || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Taxable revenue minus shop costs</p>
        </div>
      </div>

      {/* Service Popularity Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
          SERVICE DEMAND & REVENUE BREAKDOWN
        </h2>

        {loading ? (
          <p className="text-xs text-slate-500 py-6 text-center">Loading breakdown...</p>
        ) : serviceBreakdown.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No service data for selected period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3 rounded-l-xl">Service / Item Name</th>
                  <th className="p-3 text-center">Units Sold</th>
                  <th className="p-3 text-right rounded-r-xl">Total Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {serviceBreakdown.map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{s.name}</td>
                    <td className="p-3 text-center font-bold font-mono">{s.qty}</td>
                    <td className="p-3 text-right font-black text-blue-900 font-mono">₹{s.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddExpense} className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add Business Expense Entry</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expense Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Monthly Electricity Bill / Shop Rent"
                value={expense.title}
                onChange={(e) => setExpense({ ...expense, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={expense.category}
                  onChange={(e) => setExpense({ ...expense, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Electricity">Electricity</option>
                  <option value="Rent">Shop Rent</option>
                  <option value="Paper">Paper & Stock</option>
                  <option value="Ink">Ink & Toners</option>
                  <option value="Transport">Transport / Logistics</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="3500"
                  value={expense.amount || ''}
                  onChange={(e) => setExpense({ ...expense, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
