import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Generate sequential invoice number (e.g., BB/2026-27/0001)
async function generateInvoiceNumber(): Promise<string> {
  const date = new Date();
  const currentYear = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 3 = April
  
  // Financial Year in India (April to March)
  let fyStart = month >= 3 ? currentYear : currentYear - 1;
  let fyEnd = fyStart + 1;
  const fyString = `${fyStart}-${fyEnd.toString().slice(-2)}`;

  const prefix = `BB/${fyString}/`;

  const count = await prisma.invoice.count({
    where: {
      invoiceNo: {
        startsWith: prefix,
      },
    },
  });

  const nextSeq = (count + 1).toString().padStart(4, '0');
  return `${prefix}${nextSeq}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { invoiceNo: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { mobile: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerMobile,
      customerEmail,
      customerAddress,
      customerGstin,
      customerState = 'Uttar Pradesh',
      items, // Array of { productId, name, hsnSac, qty, rate, taxRate }
      paymentMethod = 'CASH',
      paidAmount: rawPaidAmount,
      notes,
    } = body;

    if (!customerMobile || !customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Customer name, mobile and at least one item are required' }, { status: 400 });
    }

    // 1. Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { mobile: customerMobile },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          mobile: customerMobile,
          email: customerEmail || null,
          address: customerAddress || null,
          gstin: customerGstin || null,
          state: customerState,
        },
      });
    } else {
      // Update customer details if provided
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customerName,
          email: customerEmail || customer.email,
          address: customerAddress || customer.address,
          gstin: customerGstin || customer.gstin,
          state: customerState || customer.state,
        },
      });
    }

    // 2. Perform backend tax calculations
    const isInterState = customerState && customerState.toLowerCase() !== 'uttar pradesh';

    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const processedItems = items.map((item: any) => {
      const qty = Number(item.qty) || 1;
      const rate = Number(item.rate) || 0;
      const taxableAmount = qty * rate;
      const taxRate = Number(item.taxRate) || 18;

      let cgstRate = 0, cgstAmount = 0;
      let sgstRate = 0, sgstAmount = 0;
      let igstRate = 0, igstAmount = 0;

      if (isInterState) {
        igstRate = taxRate;
        igstAmount = (taxableAmount * igstRate) / 100;
      } else {
        cgstRate = taxRate / 2;
        cgstAmount = (taxableAmount * cgstRate) / 100;
        sgstRate = taxRate / 2;
        sgstAmount = (taxableAmount * sgstRate) / 100;
      }

      const itemTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount;

      subtotal += taxableAmount;
      totalCgst += cgstAmount;
      totalSgst += sgstAmount;
      totalIgst += igstAmount;

      return {
        productId: item.productId || null,
        name: item.name,
        hsnSac: item.hsnSac || '9989',
        qty,
        rate,
        taxableAmount,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        igstRate,
        igstAmount,
        totalAmount: itemTotal,
      };
    });

    const totalAmount = Math.round(subtotal + totalCgst + totalSgst + totalIgst);
    const paidAmount = rawPaidAmount !== undefined ? Number(rawPaidAmount) : totalAmount;
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    let invoiceStatus: 'PAID' | 'PARTIAL' | 'UNPAID' = 'PAID';
    if (dueAmount >= totalAmount) {
      invoiceStatus = 'UNPAID';
    } else if (dueAmount > 0) {
      invoiceStatus = 'PARTIAL';
    }

    // 3. Generate sequential invoice number
    const invoiceNo = await generateInvoiceNumber();

    // 4. Atomic Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Invoice
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNo,
          customerId: customer.id,
          subtotal,
          cgst: totalCgst,
          sgst: totalSgst,
          igst: totalIgst,
          totalAmount,
          paidAmount,
          dueAmount,
          status: invoiceStatus,
          paymentMethod: paymentMethod as any,
          notes,
          items: {
            create: processedItems,
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });

      // Record Payment if paidAmount > 0
      if (paidAmount > 0) {
        await tx.payment.create({
          data: {
            invoiceId: newInvoice.id,
            customerId: customer.id,
            amount: paidAmount,
            paymentMethod: paymentMethod as any,
            notes: `Initial payment for invoice ${invoiceNo}`,
          },
        });
      }

      // Update customer stats & outstanding
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          totalOrders: { increment: 1 },
          totalPurchase: { increment: totalAmount },
          outstandingBalance: { increment: dueAmount },
        },
      });

      // Deduct inventory stock for services/products linked to inventory items
      for (const item of items) {
        if (item.productId) {
          const product = await tx.productService.findUnique({
            where: { id: item.productId },
            include: { inventoryItem: true },
          });

          if (product?.inventoryItemId) {
            const qtyDeducted = Number(item.qty) || 1;

            await tx.inventoryItem.update({
              where: { id: product.inventoryItemId },
              data: {
                currentStock: { decrement: qtyDeducted },
              },
            });

            await tx.inventoryTransaction.create({
              data: {
                inventoryItemId: product.inventoryItemId,
                type: 'OUT',
                quantity: qtyDeducted,
                referenceType: 'BILL',
                referenceId: newInvoice.id,
                notes: `Stock deducted for invoice ${invoiceNo}`,
              },
            });
          }
        }
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: 'INVOICE_CREATED',
          entity: 'Invoice',
          entityId: newInvoice.id,
          details: `Invoice ${invoiceNo} generated for ${customer.name} totaling ₹${totalAmount}`,
        },
      });

      return newInvoice;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: error.message || 'Failed to create invoice' }, { status: 500 });
  }
}
