'use client';

import React, { useEffect, useState } from 'react';
import GSTInvoicePrint from '@/components/GSTInvoicePrint';
import { Search, Printer, MessageSquare, Ban, Eye, FileText, Download } from 'lucide-react';

export default function AllInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setInvoices(data);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvoice = async (id: string) => {
    if (!cancelReason) {
      alert('Please enter a cancellation reason');
      return;
    }
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (res.ok) {
        setCancellingId(null);
        setCancelReason('');
        fetchInvoices();
      }
    } catch (err) {
      console.error('Error cancelling invoice:', err);
    }
  };

  const generateWhatsAppLink = (inv: any) => {
    const text = `Hi ${inv.customer.name}, your invoice ${inv.invoiceNo} from BABA BOOK BINDING for ₹${inv.totalAmount} is ready. Thank you!`;
    return `https://wa.me/91${inv.customer.mobile}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">ALL INVOICES & BILLS</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Searchable Invoice Registry with Audit Logs & WhatsApp Sharing
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search invoice / customer / mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial Due</option>
            <option value="UNPAID">Unpaid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <p className="text-xs text-slate-500 py-8 text-center">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No invoices found matching criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3 rounded-l-xl">Date</th>
                  <th className="p-3">Invoice No</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                  <th className="p-3 text-right">Paid (₹)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Payment</th>
                  <th className="p-3 text-center rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">
                      {new Date(inv.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3 font-bold text-blue-900 font-mono">{inv.invoiceNo}</td>
                    <td className="p-3 font-semibold text-slate-900">{inv.customer.name}</td>
                    <td className="p-3 text-slate-600 font-mono">{inv.customer.mobile}</td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">₹{inv.totalAmount}</td>
                    <td className="p-3 text-right font-mono text-emerald-700 font-semibold">₹{inv.paidAmount}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
                        inv.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-600 font-semibold">{inv.paymentMethod}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setShowPrintModal(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg"
                          title="View / Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <a
                          href={generateWhatsAppLink(inv)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg"
                          title="Send WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        {inv.status !== 'CANCELLED' && (
                          <button
                            onClick={() => setCancellingId(inv.id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                            title="Cancel Invoice"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancellation Reason Modal */}
      {cancellingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Cancel Invoice Audit Confirmation</h3>
            <p className="text-xs text-slate-500">
              Please enter the official reason for cancelling this bill. This action is permanently audited.
            </p>
            <input
              type="text"
              placeholder="e.g. Billed in error / customer returned order..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setCancellingId(null)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700">
                Cancel
              </button>
              <button onClick={() => handleCancelInvoice(cancellingId)} className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold">
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {showPrintModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center no-print">
              <h3 className="font-bold text-slate-900">GST Tax Invoice View</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1"
                >
                  <Printer className="w-4 h-4" /> Print GST Invoice
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>

            <GSTInvoicePrint invoice={selectedInvoice} />
          </div>
        </div>
      )}
    </div>
  );
}
