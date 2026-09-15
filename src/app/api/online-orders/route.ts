import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.onlineOrder.findMany({
      include: {
        customer: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching online orders:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch online orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerMobile, customerEmail, serviceType, instructions, fileUrl } = body;

    if (!customerName || !customerMobile || !serviceType) {
      return NextResponse.json({ error: 'Name, mobile and service type required' }, { status: 400 });
    }

    // Generate Order Number ORD-1001
    const count = await prisma.onlineOrder.count();
    const orderNo = `ORD-${(count + 1001).toString()}`;

    // Check if customer exists
    let customer = await prisma.customer.findUnique({ where: { mobile: customerMobile } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          mobile: customerMobile,
          email: customerEmail || null,
        },
      });
    }

    const order = await prisma.onlineOrder.create({
      data: {
        orderNo,
        customerId: customer.id,
        customerName,
        customerMobile,
        customerEmail: customerEmail || null,
        serviceType,
        instructions: instructions || null,
        fileUrl: fileUrl || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Error placing online order:', error);
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, invoiceId } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    const order = await prisma.onlineOrder.update({
      where: { id },
      data: {
        status: status as any,
        invoiceId: invoiceId || undefined,
      },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
  }
}
