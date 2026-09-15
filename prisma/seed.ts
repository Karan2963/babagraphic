import { PrismaClient, ItemType, AssetStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Baba Book Binding database initial data...');

  // 1. Business Settings
  await prisma.businessSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      businessName: 'BABA BOOK BINDING',
      gstin: '09BTDPY1262P1ZX',
      address: 'B30/25 Madho Market, Lanka, Varanasi - 221005',
      phone: '+91 63064 74331',
      email: 'contact@babagraphic.store',
      invoicePrefix: 'BB',
      state: 'Uttar Pradesh',
    },
  });

  // 2. Consumable Inventory Items
  const inventoryItems = [
    { name: 'A4 70 GSM Paper', category: 'Paper', unit: 'Sheets', currentStock: 5000, minStockAlert: 500, costPrice: 0.45, sellingPrice: 2.0 },
    { name: 'A4 80 GSM Paper', category: 'Paper', unit: 'Sheets', currentStock: 3000, minStockAlert: 400, costPrice: 0.60, sellingPrice: 3.0 },
    { name: 'A3 100 GSM Paper', category: 'Paper', unit: 'Sheets', currentStock: 1500, minStockAlert: 200, costPrice: 1.50, sellingPrice: 8.0 },
    { name: 'Spiral Coils 6mm', category: 'Binding', unit: 'Coils', currentStock: 250, minStockAlert: 30, costPrice: 5.0, sellingPrice: 30.0 },
    { name: 'Spiral Coils 10mm', category: 'Binding', unit: 'Coils', currentStock: 180, minStockAlert: 25, costPrice: 8.0, sellingPrice: 50.0 },
    { name: 'Hard Covers (Gold Embossed)', category: 'Binding', unit: 'Covers', currentStock: 100, minStockAlert: 20, costPrice: 35.0, sellingPrice: 150.0 },
    { name: 'Transparent Cover Sheets', category: 'Binding', unit: 'Sheets', currentStock: 400, minStockAlert: 50, costPrice: 2.0, sellingPrice: 15.0 },
    { name: 'Lamination Pouches A4', category: 'Lamination', unit: 'Pouches', currentStock: 300, minStockAlert: 40, costPrice: 3.0, sellingPrice: 20.0 },
    { name: 'Black Toner Cartridge', category: 'Toners', unit: 'Units', currentStock: 4, minStockAlert: 1, costPrice: 1800.0, sellingPrice: 0.0 },
    { name: 'Color Toner Set (CMYK)', category: 'Toners', unit: 'Sets', currentStock: 2, minStockAlert: 1, costPrice: 6500.0, sellingPrice: 0.0 },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
  }

  // Fetch created paper & binding inventory for service linking
  const a4Paper = await prisma.inventoryItem.findUnique({ where: { name: 'A4 70 GSM Paper' } });
  const a4ColorPaper = await prisma.inventoryItem.findUnique({ where: { name: 'A4 80 GSM Paper' } });
  const hardCover = await prisma.inventoryItem.findUnique({ where: { name: 'Hard Covers (Gold Embossed)' } });
  const spiralCoil = await prisma.inventoryItem.findUnique({ where: { name: 'Spiral Coils 6mm' } });
  const laminationPouch = await prisma.inventoryItem.findUnique({ where: { name: 'Lamination Pouches A4' } });

  // 3. Products & Services Master
  const services = [
    { name: 'B/W Printing (Single Sided)', type: ItemType.SERVICE, hsnSac: '9989', unit: 'Pages', price: 2.0, defaultTaxRate: 18, inventoryItemId: a4Paper?.id },
    { name: 'B/W Printing (Double Sided)', type: ItemType.SERVICE, hsnSac: '9989', unit: 'Pages', price: 1.5, defaultTaxRate: 18, inventoryItemId: a4Paper?.id },
    { name: 'Color Printing (A4)', type: ItemType.SERVICE, hsnSac: '9989', unit: 'Pages', price: 10.0, defaultTaxRate: 18, inventoryItemId: a4ColorPaper?.id },
    { name: 'Hard Thesis Binding (Gold Stamped)', type: ItemType.SERVICE, hsnSac: '9988', unit: 'Books', price: 250.0, defaultTaxRate: 18, inventoryItemId: hardCover?.id },
    { name: 'Spiral Binding', type: ItemType.SERVICE, hsnSac: '9988', unit: 'Books', price: 50.0, defaultTaxRate: 18, inventoryItemId: spiralCoil?.id },
    { name: 'Soft Cover / Tape Binding', type: ItemType.SERVICE, hsnSac: '9988', unit: 'Books', price: 40.0, defaultTaxRate: 18 },
    { name: 'Document Lamination (A4)', type: ItemType.SERVICE, hsnSac: '9989', unit: 'Docs', price: 20.0, defaultTaxRate: 18, inventoryItemId: laminationPouch?.id },
    { name: 'Graphic Design & Typesetting', type: ItemType.SERVICE, hsnSac: '9983', unit: 'Hours', price: 300.0, defaultTaxRate: 18 },
  ];

  for (const srv of services) {
    await prisma.productService.upsert({
      where: { name: srv.name },
      update: {},
      create: srv,
    });
  }

  // 4. Sample Machinery & Assets
  const assets = [
    {
      assetCode: 'AST-001',
      name: 'Digital Heavy Duty Color Printer',
      category: 'Printing Machine',
      purchaseDate: new Date('2025-08-15'),
      purchasePrice: 125000.0,
      supplierName: 'Canon India Pvt Ltd',
      serialNumber: 'CN-DIGI-9942',
      location: 'Shop Main Floor',
      status: AssetStatus.WORKING,
      warrantyExpiryDate: new Date('2027-08-15'),
    },
    {
      assetCode: 'AST-002',
      name: 'High Speed B/W Photocopier',
      category: 'Copier Machine',
      purchaseDate: new Date('2025-03-10'),
      purchasePrice: 85000.0,
      supplierName: 'Konica Minolta',
      serialNumber: 'KM-BIZHUB-302',
      location: 'Shop Main Floor',
      status: AssetStatus.WORKING,
      warrantyExpiryDate: new Date('2026-03-10'),
    },
    {
      assetCode: 'AST-003',
      name: 'Hydraulic Paper Cutting Machine',
      category: 'Cutting Machine',
      purchaseDate: new Date('2024-11-20'),
      purchasePrice: 65000.0,
      supplierName: 'Varanasi Machinery Traders',
      serialNumber: 'CUT-HYD-500',
      location: 'Binding Workshop',
      status: AssetStatus.WORKING,
    },
    {
      assetCode: 'AST-004',
      name: 'Gold Foil Stamping & Hard Binding Press',
      category: 'Binding Machine',
      purchaseDate: new Date('2025-01-05'),
      purchasePrice: 45000.0,
      supplierName: 'National Binding Solutions',
      serialNumber: 'BIND-FOIL-102',
      location: 'Binding Workshop',
      status: AssetStatus.WORKING,
    },
    {
      assetCode: 'AST-005',
      name: 'Double Battery Online UPS 3KVA',
      category: 'Power Supply',
      purchaseDate: new Date('2025-05-12'),
      purchasePrice: 32000.0,
      supplierName: 'Microtek Electronics',
      serialNumber: 'UPS-3KVA-882',
      location: 'Power Room',
      status: AssetStatus.WORKING,
      warrantyExpiryDate: new Date('2027-05-12'),
    },
  ];

  for (const ast of assets) {
    await prisma.asset.upsert({
      where: { assetCode: ast.assetCode },
      update: {},
      create: ast,
    });
  }

  // 5. Sample Customers
  const customers = [
    { name: 'Rohan Kumar', mobile: '9876543210', email: 'rohan.k@bhu.ac.in', address: 'Broacha Hostel, BHU Campus', state: 'Uttar Pradesh', gstin: '' },
    { name: 'Aman Singh', mobile: '9812345678', email: 'aman.singh@gmail.com', address: 'Lanka, Varanasi', state: 'Uttar Pradesh', gstin: '' },
    { name: 'Dr. Ravi Kant', mobile: '9450011223', email: 'ravikant.med@bhu.ac.in', address: 'IMS BHU Varanasi', state: 'Uttar Pradesh', gstin: '09AABCB1234D1ZP' },
  ];

  for (const cust of customers) {
    await prisma.customer.upsert({
      where: { mobile: cust.mobile },
      update: {},
      create: cust,
    });
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
