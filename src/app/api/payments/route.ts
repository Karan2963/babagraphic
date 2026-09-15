import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        customer: true,
        invoice: true,
      },
      orderBy: { paymentDate: 'desc' },
      take: 100,
    });

    // Also calculate customer dues summary
    const customersWithDues = await prisma.customer.findMany({
      where: {
        outstandingBalance: { gt: 0 },
      },
      orderBy: { outstandingBalance: 'desc' },
    });

    const totalOutstanding = customersWithDues.reduce((sum, c) => sum + c.outstandingBalance, 0);

    return NextResponse.json({
      payments,
      customerDues: customersWithDues,
      totalOutstanding,
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, invoiceId, amount, paymentMethod = 'CASH', referenceNo, notes } = body;

    if (!customerId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Customer ID and valid amount are required' }, { status: 400 });
    }

    const payAmount = Number(amount);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          customerId,
          invoiceId: invoiceId || null,
          amount: payAmount,
          paymentMethod: paymentMethod as any,
          referenceNo: referenceNo || null,
          notes: notes || 'Received payment against outstanding dues',
        },
      });

      // 2. Reduce Customer Outstanding Balance
      await tx.customer.update({
        where: { id: customerId },
        data: {
          outstandingBalance: { decrement: payAmount },
        },
      });

      // 3. If invoice ID provided, update invoice paid/due amounts
      if (invoiceId) {
        const inv = await tx.invoice.findUnique({ where: { id: invoiceId } });
        if (inv) {
          const newPaid = inv.paidAmount + payAmount;
          const newDue = Math.max(0, inv.totalAmount - newPaid);
          const newStatus = newDue === 0 ? 'PAID' : 'PARTIAL';

          await tx.invoice.update({
            where: { id: invoiceId },
            data: {
              paidAmount: newPaid,
              dueAmount: newDue,
              status: newStatus as any,
            },
          });
        }
      }

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'PAYMENT_RECEIVED',
          entity: 'Payment',
          entityId: payment.id,
          details: `Payment of ₹${payAmount} received via ${paymentMethod} for customer ID ${customerId}`,
        },
      });

      return payment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ error: error.message || 'Failed to record payment' }, { status: 500 });
  }
}
