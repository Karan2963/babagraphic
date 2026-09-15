import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(purchases);
  } catch (error: any) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supplierId, supplierInvoiceNo, date, items, paidAmount: rawPaidAmount } = body;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Supplier ID and purchase items are required' }, { status: 400 });
    }

    let totalAmount = 0;
    const processedItems = items.map((item: any) => {
      const qty = Number(item.qty) || 1;
      const unitPrice = Number(item.unitPrice) || 0;
      const taxAmount = Number(item.taxAmount) || 0;
      const itemTotal = qty * unitPrice + taxAmount;
      totalAmount += itemTotal;

      return {
        inventoryItemId: item.inventoryItemId,
        qty,
        unitPrice,
        taxAmount,
        totalAmount: itemTotal,
      };
    });

    const paidAmount = rawPaidAmount !== undefined ? Number(rawPaidAmount) : totalAmount;
    const dueAmount = Math.max(0, totalAmount - paidAmount);
    const purchaseStatus = dueAmount === 0 ? 'PAID' : dueAmount === totalAmount ? 'UNPAID' : 'PARTIAL';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase record
      const purchase = await tx.purchase.create({
        data: {
          supplierId,
          supplierInvoiceNo: supplierInvoiceNo || null,
          date: date ? new Date(date) : new Date(),
          totalAmount,
          paidAmount,
          dueAmount,
          status: purchaseStatus,
          items: {
            create: processedItems,
          },
        },
        include: {
          items: true,
          supplier: true,
        },
      });

      // 2. Update Supplier total purchases & outstanding
      await tx.supplier.update({
        where: { id: supplierId },
        data: {
          totalPurchases: { increment: totalAmount },
          outstandingBalance: { increment: dueAmount },
        },
      });

      // 3. Automatically Replenish Inventory Stock!
      for (const item of processedItems) {
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            currentStock: { increment: item.qty },
            costPrice: item.unitPrice, // Update cost price to latest purchase rate
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            inventoryItemId: item.inventoryItemId,
            type: 'IN',
            quantity: item.qty,
            referenceType: 'PURCHASE',
            referenceId: purchase.id,
            notes: `Stock replenished from Supplier Invoice ${supplierInvoiceNo || purchase.id}`,
          },
        });
      }

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'PURCHASE_ENTRY',
          entity: 'Purchase',
          entityId: purchase.id,
          details: `Purchase of ₹${totalAmount} recorded from supplier ${purchase.supplier.name}`,
        },
      });

      return purchase;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error recording purchase:', error);
    return NextResponse.json({ error: error.message || 'Failed to record purchase' }, { status: 500 });
  }
}
