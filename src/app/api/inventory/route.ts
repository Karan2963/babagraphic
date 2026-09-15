import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const lowStockOnly = searchParams.get('lowStock') === 'true';

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }

    let items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    if (lowStockOnly) {
      items = items.filter((item) => item.currentStock <= item.minStockAlert);
    }

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, unit, currentStock, minStockAlert, costPrice, sellingPrice } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.upsert({
      where: { name },
      update: {
        category,
        unit: unit || 'Sheets',
        currentStock: currentStock !== undefined ? Number(currentStock) : undefined,
        minStockAlert: minStockAlert !== undefined ? Number(minStockAlert) : undefined,
        costPrice: costPrice !== undefined ? Number(costPrice) : undefined,
        sellingPrice: sellingPrice !== undefined ? Number(sellingPrice) : undefined,
      },
      create: {
        name,
        category,
        unit: unit || 'Sheets',
        currentStock: Number(currentStock) || 0,
        minStockAlert: Number(minStockAlert) || 10,
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('Error saving inventory item:', error);
    return NextResponse.json({ error: error.message || 'Failed to save inventory item' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, adjustmentQty, type, notes } = body;

    if (!id || adjustmentQty === undefined) {
      return NextResponse.json({ error: 'Item ID and adjustment quantity required' }, { status: 400 });
    }

    const qty = Number(adjustmentQty);
    const stockType = type || (qty >= 0 ? 'IN' : 'OUT');

    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.update({
        where: { id },
        data: {
          currentStock: { increment: qty },
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          inventoryItemId: id,
          type: stockType as any,
          quantity: Math.abs(qty),
          referenceType: 'MANUAL',
          notes: notes || 'Manual stock adjustment',
        },
      });

      return item;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error adjusting inventory:', error);
    return NextResponse.json({ error: error.message || 'Failed to adjust stock' }, { status: 500 });
  }
}
