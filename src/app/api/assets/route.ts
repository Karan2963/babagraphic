import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        maintenanceLogs: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { assetCode: 'asc' },
    });

    const totalAssetValue = assets.reduce((sum, a) => sum + a.purchasePrice, 0);
    const workingCount = assets.filter((a) => a.status === 'WORKING').length;
    const maintenanceCount = assets.filter((a) => a.status === 'MAINTENANCE').length;
    const damagedCount = assets.filter((a) => a.status === 'DAMAGED').length;

    return NextResponse.json({
      assets,
      stats: {
        totalAssetValue,
        workingCount,
        maintenanceCount,
        damagedCount,
        totalAssets: assets.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      purchaseDate,
      purchasePrice,
      supplierName,
      serialNumber,
      location = 'Shop',
      status = 'WORKING',
      warrantyExpiryDate,
    } = body;

    if (!name || !category || purchasePrice === undefined) {
      return NextResponse.json({ error: 'Name, category and purchase price required' }, { status: 400 });
    }

    // Generate Asset Code (AST-001, AST-002...)
    const count = await prisma.asset.count();
    const assetCode = `AST-${(count + 1).toString().padStart(3, '0')}`;

    const asset = await prisma.asset.create({
      data: {
        assetCode,
        name,
        category,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        purchasePrice: Number(purchasePrice),
        supplierName: supplierName || null,
        serialNumber: serialNumber || null,
        location,
        status: status as any,
        warrantyExpiryDate: warrantyExpiryDate ? new Date(warrantyExpiryDate) : null,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: error.message || 'Failed to create asset' }, { status: 500 });
  }
}

// Add maintenance log to asset
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { assetId, description, cost, performedBy, status } = body;

    if (!assetId || !description || cost === undefined) {
      return NextResponse.json({ error: 'Asset ID, description and cost required' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const maintenance = await tx.assetMaintenance.create({
        data: {
          assetId,
          description,
          cost: Number(cost),
          performedBy: performedBy || null,
        },
      });

      if (status) {
        await tx.asset.update({
          where: { id: assetId },
          data: { status: status as any },
        });
      }

      // Also record as business expense if cost > 0
      if (Number(cost) > 0) {
        await tx.expense.create({
          data: {
            category: 'Maintenance',
            title: `Asset Maintenance: ${description}`,
            amount: Number(cost),
            notes: `Auto-recorded from asset maintenance log for asset ID ${assetId}`,
          },
        });
      }

      return maintenance;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error recording asset maintenance:', error);
    return NextResponse.json({ error: error.message || 'Failed to record maintenance' }, { status: 500 });
  }
}
