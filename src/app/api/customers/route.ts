import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const id = searchParams.get('id');

    if (id) {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
          payments: {
            orderBy: { paymentDate: 'desc' },
            take: 20,
          },
        },
      });
      return NextResponse.json(customer);
    }

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, mobile, email, address, gstin, state } = body;

    if (!name || !mobile) {
      return NextResponse.json({ error: 'Name and mobile number are required' }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({ where: { mobile } });
    if (existing) {
      const updated = await prisma.customer.update({
        where: { id: existing.id },
        data: { name, email, address, gstin, state },
      });
      return NextResponse.json(updated);
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email: email || null,
        address: address || null,
        gstin: gstin || null,
        state: state || 'Uttar Pradesh',
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: error.message || 'Failed to create customer' }, { status: 500 });
  }
}
