import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeInactive = searchParams.get('all') === 'true';

    const whereClause: any = {};
    if (!includeInactive) {
      whereClause.isActive = true;
    }
    if (category && category !== 'All') {
      whereClause.category = category;
    }

    const products = await prisma.printProduct.findMany({
      where: whereClause,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching print products:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category,
      tagline,
      description,
      features,
      imageUrl,
      galleryImages,
      basePrice,
      unit,
      minQuantity,
      quantityTiers,
      paperOptions,
      sizeOptions,
      designFee,
      isFeatured,
      isActive,
    } = body;

    if (!title || !category || !imageUrl) {
      return NextResponse.json({ error: 'Title, category, and image URL are required' }, { status: 400 });
    }

    // Generate unique slug
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let count = 1;
    while (await prisma.printProduct.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const product = await prisma.printProduct.create({
      data: {
        title,
        slug,
        category,
        tagline: tagline || null,
        description: description || null,
        features: typeof features === 'string' ? features : JSON.stringify(features || []),
        imageUrl,
        galleryImages: typeof galleryImages === 'string' ? galleryImages : JSON.stringify(galleryImages || [imageUrl]),
        basePrice: parseFloat(basePrice) || 0,
        unit: unit || 'units',
        minQuantity: parseInt(minQuantity) || 10,
        quantityTiers: typeof quantityTiers === 'string' ? quantityTiers : JSON.stringify(quantityTiers || []),
        paperOptions: typeof paperOptions === 'string' ? paperOptions : JSON.stringify(paperOptions || []),
        sizeOptions: typeof sizeOptions === 'string' ? sizeOptions : JSON.stringify(sizeOptions || []),
        designFee: parseFloat(designFee) || 0,
        isFeatured: Boolean(isFeatured),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating print product:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
