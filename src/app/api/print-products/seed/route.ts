import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const existingCount = await prisma.printProduct.count();
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    if (existingCount > 0 && !force) {
      return NextResponse.json({
        message: 'Products already exist. Pass ?force=true to re-seed or add more.',
        count: existingCount,
      });
    }

    if (force) {
      // Clear existing
      await prisma.printProduct.deleteMany();
    }

    const initialProducts = [
      {
        title: 'Letterheads',
        slug: 'letterheads',
        category: 'Stationery',
        tagline: 'Add a professional touch to every letter, invoice or quote.',
        description: 'Premium quality corporate and institutional letterheads printed on high-grade archival paper. Ideal for company correspondence, official proposals, medical prescriptions, and university applications.',
        features: JSON.stringify([
          'Size: 21.3 x 30 cm (A4 Standard)',
          'Full color high-resolution offset & digital printing',
          'Available in 120 gsm smooth finish matte paper and 100 gsm Excel Bond paper',
          'Acid-free paper for durability & archival quality',
          'Same Day Delivery available on select pin codes in Varanasi. Order before 12 noon for same day delivery.',
          'Sharp laser-grade text and vivid company logo rendering',
          'Guaranteed jam-free compatibility with all office laser and inkjet printers',
          'Cash on Delivery and instant UPI payment available',
        ]),
        imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80',
        galleryImages: JSON.stringify([
          'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=1000&q=80',
        ]),
        basePrice: 230,
        unit: 'units',
        minQuantity: 10,
        quantityTiers: JSON.stringify([
          { qty: 10, price: 230, perUnit: 23.0 },
          { qty: 50, price: 550, perUnit: 11.0 },
          { qty: 100, price: 850, perUnit: 8.5 },
          { qty: 250, price: 1650, perUnit: 6.6 },
          { qty: 500, price: 2600, perUnit: 5.2 },
          { qty: 1000, price: 4200, perUnit: 4.2 },
        ]),
        paperOptions: JSON.stringify([
          '120 GSM Smooth Finish Matte Paper',
          '100 GSM Excel Bond Premium Paper',
          '85 GSM Alabaster Executive White',
          '100 GSM Royal Linen Textured Paper',
        ]),
        sizeOptions: JSON.stringify(['A4 (21.3 x 30 cm)', 'Letter (21.6 x 27.9 cm)']),
        designFee: 199,
        rating: 4.7,
        reviewCount: 166,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Visiting Cards / Business Cards',
        slug: 'visiting-cards',
        category: 'Business Cards',
        tagline: 'Make an unforgettable first impression with velvet matte & UV visiting cards.',
        description: 'Sturdy 350 GSM luxury business cards with precision cutting, rounded corners, and rich true-to-life colors. Available in single or both side print.',
        features: JSON.stringify([
          'Standard Size: 3.5 x 2.0 inch (89 x 51 mm)',
          'Heavy 350 GSM premium imported art board',
          'Thermal Velvet Matte or Gloss lamination',
          'Single or double-sided full CMYK printing',
          'Optional Spot UV high-gloss coating on your logo',
          'Fast 24-hour turnaround in Varanasi',
        ]),
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80',
        galleryImages: JSON.stringify([
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
        ]),
        basePrice: 160,
        unit: 'cards',
        minQuantity: 100,
        quantityTiers: JSON.stringify([
          { qty: 100, price: 160, perUnit: 1.6 },
          { qty: 250, price: 340, perUnit: 1.36 },
          { qty: 500, price: 580, perUnit: 1.16 },
          { qty: 1000, price: 950, perUnit: 0.95 },
        ]),
        paperOptions: JSON.stringify([
          '350 GSM Velvet Matte Lamination',
          '300 GSM High Gloss Lamination',
          '350 GSM Metallic Pearl Finish',
          '300 GSM Textured Linen Card',
        ]),
        sizeOptions: JSON.stringify(['Standard (3.5 x 2.0 in)', 'Square (2.5 x 2.5 in)', 'Rounded Corners']),
        designFee: 149,
        rating: 4.9,
        reviewCount: 240,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Thesis Hard Binding & Gold Foil',
        slug: 'thesis-hard-binding',
        category: 'Thesis & Binding',
        tagline: 'BHU & Premier University standard thesis hard binding with gold foil embossing.',
        description: 'Varanasi’s most trusted thesis binding service. Gold embossing on front cover and spine with archival 100 GSM bond paper prints.',
        features: JSON.stringify([
          'Heavy-duty imported leatherette binding boards',
          'Crisp hot-stamp gold or silver foil lettering',
          'Custom University Logo embossing on front cover',
          '100 GSM super-bright bond paper printing',
          'Strong nylon thread sewing + library adhesive',
          'Strict compliance with BHU, IIT, and MGKVP guidelines',
        ]),
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
        galleryImages: JSON.stringify([
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80',
        ]),
        basePrice: 450,
        unit: 'books',
        minQuantity: 1,
        quantityTiers: JSON.stringify([
          { qty: 1, price: 450, perUnit: 450 },
          { qty: 3, price: 1200, perUnit: 400 },
          { qty: 5, price: 1850, perUnit: 370 },
          { qty: 10, price: 3400, perUnit: 340 },
        ]),
        paperOptions: JSON.stringify([
          'Royal Maroon Rexine + Gold Foil',
          'Navy Blue Rexine + Gold Foil',
          'Classic Black Rexine + Gold Foil',
          'Forest Green Rexine + Gold Foil',
        ]),
        sizeOptions: JSON.stringify(['A4 Standard Academic', 'Executive Bound']),
        designFee: 249,
        rating: 4.9,
        reviewCount: 312,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Promotional Flyers & Pamphlets',
        slug: 'promotional-flyers',
        category: 'Marketing',
        tagline: 'Vibrant full-color promotional flyers to announce offers and reach new customers.',
        description: 'High-speed color printing on 130 GSM or 170 GSM gloss art paper. Perfect for newspaper inserts, local distribution, and event hand-outs.',
        features: JSON.stringify([
          'Sizes: A5 (14.8 x 21 cm) and A4 (21 x 29.7 cm)',
          '130 GSM Gloss Art Paper with brilliant high-definition inks',
          'Single side or double-sided full color offset print',
          'Sharp photography and legible text down to 6pt fonts',
          'Bulk packaging in protective craft wrap',
        ]),
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80',
        galleryImages: JSON.stringify([
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80',
        ]),
        basePrice: 499,
        unit: 'flyers',
        minQuantity: 500,
        quantityTiers: JSON.stringify([
          { qty: 500, price: 499, perUnit: 0.998 },
          { qty: 1000, price: 850, perUnit: 0.85 },
          { qty: 2000, price: 1500, perUnit: 0.75 },
          { qty: 5000, price: 3200, perUnit: 0.64 },
        ]),
        paperOptions: JSON.stringify([
          '130 GSM Gloss Art Paper',
          '170 GSM Premium Gloss Art Paper',
          '100 GSM Maplitho Matte Paper',
        ]),
        sizeOptions: JSON.stringify(['A5 (Half A4)', 'A4 (Standard)', 'Pamphlet (1/3rd A4)']),
        designFee: 299,
        rating: 4.8,
        reviewCount: 95,
        isFeatured: false,
        isActive: true,
      },
      {
        title: 'Custom Flex Banners & Standees',
        slug: 'flex-banners-standees',
        category: 'Banners & Signs',
        tagline: 'Heavy-duty weatherproof flex banners for shops, coaching centres & events.',
        description: 'Outdoor and indoor flex printing with vibrant eco-solvent inks that withstand sun and rain. Includes brass eyelets on all borders.',
        features: JSON.stringify([
          'Premium 340 GSM Star Flex or Heavy 440 GSM Blackout Flex',
          'Eco-Solvent 1440 DPI photo-realistic printing',
          'Reinforced border folding and rust-proof brass eyelets',
          'Roll-up aluminum standees available on request',
          'Same day express printing & pickup in Lanka Varanasi',
        ]),
        imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1000&q=80',
        galleryImages: JSON.stringify([
          'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1000&q=80',
        ]),
        basePrice: 350,
        unit: 'banners',
        minQuantity: 1,
        quantityTiers: JSON.stringify([
          { qty: 1, price: 350, perUnit: 350 },
          { qty: 2, price: 650, perUnit: 325 },
          { qty: 5, price: 1500, perUnit: 300 },
          { qty: 10, price: 2800, perUnit: 280 },
        ]),
        paperOptions: JSON.stringify([
          'Star Flex 340 GSM (Heavy Duty)',
          'Regular Flex 280 GSM (Standard)',
          'Blackout Vinyl 440 GSM (Zero Transparency)',
        ]),
        sizeOptions: JSON.stringify(['6 x 3 feet', '8 x 4 feet', '10 x 5 feet', 'Roll-up Standee (6x3 ft)']),
        designFee: 199,
        rating: 4.8,
        reviewCount: 142,
        isFeatured: false,
        isActive: true,
      },
      {
        title: 'Bill Books & Invoice Receipt Pads',
        slug: 'bill-books-invoices',
        category: 'Stationery',
        tagline: 'Carbonless NCR duplicate and triplicate custom bill books for retail & wholesale.',
        description: 'Sequential red-ink numbered bill books with your business name, GST number, bank details, and logo. Bound with hardboard support.',
        features: JSON.stringify([
          'Duplicate (1+1) or Triplicate (1+2) auto-carbon transfer sheets',
          'Automatic sequential red machine numbering',
          'Perforated edge for smooth, clean tear',
          'Wrap-around cardboard separator flap included',
          'Personalized with your terms and GST layout',
        ]),
        imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        galleryImages: JSON.stringify([
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
        ]),
        basePrice: 480,
        unit: 'books',
        minQuantity: 5,
        quantityTiers: JSON.stringify([
          { qty: 5, price: 480, perUnit: 96 },
          { qty: 10, price: 850, perUnit: 85 },
          { qty: 20, price: 1550, perUnit: 77.5 },
        ]),
        paperOptions: JSON.stringify([
          'Duplicate NCR (White + Pink) 50 sets/book',
          'Triplicate NCR (White + Pink + Yellow) 50 sets/book',
        ]),
        sizeOptions: JSON.stringify(['1/4th Page (8.5 x 5.5 in)', '1/6th Page', '1/8th Pocket Size']),
        designFee: 149,
        rating: 4.7,
        reviewCount: 78,
        isFeatured: false,
        isActive: true,
      },
      {
        title: 'Die-Cut Stickers & Product Labels',
        slug: 'die-cut-stickers',
        category: 'Stickers & Labels',
        tagline: 'Waterproof peel-and-stick labels for packaging, bottles, and brand seals.',
        description: 'Vibrant contour cut stickers on glossy or matte vinyl. Sticks securely to glass, plastic, paper boxes, and metal containers.',
        features: JSON.stringify([
          'Waterproof & tear-resistant vinyl material',
          'Sharp precision kiss-cut around any shape',
          'Glossy shine or sleek velvet matte finish',
          'Strong adhesive that leaves no residue upon peeling',
        ]),
        imageUrl: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=1000&q=80',
        galleryImages: JSON.stringify([
          'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=1000&q=80',
        ]),
        basePrice: 290,
        unit: 'stickers',
        minQuantity: 100,
        quantityTiers: JSON.stringify([
          { qty: 100, price: 290, perUnit: 2.9 },
          { qty: 250, price: 550, perUnit: 2.2 },
          { qty: 500, price: 950, perUnit: 1.9 },
          { qty: 1000, price: 1600, perUnit: 1.6 },
        ]),
        paperOptions: JSON.stringify([
          'Glossy White Waterproof Vinyl',
          'Matte Waterproof Vinyl',
          'Clear Transparent Vinyl',
          'Kraft Paper Vintage Finish',
        ]),
        sizeOptions: JSON.stringify(['2 x 2 inch Circle/Square', '3 x 3 inch', 'Custom Contour Cut']),
        designFee: 149,
        rating: 4.9,
        reviewCount: 110,
        isFeatured: false,
        isActive: true,
      },
    ];

    const created = await prisma.printProduct.createMany({
      data: initialProducts,
    });

    return NextResponse.json({
      success: true,
      message: 'Seed products inserted successfully',
      count: created.count,
    });
  } catch (error: any) {
    console.error('Error seeding print products:', error);
    return NextResponse.json({ error: error.message || 'Failed to seed products' }, { status: 500 });
  }
}
