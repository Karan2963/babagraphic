'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, CheckCircle2, FileText, ArrowLeft, Loader2 } from 'lucide-react';

export default function PublicOrderPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerMobile: '',
    customerEmail: '',
    serviceType: 'Thesis Hard Binding & Printing',
    instructions: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('file', selectedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      setFileUrl(json.url);
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err.message || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerMobile) {
      setError('Please provide your name and mobile number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/online-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fileUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit order');

      setSubmittedOrder(json);
    } catch (err: any) {
      console.error('Order submission error:', err);
      setError(err.message || 'Failed to submit order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h1 className="text-2xl font-black text-slate-900">Upload PDF & Order Online</h1>
            <p className="text-xs text-slate-500 mt-1">
              Upload your thesis or document PDF. We will print and bind it according to your specifications.
            </p>
          </div>

          {submittedOrder ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h2>
              <p className="text-sm font-bold text-blue-600 mt-1">Order Tracking ID: {submittedOrder.orderNo}</p>
              <p className="text-xs text-slate-600 mt-3 max-w-md mx-auto">
                Thank you <strong>{submittedOrder.customerName}</strong>! Our shop team will process your order shortly. You can pay when picking up at BABA BOOK BINDING or via UPI.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setSubmittedOrder(null);
                    setFile(null);
                    setFileUrl('');
                  }}
                  className="bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-slate-800 transition"
                >
                  Submit Another Order
                </button>
                <a
                  href={`https://wa.me/916306474331?text=Hi%20Baba%20Book%20Binding,%20I%20just%20placed%20Order%20${submittedOrder.orderNo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-emerald-600 transition"
                >
                  Contact on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Kumar"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.customerMobile}
                    onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Required</label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Thesis Hard Binding & Printing">Thesis Hard Binding & Printing (Gold Foil Title)</option>
                  <option value="Spiral Binding & Printing">Spiral Binding & Printing</option>
                  <option value="Color Printing Only">Color Printing Only</option>
                  <option value="Black & White Xerox/Print">Black & White Xerox / Printing</option>
                  <option value="Soft Cover / Tape Binding">Soft Cover / Tape Binding</option>
                  <option value="Custom Graphic Design">Custom Graphic Design & Typesetting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Upload Document (PDF/Doc/Zip)</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.zip,.jpg,.png"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                      <p className="text-xs font-semibold text-slate-600">Uploading file to Cloudinary...</p>
                    </div>
                  ) : fileUrl ? (
                    <div className="flex flex-col items-center">
                      <FileText className="w-8 h-8 text-emerald-600 mb-2" />
                      <p className="text-xs font-bold text-emerald-700">{file?.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Uploaded securely to Cloudinary</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-700">Click or drag file to upload</p>
                      <p className="text-[10px] text-slate-500 mt-1">Supports PDF, DOCX, ZIP up to 50MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Custom Instructions (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Specify number of copies, cover color (e.g. Maroon/Navy Blue), gold embossing text, single/double sided printing..."
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Order'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
