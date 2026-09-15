'use client';

import React, { useEffect, useState } from 'react';
import { Package, AlertTriangle, Plus, RefreshCw, Layers } from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Manual Adjustment Modal state
  const [adjustingItem, setAdjustingItem] = useState<any>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [categoryFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/inventory?category=${categoryFilter}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustingItem || adjustmentQty === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: adjustingItem.id,
          adjustmentQty,
          notes: adjustmentNotes || 'Manual stock update',
        }),
      });

      if (res.ok) {
        setAdjustingItem(null);
        setAdjustmentQty(0);
        setAdjustmentNotes('');
        fetchInventory();
      }
    } catch (err) {
      console.error('Error adjusting stock:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">CONSUMABLES & INVENTORY STOCK</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Auto-Deducted Paper, Spiral Coils, Hard Covers, Toners & Consumables
          </p>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="Paper">Paper Reams & Sheets</option>
          <option value="Binding">Binding Coils & Covers</option>
          <option value="Lamination">Lamination Pouches</option>
          <option value="Toners">Ink Toners</option>
        </select>
      </div>

      {/* Stock Cards Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <p className="text-xs text-slate-500 py-8 text-center">Loading stock items...</p>
        ) : items.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No inventory items found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const isLowStock = item.currentStock <= item.minStockAlert;
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition ${
                    isLowStock
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.category}</span>
                      <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                    </div>
                    {isLowStock && (
                      <span className="bg-amber-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> LOW STOCK
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between mt-3">
                    <div>
                      <span className="text-2xl font-black text-slate-900 font-mono">{item.currentStock}</span>
                      <span className="text-xs font-semibold text-slate-500 ml-1">{item.unit}</span>
                    </div>

                    <div className="text-right text-[11px] text-slate-500">
                      <p>Min Alert: <strong className="text-slate-800">{item.minStockAlert}</strong></p>
                      <p>Cost Rate: <strong className="text-slate-800">₹{item.costPrice}</strong></p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="text-[11px] text-slate-500">Auto Reduces on Billing</span>
                    <button
                      onClick={() => setAdjustingItem(item)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Adjust Stock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Adjustment Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Adjust Stock: {adjustingItem.name}</h3>
            <p className="text-xs text-slate-500">
              Current Stock: <strong>{adjustingItem.currentStock} {adjustingItem.unit}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quantity Adjustment (+ to Add, - to Deduct)
              </label>
              <input
                type="number"
                placeholder="e.g. +50 or -10"
                value={adjustmentQty || ''}
                onChange={(e) => setAdjustmentQty(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason / Remarks</label>
              <input
                type="text"
                placeholder="e.g. Received new shipment / damaged stock"
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                onClick={() => setAdjustingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={submitting || adjustmentQty === 0}
                onClick={handleAdjustStock}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
