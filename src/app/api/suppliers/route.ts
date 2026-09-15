import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        purchases: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(suppliers);
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, mobile, email, address, gstin } = body;

    if (!name) {
      return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        mobile: mobile || null,
        email: email || null,
        address: address || null,
        gstin: gstin || null,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: error.message || 'Failed to create supplier' }, { status: 500 });
  }
}
