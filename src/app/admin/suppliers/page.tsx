'use client';

import React, { useEffect, useState } from 'react';
import { Truck, Plus, Search, Phone, MapPin } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    gstin: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (Array.isArray(data)) setSuppliers(data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewSupplier({ name: '', mobile: '', email: '', address: '', gstin: '' });
        fetchSuppliers();
      }
    } catch (err) {
      console.error('Error adding supplier:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">SUPPLIER DIRECTORY</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Manage Paper Traders, Binding Material Vendors & Equipment Distributors
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-md"
        >
          <Plus className="w-4 h-4" /> + Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <p className="text-xs text-slate-500 py-8 text-center">Loading suppliers...</p>
        ) : suppliers.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No suppliers recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3 rounded-l-xl">Supplier Name</th>
                  <th className="p-3">Contact Mobile</th>
                  <th className="p-3">GSTIN</th>
                  <th className="p-3">Address</th>
                  <th className="p-3 text-right">Total Purchases (₹)</th>
                  <th className="p-3 text-right rounded-r-xl">Outstanding Due (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{s.name}</td>
                    <td className="p-3 text-slate-600 font-mono">{s.mobile || '—'}</td>
                    <td className="p-3 font-mono text-slate-700">{s.gstin || 'Unregistered'}</td>
                    <td className="p-3 text-slate-600 truncate max-w-xs">{s.address || '—'}</td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">₹{s.totalPurchases.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold font-mono">
                      <span className={s.outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-700'}>
                        ₹{s.outstandingBalance.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddSupplier} className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add New Supplier Profile</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Supplier Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. ABC Paper Traders"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={newSupplier.mobile}
                  onChange={(e) => setNewSupplier({ ...newSupplier, mobile: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">GSTIN</label>
                <input
                  type="text"
                  placeholder="09AABCB1234D1ZP"
                  value={newSupplier.gstin}
                  onChange={(e) => setNewSupplier({ ...newSupplier, gstin: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address</label>
              <input
                type="text"
                placeholder="e.g. Maidagin, Varanasi"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
              >
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
