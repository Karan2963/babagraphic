'use client';

import React from 'react';

interface InvoiceItem {
  id?: string;
  name: string;
  hsnSac?: string | null;
  qty: number;
  rate: number;
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
}

interface GSTInvoiceProps {
  invoice: {
    invoiceNo: string;
    date: string | Date;
    paymentMethod?: string;
    status?: string;
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    customer: {
      name: string;
      mobile: string;
      email?: string | null;
      address?: string | null;
      gstin?: string | null;
      state?: string | null;
    };
    items: InvoiceItem[];
  };
}

export default function GSTInvoicePrint({ invoice }: GSTInvoiceProps) {
  const formattedDate = new Date(invoice.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      id="printable-gst-invoice"
      className="bg-white p-6 rounded-xl border border-slate-300 max-w-3xl mx-auto text-slate-900 text-sm shadow-sm"
    >
      {/* Header / Business Logo & Details */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase">
            BABA BOOK BINDING
          </h1>
          <p className="text-xs font-bold text-slate-600">Thesis Printing | Hard Binding | Graphic Design | Photocopy</p>
          <p className="text-xs mt-1 text-slate-700">
            <span className="font-semibold">Address:</span> B30/25 Madho Market, Lanka, Varanasi - 221005 (U.P.)
          </p>
          <p className="text-xs text-slate-700">
            <span className="font-semibold">Mobile:</span> +91 63064 74331 | <span className="font-semibold">Email:</span> contact@babagraphic.store
          </p>
          <p className="text-xs font-black text-blue-800 mt-1">
            GSTIN: 09BTDPY1262P1ZX
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-2">
            Tax Invoice
          </span>
          <p className="text-sm font-bold text-slate-900">Invoice No: {invoice.invoiceNo}</p>
          <p className="text-xs text-slate-600">Date: {formattedDate}</p>
          <p className="text-xs font-semibold text-emerald-700 mt-1 uppercase">
            Payment: {invoice.paymentMethod || 'CASH'} ({invoice.status || 'PAID'})
          </p>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-xs">
        <div>
          <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Billed To (Customer):</p>
          <p className="font-bold text-sm text-slate-900">{invoice.customer.name}</p>
          <p className="text-slate-700">Phone: +91 {invoice.customer.mobile}</p>
          {invoice.customer.address && <p className="text-slate-700">Address: {invoice.customer.address}</p>}
        </div>
        <div className="text-right">
          {invoice.customer.gstin ? (
            <p className="font-bold text-slate-900">GSTIN: {invoice.customer.gstin}</p>
          ) : (
            <p className="text-slate-500 italic">Unregistered Customer (B2C)</p>
          )}
          <p className="text-slate-700">State: {invoice.customer.state || 'Uttar Pradesh (09)'}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse mb-4 text-xs">
        <thead>
          <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase">
            <th className="p-2 border border-slate-800">#</th>
            <th className="p-2 border border-slate-800">Service / Product Description</th>
            <th className="p-2 border border-slate-800 text-center">HSN/SAC</th>
            <th className="p-2 border border-slate-800 text-center">Qty</th>
            <th className="p-2 border border-slate-800 text-right">Rate (₹)</th>
            <th className="p-2 border border-slate-800 text-right">Taxable (₹)</th>
            <th className="p-2 border border-slate-800 text-right">CGST</th>
            <th className="p-2 border border-slate-800 text-right">SGST</th>
            <th className="p-2 border border-slate-800 text-right">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-200">
              <td className="p-2 border border-slate-200 text-center font-medium">{idx + 1}</td>
              <td className="p-2 border border-slate-200 font-semibold text-slate-900">{item.name}</td>
              <td className="p-2 border border-slate-200 text-center font-mono">{item.hsnSac || '9989'}</td>
              <td className="p-2 border border-slate-200 text-center font-bold">{item.qty}</td>
              <td className="p-2 border border-slate-200 text-right font-mono">₹{item.rate.toFixed(2)}</td>
              <td className="p-2 border border-slate-200 text-right font-mono">₹{item.taxableAmount.toFixed(2)}</td>
              <td className="p-2 border border-slate-200 text-right font-mono text-[10px]">
                {item.cgstRate}% (₹{item.cgstAmount.toFixed(2)})
              </td>
              <td className="p-2 border border-slate-200 text-right font-mono text-[10px]">
                {item.sgstRate}% (₹{item.sgstAmount.toFixed(2)})
              </td>
              <td className="p-2 border border-slate-200 text-right font-bold font-mono">₹{item.totalAmount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tax Summary & Financial Breakdown */}
      <div className="flex justify-between items-end border-t-2 border-slate-900 pt-4">
        <div className="text-xs text-slate-600 max-w-xs">
          <p className="font-bold text-slate-800 mb-1">Terms & Conditions:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-[10px]">
            <li>Goods/services once billed will not be taken back.</li>
            <li>Subject to Varanasi jurisdiction only.</li>
            <li>This is a computer generated GST invoice.</li>
          </ol>
        </div>

        <div className="w-64 space-y-1 text-xs">
          <div className="flex justify-between text-slate-700">
            <span>Subtotal (Taxable):</span>
            <span className="font-mono font-semibold">₹{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.cgst > 0 && (
            <div className="flex justify-between text-slate-700">
              <span>CGST Total:</span>
              <span className="font-mono font-semibold">₹{invoice.cgst.toFixed(2)}</span>
            </div>
          )}
          {invoice.sgst > 0 && (
            <div className="flex justify-between text-slate-700">
              <span>SGST Total:</span>
              <span className="font-mono font-semibold">₹{invoice.sgst.toFixed(2)}</span>
            </div>
          )}
          {invoice.igst > 0 && (
            <div className="flex justify-between text-slate-700">
              <span>IGST Total:</span>
              <span className="font-mono font-semibold">₹{invoice.igst.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-slate-900 border-t border-b border-slate-900 py-1.5 mt-1">
            <span>GRAND TOTAL:</span>
            <span className="font-mono text-blue-900">₹{invoice.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600 font-semibold pt-1">
            <span>Paid: ₹{invoice.paidAmount.toFixed(2)}</span>
            <span className={invoice.dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'}>
              Due: ₹{invoice.dueAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-8 flex justify-between items-end pt-4 border-t border-dashed border-slate-300 text-xs">
        <p className="text-slate-500 italic">Thank you for your business!</p>
        <div className="text-center">
          <div className="h-10"></div>
          <p className="font-bold text-slate-900 border-t border-slate-800 pt-1">Authorized Signatory</p>
          <p className="text-[10px] text-slate-500 uppercase">For BABA BOOK BINDING</p>
        </div>
      </div>
    </div>
  );
}
