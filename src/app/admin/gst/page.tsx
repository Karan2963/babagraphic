'use client';

import React, { useEffect, useState } from 'react';
import { Receipt, Download, FileText, CheckCircle2 } from 'lucide-react';

export default function GSTPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGSTSummary();
  }, []);

  const fetchGSTSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports?range=month');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching GST data:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data || !data.recentInvoices) return;

    const headers = ['Invoice No', 'Date', 'Customer Name', 'GSTIN', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total Amount', 'Status'];
    const rows = data.recentInvoices.map((inv: any) => [
      inv.invoiceNo,
      new Date(inv.date).toLocaleDateString('en-IN'),
      `"${inv.customer?.name || ''}"`,
      inv.customer?.gstin || 'B2C',
      inv.subtotal.toFixed(2),
      inv.cgst.toFixed(2),
      inv.sgst.toFixed(2),
      inv.igst.toFixed(2),
      inv.totalAmount.toFixed(2),
      inv.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GSTR1_BabaBookBinding_${new Date().toISOString().slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">GST TAX RETURNS & SUMMARY</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            BABA BOOK BINDING (GSTIN: 09BTDPY1262P1ZX) | GSTR-1 Tax Summary & CSV Export
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-md"
        >
          <Download className="w-4 h-4" /> Export GST Sales CSV
        </button>
      </div>

      {/* Tax Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Taxable Sales</span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ₹{summary.totalTaxable?.toLocaleString('en-IN') || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Excludes GST tax</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-blue-600 uppercase">CGST Collected (9%)</span>
          <p className="text-2xl font-black text-blue-600 mt-1 font-mono">
            ₹{summary.totalCGST?.toLocaleString('en-IN') || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Central GST liability</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-blue-600 uppercase">SGST Collected (9%)</span>
          <p className="text-2xl font-black text-blue-600 mt-1 font-mono">
            ₹{summary.totalSGST?.toLocaleString('en-IN') || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">State GST liability (UP)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-purple-600 uppercase">Total Tax Liability</span>
          <p className="text-2xl font-black text-purple-600 mt-1 font-mono">
            ₹{((summary.totalCGST || 0) + (summary.totalSGST || 0) + (summary.totalIGST || 0)).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">CGST + SGST + IGST</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h3 className="font-bold text-blue-900 text-sm">Accountant Ready Export</h3>
          <p className="text-xs text-blue-700 mt-0.5">
            Click "Export GST Sales CSV" above to download the formatted GSTR-1 file for filing your returns.
          </p>
        </div>
        <Receipt className="w-8 h-8 text-blue-600 opacity-60" />
      </div>
    </div>
  );
}
