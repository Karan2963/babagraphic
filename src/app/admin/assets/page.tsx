'use client';

import React, { useEffect, useState } from 'react';
import { Wrench, Plus, AlertCircle, CheckCircle2, DollarSign, Calendar, ShieldCheck } from 'lucide-react';

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // New Asset Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'Printing Machine',
    purchaseDate: '',
    purchasePrice: 0,
    supplierName: '',
    serialNumber: '',
    status: 'WORKING',
  });

  // Maintenance Log Modal
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] = useState<any>(null);
  const [maintDescription, setMaintDescription] = useState('');
  const [maintCost, setMaintCost] = useState<number>(0);
  const [maintStatus, setMaintStatus] = useState('WORKING');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/assets');
      const data = await res.json();
      setAssets(data.assets || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewAsset({
          name: '',
          category: 'Printing Machine',
          purchaseDate: '',
          purchasePrice: 0,
          supplierName: '',
          serialNumber: '',
          status: 'WORKING',
        });
        fetchAssets();
      }
    } catch (err) {
      console.error('Error creating asset:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForMaintenance) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAssetForMaintenance.id,
          description: maintDescription,
          cost: maintCost,
          status: maintStatus,
        }),
      });

      if (res.ok) {
        setSelectedAssetForMaintenance(null);
        setMaintDescription('');
        setMaintCost(0);
        fetchAssets();
      }
    } catch (err) {
      console.error('Error logging maintenance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">MACHINERY & ASSETS TRACKER</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Equipment Registry, Status Monitoring & Servicing Maintenance History
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-md"
        >
          <Plus className="w-4 h-4" /> Add New Asset
        </button>
      </div>

      {/* Asset Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Asset Value</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ₹{stats.totalAssetValue?.toLocaleString('en-IN') || '0'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{stats.totalAssets || 0} Total Machines</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase">Working Machines</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.workingCount || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Operating on shop floor</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase">Under Maintenance</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.maintenanceCount || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Servicing / toner replacement</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-red-600 uppercase">Damaged / Out of Order</span>
          <p className="text-2xl font-black text-red-600 mt-1">{stats.damagedCount || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Requires urgent repair</p>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <p className="text-xs text-slate-500 py-8 text-center">Loading asset registry...</p>
        ) : assets.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No assets registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => {
              const totalMaintCost = asset.maintenanceLogs?.reduce((sum: number, m: any) => sum + m.cost, 0) || 0;
              return (
                <div key={asset.id} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-mono">
                        {asset.assetCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{asset.name}</h3>
                      <p className="text-[11px] text-slate-500">{asset.category} • S/N: {asset.serialNumber || 'N/A'}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      asset.status === 'WORKING' ? 'bg-emerald-100 text-emerald-800' :
                      asset.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {asset.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span>Purchase Price:</span>
                      <span className="font-bold font-mono">₹{asset.purchasePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Purchase Date:</span>
                      <span>{new Date(asset.purchaseDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-purple-700 font-semibold border-t border-slate-100 pt-1">
                      <span>Total Servicing Cost:</span>
                      <span className="font-mono">₹{totalMaintCost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Maintenance Log History List */}
                  {asset.maintenanceLogs && asset.maintenanceLogs.length > 0 && (
                    <div className="space-y-1 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-800 text-[10px] uppercase block mb-1">Recent Maintenance Logs:</span>
                      {asset.maintenanceLogs.slice(0, 2).map((log: any) => (
                        <div key={log.id} className="flex justify-between border-b border-slate-50 pb-0.5">
                          <span className="truncate max-w-[150px]">{log.description}</span>
                          <span className="font-mono font-bold text-slate-900">₹{log.cost}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedAssetForMaintenance(asset)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    + Log Maintenance / Service
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add New Asset */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateAsset} className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Register New Machinery Asset</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Machine Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Digital Color Printer"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Printing Machine">Printing Machine</option>
                  <option value="Copier Machine">Copier Machine</option>
                  <option value="Binding Machine">Binding Machine</option>
                  <option value="Cutting Machine">Cutting Machine</option>
                  <option value="Computer Desktop">Computer Desktop</option>
                  <option value="Power Supply">UPS / Inverter</option>
                  <option value="Air Conditioner">Air Conditioner</option>
                  <option value="Furniture">Furniture</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Purchase Price (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 85000"
                  value={newAsset.purchasePrice || ''}
                  onChange={(e) => setNewAsset({ ...newAsset, purchasePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={newAsset.purchaseDate}
                  onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. CN-9942"
                  value={newAsset.serialNumber}
                  onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
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
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50"
              >
                Save Asset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Log Maintenance */}
      {selectedAssetForMaintenance && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddMaintenance} className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Log Servicing / Maintenance: {selectedAssetForMaintenance.name}</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. Toner replacement / drum servicing..."
                value={maintDescription}
                onChange={(e) => setMaintDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Maintenance Cost (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 4500"
                  value={maintCost || ''}
                  onChange={(e) => setMaintCost(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Update Status</label>
                <select
                  value={maintStatus}
                  onChange={(e) => setMaintStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="WORKING">Working ●</option>
                  <option value="MAINTENANCE">Maintenance 🟡</option>
                  <option value="DAMAGED">Damaged 🔴</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setSelectedAssetForMaintenance(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50"
              >
                Save Maintenance Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
