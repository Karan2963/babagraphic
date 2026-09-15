'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, FileText, Download, CheckCircle2, ArrowRight, Clock, ExternalLink } from 'lucide-react';

export default function OnlineOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/online-orders');
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error('Error fetching online orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/online-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">ONLINE ORDER QUEUE</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Customer PDF Uploads from Website Portal & 1-Click Invoice Generation
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <p className="text-xs text-slate-500 py-8 text-center">Loading online orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No online customer orders in queue.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3 rounded-l-xl">Order No</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Service Requested</th>
                  <th className="p-3">Uploaded File</th>
                  <th className="p-3 text-center">Status Workflow</th>
                  <th className="p-3 text-center rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-blue-900 font-mono">{ord.orderNo}</td>
                    <td className="p-3 font-semibold text-slate-900">{ord.customerName}</td>
                    <td className="p-3 text-slate-600 font-mono">+91 {ord.customerMobile}</td>
                    <td className="p-3 font-medium text-slate-800">{ord.serviceType}</td>
                    <td className="p-3">
                      {ord.fileUrl ? (
                        <a
                          href={ord.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> View PDF <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No file attached</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className="p-1.5 rounded-lg border border-slate-300 text-[11px] font-bold focus:outline-none"
                      >
                        <option value="PENDING">🟢 File Received</option>
                        <option value="PRINTING">🟡 Printing</option>
                        <option value="BINDING">🟠 Binding</option>
                        <option value="READY">🔵 Ready for Pickup</option>
                        <option value="DELIVERED">✅ Delivered</option>
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={`/admin/billing/new?name=${encodeURIComponent(ord.customerName)}&mobile=${encodeURIComponent(ord.customerMobile)}&service=${encodeURIComponent(ord.serviceType)}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 shadow-sm"
                      >
                        Generate Bill <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
