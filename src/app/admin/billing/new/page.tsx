'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GSTInvoicePrint from '@/components/GSTInvoicePrint';
import { Plus, Trash2, Save, Printer, UserCheck, Search, Loader2, ArrowLeft } from 'lucide-react';

interface BillItem {
  productId?: string;
  name: string;
  hsnSac: string;
  qty: number;
  rate: number;
  taxRate: number;
}

export default function CreateNewBillPage() {
  const router = useRouter();

  // Customer State
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [customerState, setCustomerState] = useState('Uttar Pradesh');

  // Customer search list
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<any[]>([]);

  // Product & Service Master list
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  // Line items state
  const [items, setItems] = useState<BillItem[]>([
    { name: 'B/W Printing (Single Sided)', hsnSac: '9989', qty: 100, rate: 2.0, taxRate: 18 },
    { name: 'Spiral Binding', hsnSac: '9988', qty: 1, rate: 80.0, taxRate: 18 },
    { name: 'Cover Sheet', hsnSac: '9988', qty: 1, rate: 20.0, taxRate: 18 },
  ]);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'CREDIT'>('CASH');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAvailableServices(data);
      }
    } catch (err) {
      console.error('Failed to load services master:', err);
    }
  };

  const handleCustomerSearch = async (query: string) => {
    setCustomerSearch(query);
    if (query.length < 2) {
      setCustomerResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomerResults(data);
      }
    } catch (err) {
      console.error('Error searching customer:', err);
    }
  };

  const selectCustomer = (cust: any) => {
    setCustomerName(cust.name);
    setCustomerMobile(cust.mobile);
    setCustomerEmail(cust.email || '');
    setCustomerAddress(cust.address || '');
    setCustomerGstin(cust.gstin || '');
    setCustomerState(cust.state || 'Uttar Pradesh');
    setCustomerResults([]);
    setCustomerSearch('');
  };

  const addItemRow = () => {
    setItems([...items, { name: '', hsnSac: '9989', qty: 1, rate: 0, taxRate: 18 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: keyof BillItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;

    // Auto set default rate/hsn if selecting a master product
    if (field === 'name') {
      const found = availableServices.find((s) => s.name === value);
      if (found) {
        updated[index].productId = found.id;
        updated[index].rate = found.price;
        updated[index].hsnSac = found.hsnSac || '9989';
        updated[index].taxRate = found.defaultTaxRate || 18;
      }
    }
    setItems(updated);
  };

  // Calculations
  const isInterState = customerState.toLowerCase() !== 'uttar pradesh';
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.qty * item.rate * (item.taxRate / 100)), 0);
  const grandTotal = Math.round(subtotal + taxAmount);

  useEffect(() => {
    if (paymentMethod === 'CREDIT') {
      setPaidAmount(0);
    } else {
      setPaidAmount(grandTotal);
    }
  }, [grandTotal, paymentMethod]);

  const handleSubmit = async (shouldPrint: boolean) => {
    if (!customerName || !customerMobile) {
      setError('Customer name and mobile number are required');
      return;
    }

    if (items.some((i) => !i.name || i.qty <= 0)) {
      setError('Please fill all item descriptions and quantities');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerMobile,
          customerEmail,
          customerAddress,
          customerGstin,
          customerState,
          items,
          paymentMethod,
          paidAmount,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save bill');

      setSavedInvoice(json);

      if (shouldPrint) {
        setShowPrintModal(true);
        setTimeout(() => {
          window.print();
        }, 500);
      } else {
        router.push('/admin/invoices');
      }
    } catch (err: any) {
      console.error('Error saving bill:', err);
      setError(err.message || 'Failed to save bill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">CREATE INVOICE</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            BABA BOOK BINDING (GSTIN: 09BTDPY1262P1ZX) | Invoice No Auto-Generated on Save
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold rounded-2xl">
          {error}
        </div>
      )}

      {/* Customer Information Block */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" /> Customer Information
          </h2>

          {/* Quick Customer Autofill Search */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search existing customer..."
              value={customerSearch}
              onChange={(e) => handleCustomerSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />

            {customerResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {customerResults.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => selectCustomer(c)}
                    className="p-2.5 hover:bg-blue-50 cursor-pointer text-xs"
                  >
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-[10px] text-slate-500">{c.mobile} • {c.address || 'No address'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Customer Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rohan Kumar"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">GSTIN (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 09AABCB1234D1ZP"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Address</label>
            <input
              type="text"
              placeholder="e.g. Broacha Hostel, BHU Campus"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">State</label>
            <input
              type="text"
              value={customerState}
              onChange={(e) => setCustomerState(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Email (Optional)</label>
            <input
              type="email"
              placeholder="rohan@bhu.ac.in"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            ITEMS & SERVICES
          </h2>
          <button
            type="button"
            onClick={addItemRow}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                <th className="p-2.5 rounded-l-lg">Service / Product</th>
                <th className="p-2.5 text-center">HSN/SAC</th>
                <th className="p-2.5 text-center w-24">Qty</th>
                <th className="p-2.5 text-right w-28">Rate (₹)</th>
                <th className="p-2.5 text-center w-24">GST %</th>
                <th className="p-2.5 text-right w-32">Amount (₹)</th>
                <th className="p-2.5 text-center rounded-r-lg w-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => {
                const itemTotal = item.qty * item.rate * (1 + item.taxRate / 100);
                return (
                  <tr key={idx}>
                    <td className="p-2">
                      <input
                        type="text"
                        list="services-list"
                        placeholder="Select or type service..."
                        value={item.name}
                        onChange={(e) => updateItemRow(idx, 'name', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={item.hsnSac}
                        onChange={(e) => updateItemRow(idx, 'hsnSac', e.target.value)}
                        className="w-16 p-2 rounded-lg border border-slate-300 text-center font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateItemRow(idx, 'qty', Math.max(1, parseFloat(e.target.value) || 1))}
                        className="w-20 p-2 rounded-lg border border-slate-300 text-center font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        step="0.5"
                        value={item.rate}
                        onChange={(e) => updateItemRow(idx, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-24 p-2 rounded-lg border border-slate-300 text-right font-mono font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <select
                        value={item.taxRate}
                        onChange={(e) => updateItemRow(idx, 'taxRate', parseFloat(e.target.value))}
                        className="p-2 rounded-lg border border-slate-300 font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value={18}>18%</option>
                        <option value={12}>12%</option>
                        <option value={5}>5%</option>
                        <option value={0}>0%</option>
                      </select>
                    </td>
                    <td className="p-2 text-right font-bold font-mono text-slate-900">
                      ₹{Math.round(itemTotal).toFixed(2)}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <datalist id="services-list">
          {availableServices.map((s) => (
            <option key={s.id} value={s.name} />
          ))}
        </datalist>
      </div>

      {/* Payment & Grand Total Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Options */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h2 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Payment Mode & Notes
          </h2>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-2">Select Payment Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['CASH', 'UPI', 'CARD', 'CREDIT'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2.5 px-3 rounded-xl font-extrabold border transition ${
                    paymentMethod === method
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {method === 'CASH' && '💵 Cash'}
                  {method === 'UPI' && '📱 UPI'}
                  {method === 'CARD' && '💳 Card'}
                  {method === 'CREDIT' && '⏳ Credit'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Paid Amount (₹)</label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Invoice Remarks / Notes</label>
            <input
              type="text"
              placeholder="e.g. 3 copies hard bound with maroon cover..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Calculation Summary & Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-xs">
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <div className="flex justify-between text-slate-600 font-semibold">
              <span>Subtotal (Taxable):</span>
              <span className="font-mono">₹{subtotal.toFixed(2)}</span>
            </div>

            {isInterState ? (
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>IGST Total:</span>
                <span className="font-mono">₹{taxAmount.toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>CGST (Half Tax):</span>
                  <span className="font-mono">₹{(taxAmount / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>SGST (Half Tax):</span>
                  <span className="font-mono">₹{(taxAmount / 2).toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-200 pt-2">
              <span>TOTAL INVOICE AMOUNT:</span>
              <span className="font-mono text-blue-900">₹{grandTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold pt-1">
              <span className="text-emerald-700">Paid: ₹{paidAmount.toFixed(2)}</span>
              <span className={grandTotal - paidAmount > 0 ? 'text-red-600' : 'text-slate-500'}>
                Due: ₹{Math.max(0, grandTotal - paidAmount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit(false)}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} SAVE BILL
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />} SAVE & PRINT
            </button>
          </div>
        </div>
      </div>

      {/* Printable Modal */}
      {showPrintModal && savedInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center no-print">
              <h3 className="font-bold text-slate-900">Bill Saved Successfully - Ready to Print</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1"
                >
                  <Printer className="w-4 h-4" /> Print Again
                </button>
                <button
                  onClick={() => router.push('/admin/invoices')}
                  className="bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Close & View Invoices
                </button>
              </div>
            </div>

            <GSTInvoicePrint invoice={savedInvoice} />
          </div>
        </div>
      )}
    </div>
  );
}
