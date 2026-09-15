'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Trash2, Save, Loader2, ArrowLeft } from 'lucide-react';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<any[]>([
    { inventoryItemId: '', qty: 10, unitPrice: 250, taxAmount: 0 },
  ]);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [pRes, sRes, iRes] = await Promise.all([
        fetch('/api/purchases'),
        fetch('/api/suppliers'),
        fetch('/api/inventory'),
      ]);

      const pData = await pRes.json();
      const sData = await sRes.json();
      const iData = await iRes.json();

      if (Array.isArray(pData)) setPurchases(pData);
      if (Array.isArray(sData)) setSuppliers(sData);
      if (Array.isArray(iData)) setInventoryItems(iData);
    } catch (err) {
      console.error('Error fetching purchase data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => {
    setPurchaseItems([...purchaseItems, { inventoryItemId: '', qty: 1, unitPrice: 0, taxAmount: 0 }]);
  };

  const removeRow = (index: number) => {
    if (purchaseItems.length <= 1) return;
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: string, value: any) => {
    const updated = [...purchaseItems];
    updated[index][field] = value;
    setPurchaseItems(updated);
  };

  const totalAmount = purchaseItems.reduce((sum, item) => sum + (item.qty * item.unitPrice + Number(item.taxAmount || 0)), 0);

  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || purchaseItems.some((i) => !i.inventoryItemId)) {
      alert('Please select supplier and all inventory items');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          supplierInvoiceNo,
          items: purchaseItems,
          paidAmount: paidAmount || totalAmount,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setSupplierId('');
        setSupplierInvoiceNo('');
        setPurchaseItems([{ inventoryItemId: '', qty: 10, unitPrice: 250, taxAmount: 0 }]);
        fetchInitialData();
      }
    } catch (err) {
      console.error('Error submitting purchase:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">PURCHASES & STOCK ENTRY</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Record Vendor Invoices to Automatically Replenish Consumable Inventory
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-md"
        >
          <Plus className="w-4 h-4" /> + Create Purchase Entry
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <p className="text-xs text-slate-500 py-8 text-center">Loading purchases...</p>
        ) : purchases.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No purchase entries recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3 rounded-l-xl">Date</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">Supplier Invoice</th>
                  <th className="p-3">Items Purchased</th>
                  <th className="p-3 text-right">Total Amount (₹)</th>
                  <th className="p-3 text-right">Paid (₹)</th>
                  <th className="p-3 text-center rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                    <td className="p-3 font-bold text-slate-900">{p.supplier?.name}</td>
                    <td className="p-3 font-mono text-slate-700">{p.supplierInvoiceNo || '—'}</td>
                    <td className="p-3 text-slate-600">
                      {p.items?.map((i: any) => `${i.inventoryItem?.name} (x${i.qty})`).join(', ')}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">₹{p.totalAmount}</td>
                    <td className="p-3 text-right font-mono text-emerald-700 font-semibold">₹{p.paidAmount}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Purchase Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSubmitPurchase} className="bg-white p-6 rounded-3xl max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
              PURCHASE ENTRY (REPLENISH STOCK)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Supplier *</label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Supplier Invoice No</label>
                <input
                  type="text"
                  placeholder="e.g. P-10245"
                  value={supplierInvoiceNo}
                  onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Purchased Stock Items</span>
                <button type="button" onClick={addRow} className="text-xs font-bold text-blue-600 hover:underline">
                  + Add Item Row
                </button>
              </div>

              <div className="space-y-2">
                {purchaseItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <select
                      required
                      value={item.inventoryItemId}
                      onChange={(e) => updateRow(idx, 'inventoryItemId', e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="">-- Select Consumable Item --</option>
                      {inventoryItems.map((inv) => (
                        <option key={inv.id} value={inv.id}>{inv.name} ({inv.category})</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateRow(idx, 'qty', parseFloat(e.target.value) || 0)}
                      className="w-20 p-2 rounded-lg border border-slate-300 text-xs text-center font-bold"
                    />

                    <input
                      type="number"
                      step="0.5"
                      placeholder="Rate ₹"
                      value={item.unitPrice}
                      onChange={(e) => updateRow(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-24 p-2 rounded-lg border border-slate-300 text-xs text-right font-mono font-bold"
                    />

                    <button type="button" onClick={() => removeRow(idx)} className="text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-300">Total Purchase Value:</span>
              <span className="text-xl font-black text-blue-400 font-mono">₹{totalAmount.toFixed(2)}</span>
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
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50"
              >
                Save Purchase & Replenish Stock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
