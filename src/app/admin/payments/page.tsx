'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, UserCheck, Plus, Search } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [customerDues, setCustomerDues] = useState<any[]>([]);
  const [totalOutstanding, setTotalOutstanding] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Pay Modal
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments');
      const data = await res.json();
      setPayments(data.payments || []);
      setCustomerDues(data.customerDues || []);
      setTotalOutstanding(data.totalOutstanding || 0);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || payAmount <= 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          amount: payAmount,
          paymentMethod,
          referenceNo,
          notes,
        }),
      });

      if (res.ok) {
        setSelectedCustomer(null);
        setPayAmount(0);
        setReferenceNo('');
        setNotes('');
        fetchPayments();
      }
    } catch (err) {
      console.error('Error recording payment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">ACCOUNTS RECEIVABLE & PAYMENTS</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Customer Credit Dues Ledger & Receipt Recorder
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 px-5 py-2.5 rounded-2xl text-right">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Total Outstanding Dues</span>
          <span className="text-xl font-black text-red-600 font-mono">₹{totalOutstanding.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Dues List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
          CUSTOMERS WITH PENDING DUES
        </h2>

        {loading ? (
          <p className="text-xs text-slate-500 py-6 text-center">Loading pending dues...</p>
        ) : customerDues.length === 0 ? (
          <p className="text-xs text-emerald-700 font-bold py-6 text-center">🎉 Excellent! No pending customer dues.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3 rounded-l-xl">Customer Name</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Address</th>
                  <th className="p-3 text-right">Outstanding Balance (₹)</th>
                  <th className="p-3 text-center rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {customerDues.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3 text-slate-600 font-mono">+91 {c.mobile}</td>
                    <td className="p-3 text-slate-600 truncate max-w-xs">{c.address || '—'}</td>
                    <td className="p-3 text-right font-black text-red-600 font-mono text-sm">₹{c.outstandingBalance}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedCustomer(c);
                          setPayAmount(c.outstandingBalance);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                      >
                        Record Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRecordPayment} className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Record Payment from {selectedCustomer.name}
            </h3>
            <p className="text-xs text-slate-500">
              Outstanding Due: <strong className="text-red-600 font-mono">₹{selectedCustomer.outstandingBalance}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount Received (₹) *</label>
              <input
                type="number"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="CASH">Cash 💵</option>
                <option value="UPI">UPI / GPay / PhonePe 📱</option>
                <option value="CARD">Debit / Credit Card 💳</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">UPI Ref / Txn ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 409912837192"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || payAmount <= 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50"
              >
                Save Receipt
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
