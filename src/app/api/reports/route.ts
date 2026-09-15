import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month'; // today, week, month, year

    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (range === 'today') {
      // startDate is already today 00:00
    } else if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      startDate.setDate(1); // 1st of current month
    } else if (range === 'year') {
      startDate.setMonth(0, 1); // Jan 1st of current year
    }

    // 1. Invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: true,
      },
    });

    const totalSales = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalReceived = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalPending = invoices.reduce((sum, i) => sum + i.dueAmount, 0);
    const totalTaxable = invoices.reduce((sum, i) => sum + i.subtotal, 0);
    const totalCGST = invoices.reduce((sum, i) => sum + i.cgst, 0);
    const totalSGST = invoices.reduce((sum, i) => sum + i.sgst, 0);
    const totalIGST = invoices.reduce((sum, i) => sum + i.igst, 0);

    // 2. Expenses
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: startDate },
      },
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 3. Purchases
    const purchases = await prisma.purchase.findMany({
      where: {
        date: { gte: startDate },
      },
    });
    const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

    // Estimated Net Profit = Total Sales (excluding GST) - Total Expenses - Total Purchases
    const netProfit = totalTaxable - totalExpenses;

    // 4. Service / Product sales breakdown
    const serviceMap: { [key: string]: { name: string; qty: number; revenue: number } } = {};
    for (const inv of invoices) {
      for (const item of inv.items) {
        if (!serviceMap[item.name]) {
          serviceMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
        }
        serviceMap[item.name].qty += item.qty;
        serviceMap[item.name].revenue += item.totalAmount;
      }
    }
    const serviceBreakdown = Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue);

    // 5. Total Customer Outstanding
    const customers = await prisma.customer.aggregate({
      _sum: {
        outstandingBalance: true,
      },
    });
    const overallOutstanding = customers._sum.outstandingBalance || 0;

    return NextResponse.json({
      range,
      summary: {
        totalSales,
        totalReceived,
        totalPending,
        totalTaxable,
        totalCGST,
        totalSGST,
        totalIGST,
        totalExpenses,
        totalPurchases,
        netProfit,
        overallOutstanding,
        invoiceCount: invoices.length,
      },
      serviceBreakdown,
      recentInvoices: invoices.slice(0, 10),
    });
  } catch (error: any) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate report' }, { status: 500 });
  }
}
