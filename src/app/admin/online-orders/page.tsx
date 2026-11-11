'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  FileText,
  Download,
  CheckCircle2,
  ArrowRight,
  Clock,
  ExternalLink,
  Palette,
  Upload,
  MessageCircle,
  Eye,
  X,
  Truck,
  Sparkles,
} from 'lucide-react';

export default function OnlineOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBriefOrder, setSelectedBriefOrder] = useState<any>(null);

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

  const parseDesignBrief = (brief: string | null) => {
    if (!brief) return null;
    try {
      return JSON.parse(brief);
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">ONLINE ORDER QUEUE</h1>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
              Web & Design Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Customer Design Uploads, Custom Artwork Requests & 1-Click Invoice Generation
          </p>
        </div>

        <Link
          href="/printing"
          target="_blank"
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ExternalLink className="w-3.5 h-3.5" /> View Public Storefront
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <p className="text-xs text-slate-500 py-8 text-center font-bold">Loading online orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center font-bold">No online customer orders in queue.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3.5 rounded-l-xl">Order No</th>
                  <th className="p-3.5">Customer & Phone</th>
                  <th className="p-3.5">Order Type & Service</th>
                  <th className="p-3.5">Qty & Paper</th>
                  <th className="p-3.5">Artwork / Brief</th>
                  <th className="p-3.5">Total (₹)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((ord) => {
                  const isDesignRequest = ord.orderType === 'DESIGN_AND_PRINT';
                  const brief = parseDesignBrief(ord.designBrief);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50 transition">
                      {/* Order No & Date */}
                      <td className="p-3.5">
                        <span className="font-bold text-blue-900 font-mono block">{ord.orderNo}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Customer Details & WhatsApp */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{ord.customerName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-slate-600 font-mono text-[11px]">+91 {ord.customerMobile}</span>
                          <a
                            href={`https://wa.me/91${ord.customerMobile.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(ord.customerName)},%20this%20is%20Baba%20Graphics%20regarding%20your%20Order%20${ord.orderNo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-emerald-100" />
                          </a>
                        </div>
                      </td>

                      {/* Service & Order Type Badge */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 text-xs">{ord.serviceType}</div>
                        <div className="mt-1 flex items-center gap-1">
                          {isDesignRequest ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <Palette className="w-3 h-3" /> Create Design & Print
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <Upload className="w-3 h-3" /> Customer File Print
                            </span>
                          )}
                          {ord.deliverySpeed === 'EXPRESS' && (
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                              ⚡ Express
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Qty & Paper */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{ord.quantity || 1} Units</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{ord.paperType || 'Standard Paper'}</div>
                      </td>

                      {/* File / Design Brief Preview */}
                      <td className="p-3.5">
                        {isDesignRequest ? (
                          <div className="space-y-1">
                            <button
                              onClick={() => setSelectedBriefOrder(ord)}
                              className="text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> View Design Brief
                            </button>
                            {ord.referenceUrl && (
                              <a
                                href={ord.referenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 block text-[10px] underline font-bold"
                              >
                                View Logo/Ref
                              </a>
                            )}
                          </div>
                        ) : ord.fileUrl ? (
                          <a
                            href={ord.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg text-[11px]"
                          >
                            <FileText className="w-3 h-3" /> Download Artwork <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No file attached</span>
                        )}
                      </td>

                      {/* Estimated Total */}
                      <td className="p-3.5 font-black text-slate-900 text-sm">
                        {ord.totalAmount ? `₹${ord.totalAmount}` : 'Quote on call'}
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-3.5 text-center">
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="p-1.5 rounded-lg border border-slate-300 text-[11px] font-bold focus:outline-none"
                        >
                          <option value="PENDING">🟢 Order Received</option>
                          <option value="PRINTING">🟡 In Design / Printing</option>
                          <option value="BINDING">🟠 Binding / Finishing</option>
                          <option value="READY">🔵 Ready for Pickup</option>
                          <option value="DELIVERED">✅ Delivered</option>
                        </select>
                      </td>

                      {/* Quick Action: Generate Bill */}
                      <td className="p-3.5 text-center">
                        <Link
                          href={`/admin/billing/new?name=${encodeURIComponent(ord.customerName)}&mobile=${encodeURIComponent(ord.customerMobile)}&service=${encodeURIComponent(ord.serviceType)}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 shadow-sm whitespace-nowrap"
                        >
                          Bill <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW DESIGN BRIEF MODAL
         ========================================================================= */}
      {selectedBriefOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-slate-900">
                  Custom Design Brief - {selectedBriefOrder.orderNo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBriefOrder(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="font-bold text-slate-900">Customer: {selectedBriefOrder.customerName}</p>
                <p className="text-slate-600">WhatsApp: +91 {selectedBriefOrder.customerMobile}</p>
                <p className="text-slate-600">Product: {selectedBriefOrder.serviceType}</p>
              </div>

              {selectedBriefOrder.designBrief ? (
                (() => {
                  const b = parseDesignBrief(selectedBriefOrder.designBrief);
                  if (!b) return <p className="text-slate-600 whitespace-pre-wrap">{selectedBriefOrder.instructions}</p>;

                  return (
                    <div className="space-y-2 border border-amber-200 bg-amber-50/50 p-4 rounded-xl">
                      <div>
                        <span className="font-bold text-slate-700 block text-[10px] uppercase">
                          Business / Personal Name:
                        </span>
                        <span className="text-slate-900 font-black text-sm">{b.businessName || 'N/A'}</span>
                      </div>
                      {b.tagline && (
                        <div>
                          <span className="font-bold text-slate-700 block text-[10px] uppercase">Tagline / Subtext:</span>
                          <span className="text-slate-800 font-medium">{b.tagline}</span>
                        </div>
                      )}
                      {b.contactInfo && (
                        <div>
                          <span className="font-bold text-slate-700 block text-[10px] uppercase">Contact Details:</span>
                          <span className="text-slate-800 font-mono">{b.contactInfo}</span>
                        </div>
                      )}
                      {b.preferredColors && (
                        <div>
                          <span className="font-bold text-slate-700 block text-[10px] uppercase">Preferred Colors:</span>
                          <span className="text-slate-800 font-medium">{b.preferredColors}</span>
                        </div>
                      )}
                      {b.specialInstructions && (
                        <div>
                          <span className="font-bold text-slate-700 block text-[10px] uppercase">
                            Special Instructions:
                          </span>
                          <p className="text-slate-800 bg-white p-2 rounded-lg border border-slate-200 mt-0.5">
                            {b.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl whitespace-pre-wrap text-slate-700">
                  {selectedBriefOrder.instructions}
                </div>
              )}

              {selectedBriefOrder.referenceUrl && (
                <div className="pt-2">
                  <span className="font-bold text-slate-700 block text-[10px] uppercase mb-1">
                    Customer Logo / Reference File:
                  </span>
                  <a
                    href={selectedBriefOrder.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Customer File
                  </a>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-2">
              <a
                href={`https://wa.me/91${selectedBriefOrder.customerMobile.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(selectedBriefOrder.customerName)},%20we%20have%20started%20working%20on%20your%20design%20proof%20for%20order%20${selectedBriefOrder.orderNo}!`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Send Proof on WhatsApp
              </a>
              <button
                onClick={() => setSelectedBriefOrder(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
