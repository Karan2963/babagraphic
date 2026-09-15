'use client';

import React, { useEffect, useState } from 'react';
import { Search, UserCheck, History, Phone, MapPin, Mail, DollarSign, FileText } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/customers?id=${id}`);
      const data = await res.json();
      setSelectedCustomer(data);
    } catch (err) {
      console.error('Error fetching customer details:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">CUSTOMER DATABASE</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Auto-Saved Customer Ledger & Order History Tracker
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search name, phone, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <p className="text-xs text-slate-500 py-8 text-center">Loading customer profiles...</p>
        ) : customers.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No customer records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3 rounded-l-xl">Customer Name</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">GSTIN / State</th>
                  <th className="p-3">Address</th>
                  <th className="p-3 text-center">Total Orders</th>
                  <th className="p-3 text-right">Total Purchase (₹)</th>
                  <th className="p-3 text-right">Outstanding (₹)</th>
                  <th className="p-3 text-center rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3 text-slate-600 font-mono">+91 {c.mobile}</td>
                    <td className="p-3 font-mono text-slate-700">{c.gstin || 'B2C'} ({c.state || 'U.P.'})</td>
                    <td className="p-3 text-slate-600 truncate max-w-xs">{c.address || '—'}</td>
                    <td className="p-3 text-center font-bold">{c.totalOrders}</td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">₹{c.totalPurchase.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold font-mono">
                      <span className={c.outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-700'}>
                        ₹{c.outstandingBalance.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => viewCustomerDetails(c.id)}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1 rounded-lg text-xs"
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-500 font-mono">+91 {selectedCustomer.mobile} • {selectedCustomer.address || 'No address'}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="bg-slate-100 font-bold text-slate-700 text-xs px-3 py-1.5 rounded-xl"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Total Orders</span>
                <span className="text-lg font-bold text-slate-900">{selectedCustomer.totalOrders}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Total Spent</span>
                <span className="text-lg font-bold text-blue-900">₹{selectedCustomer.totalPurchase}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Outstanding</span>
                <span className={`text-lg font-bold ${selectedCustomer.outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                  ₹{selectedCustomer.outstandingBalance}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Previous Invoices</h4>
              {selectedCustomer.invoices?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No previous bills found.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {selectedCustomer.invoices?.map((inv: any) => (
                    <div key={inv.id} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-blue-900 font-mono mr-2">{inv.invoiceNo}</span>
                        <span className="text-slate-500 text-[11px]">{new Date(inv.date).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="font-mono">
                        <span className="font-bold text-slate-900 mr-2">₹{inv.totalAmount}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
