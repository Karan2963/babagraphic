import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.productService.findMany({
      include: {
        inventoryItem: true,
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, hsnSac, unit, price, defaultTaxRate, inventoryItemId } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const product = await prisma.productService.upsert({
      where: { name },
      update: {
        type: type || 'SERVICE',
        hsnSac: hsnSac || '9989',
        unit: unit || 'Pages',
        price: Number(price),
        defaultTaxRate: Number(defaultTaxRate) || 18,
        inventoryItemId: inventoryItemId || null,
      },
      create: {
        name,
        type: type || 'SERVICE',
        hsnSac: hsnSac || '9989',
        unit: unit || 'Pages',
        price: Number(price),
        defaultTaxRate: Number(defaultTaxRate) || 18,
        inventoryItemId: inventoryItemId || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error saving product/service:', error);
    return NextResponse.json({ error: error.message || 'Failed to save product/service' }, { status: 500 });
  }
}
