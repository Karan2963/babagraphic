'use client';

import React from 'react';
import { numberToWordsIndian } from '@/lib/numberToWords';

export interface InvoiceItem {
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
  unit?: string;
}

export interface GSTInvoiceProps {
  invoice: {
    id?: string;
    invoiceNo: string;
    date: string | Date;
    dueDate?: string | Date | null;
    paymentMethod?: string;
    status?: string;
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    notes?: string | null;
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

function formatInvoiceDate(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '07-Oct-2026';
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return '07-Oct-2026';
  }
}

// Extracts clean numeric number from invoice string e.g. "BB/2026-27/0003" -> "3"
function getDisplayInvoiceNo(invNo: string): string {
  if (!invNo) return '1';
  const match = invNo.match(/(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    return isNaN(num) ? invNo : String(num);
  }
  return invNo;
}

export default function GSTInvoicePrint({ invoice }: GSTInvoiceProps) {
  const formattedDate = formatInvoiceDate(invoice.date);
  const displayNo = getDisplayInvoiceNo(invoice.invoiceNo);
  const supplierRef = displayNo.padStart(2, '0');

  // Calculate total quantity string (e.g. "200 g" or "100 Nos")
  const totalQtyCount = invoice.items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  const defaultUnit = invoice.items[0]?.unit || 'Nos';

  // Total taxes calculation across all items
  const totalCgstAmount =
    invoice.cgst > 0 ? invoice.cgst : invoice.items.reduce((sum, it) => sum + (it.cgstAmount || 0), 0);
  const totalSgstAmount =
    invoice.sgst > 0 ? invoice.sgst : invoice.items.reduce((sum, it) => sum + (it.sgstAmount || 0), 0);
  const totalIgstAmount =
    invoice.igst > 0 ? invoice.igst : invoice.items.reduce((sum, it) => sum + (it.igstAmount || 0), 0);

  const cgstRate =
    invoice.items[0]?.cgstRate || (invoice.subtotal > 0 ? Math.round((totalCgstAmount / invoice.subtotal) * 100) : 9);
  const sgstRate =
    invoice.items[0]?.sgstRate || (invoice.subtotal > 0 ? Math.round((totalSgstAmount / invoice.subtotal) * 100) : 9);
  const igstRate =
    invoice.items[0]?.igstRate || (invoice.subtotal > 0 ? Math.round((totalIgstAmount / invoice.subtotal) * 100) : 18);

  // Parse buyer address into multiple lines like the photo
  const buyerAddressLines: string[] = [];
  if (invoice.customer.address) {
    const parts = invoice.customer.address.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    buyerAddressLines.push(...parts);
  }

  return (
    <div className="w-full flex justify-center bg-slate-100 py-6 px-2 print:p-0 print:bg-white">
      <div
        id="printable-gst-invoice"
        className="w-full max-w-[800px] bg-white text-black text-xs font-sans border-2 border-black print:border-2 print:border-black shadow-lg print:shadow-none print:m-0 print:max-w-none print:w-full"
        style={{ color: '#000', fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        {/* ================= INVOICE TITLE ================= */}
        <div className="text-center font-bold text-sm tracking-widest py-1.5 border-b border-black uppercase">
          INVOICE
        </div>

        {/* ================= TWO-COLUMN HEADER (BABA BOOK BINDING vs INVOICE META) ================= */}
        <div className="grid grid-cols-2 border-b border-black">
          {/* LEFT HALF: BABA BOOK BINDING & BUYER */}
          <div className="border-r border-black flex flex-col justify-between">
            {/* Shop Details */}
            <div className="p-2.5 space-y-0.5 leading-tight">
              <div className="font-extrabold text-xs tracking-wide">BABA BOOK BINDING</div>
              <div>B30/25 MADO MARKET LANKA</div>
              <div className="font-semibold">GST NO 09BTDPY1262P1ZX</div>
              <div className="font-semibold">IFC CODE HDFC0003945</div>
              <div className="font-semibold">A/C NO 50200098276100</div>
            </div>

            {/* Buyer Section */}
            <div className="border-t border-black p-2.5 min-h-[140px] flex flex-col justify-between leading-tight">
              <div>
                <div className="text-[10px] text-slate-600 mb-1">Buyer</div>
                <div className="font-bold text-xs uppercase">{invoice.customer.name}</div>
                {buyerAddressLines.length > 0 ? (
                  buyerAddressLines.map((line, i) => (
                    <div key={i} className="text-xs uppercase">
                      {line}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="text-xs uppercase">DEPARTMENT OF PHYSICS</div>
                    <div className="text-xs uppercase">BANARAS HINDU UNIVERSITY</div>
                    <div className="text-xs uppercase">VARANASI</div>
                  </>
                )}
                {invoice.customer.mobile && (
                  <div className="text-[11px] mt-0.5">Mobile: +91 {invoice.customer.mobile}</div>
                )}
              </div>
              {invoice.customer.gstin && (
                <div className="font-semibold text-[11px] pt-1">GSTIN: {invoice.customer.gstin}</div>
              )}
            </div>
          </div>

          {/* RIGHT HALF: ORDER & DISPATCH DETAILS TABLE */}
          <div className="flex flex-col">
            {/* Row 1: Invoice No & Dated */}
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black">
                <span className="text-[10px] text-slate-600 block">Invoice No.</span>
                <span className="font-bold text-xs">{displayNo}</span>
              </div>
              <div className="p-1.5">
                <span className="text-[10px] text-slate-600 block">Dated</span>
                <span className="font-bold text-xs">{formattedDate}</span>
              </div>
            </div>

            {/* Row 2: Delivery Note & Mode/Terms of Payment */}
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black min-h-[30px]">
                <span className="text-[10px] text-slate-600 block">Delivery Note</span>
              </div>
              <div className="p-1.5 min-h-[30px]">
                <span className="text-[10px] text-slate-600 block">Mode/Terms of Payment</span>
                <span className="text-xs font-semibold">{invoice.paymentMethod || 'Cash'}</span>
              </div>
            </div>

            {/* Row 3: Supplier's Ref & Other Reference */}
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black">
                <span className="text-[10px] text-slate-600 block">Supplier's Ref.</span>
                <span className="font-bold text-xs">{supplierRef}</span>
              </div>
              <div className="p-1.5">
                <span className="text-[10px] text-slate-600 block">Other Reference(s)</span>
              </div>
            </div>

            {/* Row 4: Buyer's Order No & Dated */}
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black min-h-[28px]">
                <span className="text-[10px] text-slate-600 block">Buyer's Order No.</span>
              </div>
              <div className="p-1.5 min-h-[28px]">
                <span className="text-[10px] text-slate-600 block">Dated</span>
              </div>
            </div>

            {/* Row 5: Despatch Document No & Delivery Note Date */}
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black min-h-[28px]">
                <span className="text-[10px] text-slate-600 block">Despatch Document No.</span>
              </div>
              <div className="p-1.5 min-h-[28px]">
                <span className="text-[10px] text-slate-600 block">Delivery Note Date</span>
              </div>
            </div>

            {/* Row 6: Despatched through & Destination */}
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black min-h-[28px]">
                <span className="text-[10px] text-slate-600 block">Despatched through</span>
                <span className="text-xs">Hand Delivery</span>
              </div>
              <div className="p-1.5 min-h-[28px]">
                <span className="text-[10px] text-slate-600 block">Destination</span>
                <span className="text-xs">Varanasi</span>
              </div>
            </div>

            {/* Row 7: Terms of Delivery */}
            <div className="p-1.5 min-h-[36px]">
              <span className="text-[10px] text-slate-600 block">Terms of Delivery</span>
            </div>
          </div>
        </div>

        {/* ================= ITEMS TABLE ================= */}
        <div className="relative">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-black text-[11px] font-bold">
                <th className="w-[6%] py-1.5 px-1 border-r border-black text-center font-bold">Sl No.</th>
                <th className="w-[48%] py-1.5 px-2 border-r border-black text-center font-bold">Description of Goods</th>
                <th className="w-[14%] py-1.5 px-2 border-r border-black text-center font-bold">Quantity</th>
                <th className="w-[11%] py-1.5 px-2 border-r border-black text-center font-bold">Rate</th>
                <th className="w-[8%] py-1.5 px-1 border-r border-black text-center font-bold">per</th>
                <th className="w-[13%] py-1.5 px-2 text-center font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {/* STEP 1: RENDER ALL BILLED ITEMS FIRST */}
              {invoice.items.map((item, idx) => {
                const itemUnit = item.unit || 'Nos';

                return (
                  <tr key={idx}>
                    <td className="py-1 px-1 border-r border-black text-center font-medium">{idx + 1}</td>
                    <td className="py-1 px-2 border-r border-black font-bold uppercase">{item.name}</td>
                    <td className="py-1 px-2 border-r border-black text-right font-medium">
                      {item.qty} {itemUnit}
                    </td>
                    <td className="py-1 px-2 border-r border-black text-right font-medium">{item.rate.toFixed(0)}</td>
                    <td className="py-1 px-1 border-r border-black text-center uppercase text-[11px]">{itemUnit}</td>
                    <td className="py-1 px-2 text-right font-bold">{item.taxableAmount.toFixed(0)}</td>
                  </tr>
                );
              })}

              {/* STEP 2: AFTER ADDING ALL BILL ITEMS, ADD CGST & SGST (OR IGST) */}
              {totalCgstAmount > 0 && totalSgstAmount > 0 && totalIgstAmount === 0 && (
                <>
                  <tr>
                    <td className="py-0.5 px-1 border-r border-black"></td>
                    <td className="py-0.5 px-2 border-r border-black font-bold italic text-right pr-6">
                      CGST @{cgstRate}%
                    </td>
                    <td className="py-0.5 px-2 border-r border-black"></td>
                    <td className="py-0.5 px-2 border-r border-black text-right">{cgstRate} %</td>
                    <td className="py-0.5 px-1 border-r border-black"></td>
                    <td className="py-0.5 px-2 text-right font-bold">{totalCgstAmount.toFixed(0)}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-1 border-r border-black"></td>
                    <td className="py-0.5 px-2 border-r border-black font-bold italic text-right pr-6">
                      SGST @{sgstRate}%
                    </td>
                    <td className="py-0.5 px-2 border-r border-black"></td>
                    <td className="py-0.5 px-2 border-r border-black text-right">{sgstRate} %</td>
                    <td className="py-0.5 px-1 border-r border-black"></td>
                    <td className="py-0.5 px-2 text-right font-bold">{totalSgstAmount.toFixed(0)}</td>
                  </tr>
                </>
              )}

              {totalIgstAmount > 0 && (
                <tr>
                  <td className="py-0.5 px-1 border-r border-black"></td>
                  <td className="py-0.5 px-2 border-r border-black font-bold italic text-right pr-6">
                    IGST @{igstRate}%
                  </td>
                  <td className="py-0.5 px-2 border-r border-black"></td>
                  <td className="py-0.5 px-2 border-r border-black text-right">{igstRate} %</td>
                  <td className="py-0.5 px-1 border-r border-black"></td>
                  <td className="py-0.5 px-2 text-right font-bold">{totalIgstAmount.toFixed(0)}</td>
                </tr>
              )}

              {/* Empty Spacer Row to match the tall authentic paper invoice */}
              <tr>
                <td className="h-28 border-r border-black"></td>
                <td className="h-28 border-r border-black"></td>
                <td className="h-28 border-r border-black"></td>
                <td className="h-28 border-r border-black"></td>
                <td className="h-28 border-r border-black"></td>
                <td className="h-28"></td>
              </tr>
            </tbody>

            {/* TOTAL ROW */}
            <tfoot>
              <tr className="border-t border-b border-black font-bold text-xs">
                <td className="py-1 px-1 border-r border-black"></td>
                <td className="py-1 px-2 border-r border-black text-right font-bold">Total</td>
                <td className="py-1 px-2 border-r border-black text-right font-bold">
                  {totalQtyCount} {defaultUnit}
                </td>
                <td className="py-1 px-2 border-r border-black"></td>
                <td className="py-1 px-1 border-r border-black"></td>
                <td className="py-1 px-2 text-right font-bold">₹{invoice.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* E. & O.E Line */}
        <div className="flex justify-end px-3 py-0.5 text-[10px] font-semibold">
          E. & O.E
        </div>

        {/* ================= AMOUNT IN WORDS ================= */}
        <div className="border-t border-black px-3 py-2 leading-snug">
          <div className="text-[10px] text-slate-700">Amount Chargeable (in words)</div>
          <div className="font-bold text-xs uppercase tracking-wide">
            {numberToWordsIndian(invoice.totalAmount)}
          </div>
        </div>

        {/* ================= DECLARATION & SIGNATORY SECTION ================= */}
        <div className="grid grid-cols-12 border-t border-black">
          {/* Left Declaration Box */}
          <div className="col-span-7 p-3 border-r border-black flex flex-col justify-between">
            <div>
              <div className="font-bold text-[10px] underline mb-1">Declaration:</div>
              <p className="text-[10px] leading-relaxed text-slate-700">
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </p>
            </div>
            <div className="text-[9px] text-slate-400 mt-4">
              Baba Book Binding • Varanasi
            </div>
          </div>

          {/* Right Signature Box: EMPTY SPACE FOR REAL PHYSICAL STAMP & SIGNATURE */}
          <div className="col-span-5 p-3 flex flex-col justify-between min-h-[140px]">
            <div className="text-right font-bold text-xs">
              for BABA BOOK BINDING
            </div>

            {/* Generous blank space for physical rubber stamp and signature */}
            <div className="h-24 min-h-[85px] flex items-center justify-center">
              {/* Left empty as requested so you can stamp your physical seal and sign */}
            </div>

            <div className="text-right text-[10px] font-semibold text-slate-700">
              Authorised Signatory
            </div>
          </div>
        </div>

        {/* ================= BOTTOM NOTICE ================= */}
        <div className="text-center py-1 border-t border-black text-[10px] text-slate-600 bg-white">
          This is a Computer Generated Invoice
        </div>
      </div>
    </div>
  );
}
