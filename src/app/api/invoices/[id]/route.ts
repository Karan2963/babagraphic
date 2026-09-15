import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Error fetching invoice details:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch invoice' }, { status: 500 });
  }
}

// Cancel invoice (with audit trail)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reason } = await request.json().catch(() => ({ reason: 'Cancelled by admin' }));

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Invoice is already cancelled' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Mark status as CANCELLED
      const cancelledInvoice = await tx.invoice.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          dueAmount: 0,
        },
      });

      // 2. Adjust customer balance
      if (invoice.dueAmount > 0) {
        await tx.customer.update({
          where: { id: invoice.customerId },
          data: {
            outstandingBalance: { decrement: invoice.dueAmount },
          },
        });
      }

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          action: 'INVOICE_CANCELLED',
          entity: 'Invoice',
          entityId: id,
          details: `Invoice ${invoice.invoiceNo} cancelled. Reason: ${reason}`,
        },
      });

      return cancelledInvoice;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error cancelling invoice:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel invoice' }, { status: 500 });
  }
}
