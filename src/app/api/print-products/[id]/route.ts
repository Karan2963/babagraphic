import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const product = await prisma.printProduct.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const product = await prisma.printProduct.update({
      where: { id },
      data: {
        title: body.title,
        category: body.category,
        tagline: body.tagline,
        description: body.description,
        features: typeof body.features === 'string' ? body.features : JSON.stringify(body.features || []),
        imageUrl: body.imageUrl,
        galleryImages: typeof body.galleryImages === 'string' ? body.galleryImages : JSON.stringify(body.galleryImages || []),
        basePrice: parseFloat(body.basePrice) || 0,
        unit: body.unit || 'units',
        minQuantity: parseInt(body.minQuantity) || 10,
        quantityTiers: typeof body.quantityTiers === 'string' ? body.quantityTiers : JSON.stringify(body.quantityTiers || []),
        paperOptions: typeof body.paperOptions === 'string' ? body.paperOptions : JSON.stringify(body.paperOptions || []),
        sizeOptions: typeof body.sizeOptions === 'string' ? body.sizeOptions : JSON.stringify(body.sizeOptions || []),
        designFee: parseFloat(body.designFee) || 0,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.printProduct.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
