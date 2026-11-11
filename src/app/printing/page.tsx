'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Upload,
  CheckCircle2,
  FileText,
  ArrowLeft,
  Loader2,
  Star,
  Truck,
  ShieldCheck,
  Palette,
  Printer,
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  X,
  Search,
  Check,
  Share2,
} from 'lucide-react';

interface QuantityTier {
  qty: number;
  price: number;
  perUnit: number;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  tagline: string | null;
  description: string | null;
  features: string | null;
  imageUrl: string;
  galleryImages: string | null;
  basePrice: number;
  unit: string;
  minQuantity: number;
  quantityTiers: string | null;
  paperOptions: string | null;
  sizeOptions: string | null;
  designFee: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
}

export default function PrintingDesignPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected product for detail & customization view
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showPricingGuide, setShowPricingGuide] = useState<boolean>(false);
  const [pincode, setPincode] = useState<string>('221005');

  // Customization state
  const [selectedQty, setSelectedQty] = useState<number>(10);
  const [selectedPaper, setSelectedPaper] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [deliverySpeed, setDeliverySpeed] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');

  // Order mode: 'UPLOAD_DESIGN' (customer has design) vs 'CREATE_DESIGN' (Baba Graphics designs it)
  const [orderMode, setOrderMode] = useState<'UPLOAD_DESIGN' | 'CREATE_DESIGN'>('UPLOAD_DESIGN');

  // Customer uploads & details
  const [customerDesignFile, setCustomerDesignFile] = useState<File | null>(null);
  const [customerDesignUrl, setCustomerDesignUrl] = useState<string>('');
  const [referenceLogoFile, setReferenceLogoFile] = useState<File | null>(null);
  const [referenceLogoUrl, setReferenceLogoUrl] = useState<string>('');
  const [uploadingDesign, setUploadingDesign] = useState<boolean>(false);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);

  // Design brief fields (when customer asks to create design)
  const [designBrief, setDesignBrief] = useState({
    businessName: '',
    tagline: '',
    contactInfo: '',
    preferredColors: '',
    specialInstructions: '',
  });

  // Customer contact modal / fields
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    mobile: '',
    email: '',
    address: 'Saket Nagar Colony, Nagwa, Lanka, Varanasi - 221005 (Store Pickup)',
    deliveryType: 'STORE_PICKUP' as 'STORE_PICKUP' | 'DELIVERY',
  });

  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/print-products');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
        // Default select Letterheads if available, or the first product
        const defaultProd = data.find((p) => p.slug === 'letterheads') || data[0];
        selectProduct(defaultProd);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectProduct = (prod: Product) => {
    setActiveProduct(prod);
    setActiveImageIndex(0);

    // Parse options
    const paperOpts = getPaperOptions(prod);
    if (paperOpts.length > 0) setSelectedPaper(paperOpts[0]);

    const sizeOpts = getSizeOptions(prod);
    if (sizeOpts.length > 0) setSelectedSize(sizeOpts[0]);

    const tiers = getQuantityTiers(prod);
    if (tiers.length > 0) {
      setSelectedQty(tiers[0].qty);
    } else {
      setSelectedQty(prod.minQuantity || 10);
    }

    setCustomerDesignFile(null);
    setCustomerDesignUrl('');
    setReferenceLogoFile(null);
    setReferenceLogoUrl('');
    setErrorMsg('');
  };

  // Helper parsing methods
  const getFeatures = (prod: Product): string[] => {
    if (!prod.features) return [];
    try {
      const parsed = JSON.parse(prod.features);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return prod.features.split('\n').filter(Boolean);
    }
  };

  const getGalleryImages = (prod: Product): string[] => {
    if (!prod.galleryImages) return [prod.imageUrl];
    try {
      const parsed = JSON.parse(prod.galleryImages);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [prod.imageUrl];
    } catch {
      return [prod.imageUrl];
    }
  };

  const getQuantityTiers = (prod: Product): QuantityTier[] => {
    if (!prod.quantityTiers) return [];
    try {
      const parsed = JSON.parse(prod.quantityTiers);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getPaperOptions = (prod: Product): string[] => {
    if (!prod.paperOptions) return [];
    try {
      const parsed = JSON.parse(prod.paperOptions);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getSizeOptions = (prod: Product): string[] => {
    if (!prod.sizeOptions) return [];
    try {
      const parsed = JSON.parse(prod.sizeOptions);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Calculate pricing
  const calculatePricing = () => {
    if (!activeProduct) return { printPrice: 0, designFee: 0, deliveryCost: 0, total: 0, perUnit: 0 };

    const tiers = getQuantityTiers(activeProduct);
    let printPrice = activeProduct.basePrice;

    const matchedTier = tiers.find((t) => t.qty === selectedQty);
    if (matchedTier) {
      printPrice = matchedTier.price;
    } else if (tiers.length > 0) {
      // Find closest tier rate or proportional rate
      const perUnitRate = tiers[0].perUnit || activeProduct.basePrice / (activeProduct.minQuantity || 10);
      printPrice = Math.round(perUnitRate * selectedQty);
    }

    const designFee = orderMode === 'CREATE_DESIGN' ? activeProduct.designFee || 199 : 0;
    const deliveryCost = deliverySpeed === 'EXPRESS' ? 120 : 0;
    const total = printPrice + designFee + deliveryCost;
    const perUnit = selectedQty > 0 ? Number((printPrice / selectedQty).toFixed(2)) : 0;

    return { printPrice, designFee, deliveryCost, total, perUnit };
  };

  const { printPrice, designFee, deliveryCost, total, perUnit } = calculatePricing();

  // Upload handlers
  const handleUploadCustomerDesign = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomerDesignFile(file);
    setUploadingDesign(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setCustomerDesignUrl(json.url);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'File upload failed');
    } finally {
      setUploadingDesign(false);
    }
  };

  const handleUploadReferenceLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReferenceLogoFile(file);
    setUploadingLogo(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setReferenceLogoUrl(json.url);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Submit Order
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerDetails.name || !customerDetails.mobile) {
      setErrorMsg('Please enter your name and WhatsApp mobile number');
      return;
    }

    if (orderMode === 'UPLOAD_DESIGN' && !customerDesignUrl && !customerDesignFile) {
      setErrorMsg('Please upload your design file or choose "Ask Baba Graphics to Create Design"');
      return;
    }

    if (orderMode === 'CREATE_DESIGN' && !designBrief.businessName && !designBrief.specialInstructions) {
      setErrorMsg('Please enter your business/personal name or instructions for the design');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const briefSummary =
        orderMode === 'CREATE_DESIGN'
          ? `[CUSTOM DESIGN REQUEST]
Business/Entity: ${designBrief.businessName}
Tagline: ${designBrief.tagline || 'N/A'}
Contact Details: ${designBrief.contactInfo || 'N/A'}
Preferred Colors: ${designBrief.preferredColors || 'N/A'}
Notes: ${designBrief.specialInstructions || 'N/A'}
Delivery Type: ${customerDetails.deliveryType}
Delivery Address: ${customerDetails.address}`
          : `[PRINT-READY FILE]
Delivery Type: ${customerDetails.deliveryType}
Delivery Address: ${customerDetails.address}`;

      const payload = {
        customerName: customerDetails.name,
        customerMobile: customerDetails.mobile,
        customerEmail: customerDetails.email || null,
        serviceType: `${activeProduct?.title} (${orderMode === 'CREATE_DESIGN' ? 'Design + Print' : 'Print Only'})`,
        instructions: briefSummary,
        fileUrl: orderMode === 'UPLOAD_DESIGN' ? customerDesignUrl : null,
        orderType: orderMode === 'CREATE_DESIGN' ? 'DESIGN_AND_PRINT' : 'PRINT_READY',
        productId: activeProduct?.id,
        quantity: selectedQty,
        paperType: selectedPaper,
        size: selectedSize,
        deliverySpeed: deliverySpeed,
        designBrief: orderMode === 'CREATE_DESIGN' ? JSON.stringify(designBrief) : null,
        referenceUrl: referenceLogoUrl || null,
        totalAmount: total,
      };

      const res = await fetch('/api/online-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to place order');

      setOrderSuccess(json);
      setShowCheckoutModal(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp Order message generator
  const getWhatsAppOrderLink = () => {
    if (!activeProduct) return 'https://wa.me/916306474331';
    const text = `*New Order Inquiry - BABA Graphics Varanasi*
----------------------------------------
*Product:* ${activeProduct.title}
*Order Type:* ${orderMode === 'CREATE_DESIGN' ? '🎨 Create Design for Me & Print' : '📤 I Have My Design (Print Only)'}
*Quantity:* ${selectedQty} ${activeProduct.unit}
*Paper:* ${selectedPaper || 'Standard'}
*Size:* ${selectedSize || 'A4'}
*Delivery Speed:* ${deliverySpeed === 'EXPRESS' ? '⚡ Same Day Delivery (+₹120)' : 'Standard'}
*Estimated Total:* ₹${total}
${orderMode === 'CREATE_DESIGN' ? `*Business/Name:* ${designBrief.businessName || 'To be specified'}` : ''}
${customerDesignUrl ? `*Uploaded File:* ${customerDesignUrl}` : ''}
----------------------------------------
Please confirm my order and share next steps!`;

    return `https://wa.me/916306474331?text=${encodeURIComponent(text)}`;
  };

  // Filter categories
  const categories = ['All', 'Stationery', 'Business Cards', 'Thesis & Binding', 'Marketing', 'Banners & Signs', 'Stickers & Labels'];
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tagline && p.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const galleryImages = activeProduct ? getGalleryImages(activeProduct) : [];
  const featuresList = activeProduct ? getFeatures(activeProduct) : [];
  const quantityTiers = activeProduct ? getQuantityTiers(activeProduct) : [];
  const paperOptions = activeProduct ? getPaperOptions(activeProduct) : [];
  const sizeOptions = activeProduct ? getSizeOptions(activeProduct) : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/babagraphiclogo.png" alt="Baba Graphics Logo" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight leading-none block">BABA Graphics</span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Printing & Custom Design Studio</span>
            </div>
          </Link>

          {/* Quick Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search letterheads, visiting cards, thesis, flex, stickers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/916306474331"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-3.5 py-2 rounded-full transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp: 63064 74331</span>
            </a>
            <Link
              href="/admin/designs"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full transition flex items-center gap-1.5 shadow-sm"
            >
              <Palette className="w-3.5 h-3.5 text-blue-400" /> Upload My Design
            </Link>
          </div>
        </div>
      </header>

      {/* Main Breadcrumb / Notice Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white py-3 px-4 text-xs font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-blue-400/30">
              Varanasi Printing Hub
            </span>
            <span>⚡ Same-Day Printing & Express Delivery Available in BHU Lanka & City Area</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Satisfaction Guarantee
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Order before 12 Noon for Same Day
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* =========================================================================
            FEATURED PRODUCT INTERACTIVE DETAIL (MATCHING USER SCREENSHOT)
           ========================================================================= */}
        {activeProduct ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all">
            <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* LEFT COLUMN: Gallery & Photo Viewer */}
              <div className="lg:col-span-6 flex flex-col">
                <div className="relative aspect-[4/3] sm:aspect-[1/1] w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner group">
                  <img
                    src={galleryImages[activeImageIndex] || activeProduct.imageUrl}
                    alt={activeProduct.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {/* Favorite Heart Button */}
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition"
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
                  </button>

                  {/* Next / Prev Image Arrows */}
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md text-slate-700 hover:text-black transition"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md text-slate-700 hover:text-black transition"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Watermark/Location Badge */}
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    BABA Graphics • Lanka, Varanasi
                  </div>
                </div>

                {/* Thumbnails Row */}
                {galleryImages.length > 1 && (
                  <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                          activeImageIndex === idx
                            ? 'border-blue-600 ring-2 ring-blue-500/30'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <Printer className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-slate-800">Laser Offset Print</p>
                    <p className="text-[10px] text-slate-500">Ultra-sharp 2400 DPI</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <Truck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-slate-800">Same-Day Pickup</p>
                    <p className="text-[10px] text-slate-500">Lanka Varanasi</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-slate-800">Free Proof Check</p>
                    <p className="text-[10px] text-slate-500">WhatsApp Preview</p>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Specifications, Pricing & Two Ordering Modes */}
              <div className="lg:col-span-6 flex flex-col space-y-5">
                {/* Title & Ratings */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {activeProduct.category}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                      <span className="text-slate-800 font-bold ml-1">{activeProduct.rating || 4.7}</span>
                      <span className="text-slate-400">({activeProduct.reviewCount || 166})</span>
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {activeProduct.title}
                  </h1>
                  {activeProduct.tagline && (
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                      {activeProduct.tagline}
                    </p>
                  )}
                </div>

                {/* Bullet Specifications (Directly matching user's image) */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                  {featuresList.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold text-base leading-none">•</span>
                      <span className="leading-relaxed">{feature}</span>
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-400 pt-1 italic">
                    Note: Do not upload designs containing unauthorized signatures or protected bank/govt symbols.
                  </p>
                </div>

                {/* Pricing Display */}
                <div className="border-t border-b border-slate-200 py-4 flex items-baseline justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">₹{total.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-500 font-semibold">
                        (₹{perUnit.toFixed(2)} each / {selectedQty} {activeProduct.unit})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      MRP inclusive of all taxes • No hidden setup charges
                    </p>
                  </div>
                  {orderMode === 'CREATE_DESIGN' && (
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      Includes ₹{designFee} Design Creation
                    </span>
                  )}
                </div>

                {/* Delivery Checker */}
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>
                      Delivery to <strong className="font-bold text-slate-900">{pincode} (Varanasi)</strong>
                    </span>
                  </div>
                  <span className="text-emerald-700 font-bold text-[11px]">Free Store Pickup or Express Delivery</span>
                </div>

                {/* Quantity Selector */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-black uppercase text-slate-700">Quantity *</label>
                    <button
                      onClick={() => setShowPricingGuide(!showPricingGuide)}
                      className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" /> Show pricing guide
                    </button>
                  </div>

                  {/* Quantity Dropdown / Chips */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {quantityTiers.length > 0 ? (
                      quantityTiers.map((tier) => (
                        <button
                          key={tier.qty}
                          type="button"
                          onClick={() => setSelectedQty(tier.qty)}
                          className={`p-2.5 rounded-xl border text-center transition ${
                            selectedQty === tier.qty
                              ? 'bg-blue-600 text-white border-blue-600 font-black shadow-md'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 font-bold'
                          }`}
                        >
                          <div className="text-xs">{tier.qty}</div>
                          <div className="text-[10px] opacity-80">₹{tier.perUnit}/pc</div>
                        </button>
                      ))
                    ) : (
                      [10, 50, 100, 250, 500, 1000].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setSelectedQty(qty)}
                          className={`p-2.5 rounded-xl border text-center transition ${
                            selectedQty === qty
                              ? 'bg-blue-600 text-white border-blue-600 font-black shadow-md'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 font-bold'
                          }`}
                        >
                          <div className="text-xs">{qty}</div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Pricing Guide Accordion */}
                  {showPricingGuide && (
                    <div className="mt-3 p-3.5 bg-slate-100 rounded-xl text-xs space-y-2 border border-slate-200 animate-fadeIn">
                      <p className="font-bold text-slate-800">Bulk Tier Pricing Guide:</p>
                      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                        {quantityTiers.map((t) => (
                          <div key={t.qty} className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-900 block">{t.qty} Units</span>
                            <span className="text-blue-600 font-bold">₹{t.price}</span>
                            <span className="text-slate-400 block text-[9px]">(₹{t.perUnit}/unit)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Paper Type Selection */}
                {paperOptions.length > 0 && (
                  <div>
                    <label className="text-xs font-black uppercase text-slate-700 block mb-1.5">
                      Paper Quality / Finish *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {paperOptions.map((paper) => (
                        <button
                          key={paper}
                          type="button"
                          onClick={() => setSelectedPaper(paper)}
                          className={`p-2.5 rounded-xl text-left text-xs font-bold border transition ${
                            selectedPaper === paper
                              ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{paper}</span>
                            {selectedPaper === paper && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Speed Options */}
                <div>
                  <label className="text-xs font-black uppercase text-slate-700 block mb-1.5">Delivery Speed *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliverySpeed('STANDARD')}
                      className={`p-3 rounded-xl border text-left transition ${
                        deliverySpeed === 'STANDARD'
                          ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-600'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 block">Standard (1-2 Days)</span>
                      <span className="text-[10px] text-emerald-600 font-bold">FREE Store Pickup / Standard Rate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliverySpeed('EXPRESS')}
                      className={`p-3 rounded-xl border text-left transition ${
                        deliverySpeed === 'EXPRESS'
                          ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-600'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 block">Same Day Express</span>
                      <span className="text-[10px] text-blue-700 font-bold">Varanasi City (+₹120.00)</span>
                    </button>
                  </div>
                </div>

                {/* =========================================================================
                    THE USER'S CORE REQUIREMENT:
                    "in which i will upload my design and if anyone want to give order
                    then he can send design or ask me to crate design and print"
                   ========================================================================= */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <label className="text-xs font-black uppercase text-slate-900 block mb-2">
                    How Would You Like to Proceed with Your Design? *
                  </label>

                  {/* Mode Tabs */}
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
                    <button
                      type="button"
                      onClick={() => setOrderMode('UPLOAD_DESIGN')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                        orderMode === 'UPLOAD_DESIGN'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-4 h-4" /> I Have My Design (Print Only)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderMode('CREATE_DESIGN')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                        orderMode === 'CREATE_DESIGN'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Palette className="w-4 h-4 text-amber-500" /> Create Design & Print (+₹{activeProduct.designFee || 199})
                    </button>
                  </div>

                  {/* TAB 1: CUSTOMER UPLOADS THEIR OWN DESIGN */}
                  {orderMode === 'UPLOAD_DESIGN' && (
                    <div className="mt-4 p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 text-center">
                      <input
                        type="file"
                        id="customer-design-upload"
                        accept=".pdf,.png,.jpg,.jpeg,.ai,.cdr,.psd,.eps,.zip"
                        onChange={handleUploadCustomerDesign}
                        className="hidden"
                      />
                      <label htmlFor="customer-design-upload" className="cursor-pointer block">
                        {uploadingDesign ? (
                          <div className="flex flex-col items-center py-4">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                            <p className="text-xs font-bold text-slate-700">Uploading your design to Cloudinary...</p>
                          </div>
                        ) : customerDesignUrl ? (
                          <div className="flex flex-col items-center py-2">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-1" />
                            <p className="text-xs font-bold text-emerald-800">Design Uploaded Successfully!</p>
                            <p className="text-[11px] text-slate-600 mt-0.5 max-w-xs truncate font-mono">
                              {customerDesignFile?.name}
                            </p>
                            <span className="text-[10px] text-blue-600 underline font-bold mt-1">Click to replace file</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                              <Upload className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-slate-800">
                              Click to Upload Your Print-Ready File
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Accepts PDF, CorelDraw (.cdr), AI, PSD, High-Res PNG / JPG (up to 50MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  )}

                  {/* TAB 2: CUSTOMER ASKS BABA GRAPHICS TO CREATE DESIGN & PRINT */}
                  {orderMode === 'CREATE_DESIGN' && (
                    <div className="mt-4 p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
                      <div className="flex items-center gap-2 text-amber-800">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-black uppercase">We Will Design It For You!</h4>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Fill in your business details below. Our graphic designers will craft an authentic, high-resolution design and send a digital preview on WhatsApp for your approval before printing!
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                            Business / Person Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Baba Book Binding / Dr. Sharma"
                            value={designBrief.businessName}
                            onChange={(e) => setDesignBrief({ ...designBrief, businessName: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                            Tagline / Nature of Work
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Legal Consultant / General Store"
                            value={designBrief.tagline}
                            onChange={(e) => setDesignBrief({ ...designBrief, tagline: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                          Contact Info to Print (Phone, Email, Address, GSTIN)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Ph: 9876543210, Lanka Varanasi, GSTIN: 09BTDPY..."
                          value={designBrief.contactInfo}
                          onChange={(e) => setDesignBrief({ ...designBrief, contactInfo: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                            Preferred Colors / Theme
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Royal Blue & Gold, Minimalist Red"
                            value={designBrief.preferredColors}
                            onChange={(e) => setDesignBrief({ ...designBrief, preferredColors: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                            Upload Logo / Reference (Optional)
                          </label>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleUploadReferenceLogo}
                            className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-white file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {uploadingLogo && <span className="text-[10px] text-blue-600">Uploading logo...</span>}
                          {referenceLogoUrl && (
                            <span className="text-[10px] text-emerald-600 font-bold block">✓ Logo attached</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                          Any Extra Text or Design Instructions
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Add any specific text, quotation, bank details, or font style you want..."
                          value={designBrief.specialInstructions}
                          onChange={(e) => setDesignBrief({ ...designBrief, specialInstructions: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        ></textarea>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Banner if any */}
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
                    {errorMsg}
                  </div>
                )}

                {/* Action Buttons: Proceed to Checkout or Instant WhatsApp Order */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (orderMode === 'UPLOAD_DESIGN' && !customerDesignUrl && !customerDesignFile) {
                        setErrorMsg('Please upload your design file or choose "Create Design & Print"');
                        return;
                      }
                      if (orderMode === 'CREATE_DESIGN' && !designBrief.businessName) {
                        setErrorMsg('Please provide your business or personal name for the design');
                        return;
                      }
                      setErrorMsg('');
                      setShowCheckoutModal(true);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl text-xs transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Place Order Online (₹{total})
                  </button>

                  <a
                    href={getWhatsAppOrderLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl text-xs transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Order via WhatsApp
                  </a>
                </div>

                {/* Shop Location Footnote */}
                <p className="text-[11px] text-slate-500 text-center">
                  📍 BABA BOOK BINDING, Saket Nagar Colony, Nagwa, Lanka, Varanasi • 📞 +91 63064 74331
                </p>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-500">Loading Print & Design Catalog...</p>
          </div>
        ) : (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
            <Printer className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700">No print products found</h3>
            <p className="text-xs text-slate-400 mt-1">Please check back soon or search another term.</p>
          </div>
        )}

        {/* =========================================================================
            BROWSE MORE DESIGNS & PRINT PRODUCTS CATALOG GRID
           ========================================================================= */}
        <div className="space-y-4 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Explore All Designs & Print Products</h2>
              <p className="text-xs text-slate-500">
                Choose a product to customize, upload your ready artwork, or have Baba Graphics create it.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">{filteredProducts.length} Products Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const isSelected = activeProduct?.id === prod.id;
              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    selectProduct(prod);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group ${
                    isSelected ? 'ring-2 ring-blue-600 border-blue-600' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={prod.imageUrl}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {prod.category}
                    </span>
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                        Selected
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-amber-400 text-[11px] mb-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="text-slate-800 font-bold">{prod.rating || 4.7}</span>
                        <span className="text-slate-400">({prod.reviewCount || 100})</span>
                      </div>
                      <h3 className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                        {prod.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {prod.tagline || prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Starting From</span>
                        <span className="text-base font-black text-slate-900">₹{prod.basePrice}</span>
                      </div>
                      <button
                        type="button"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
                      >
                        Customize
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          CHECKOUT & CUSTOMER DETAILS MODAL
         ========================================================================= */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">Complete Your Print Order</h3>
                <p className="text-xs text-slate-500">Provide your contact details to generate order tracking ID</p>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Summary Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs mb-5 space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{activeProduct?.title}</span>
                <span>₹{printPrice}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>
                  Quantity: {selectedQty} {activeProduct?.unit} ({selectedPaper || 'Standard'})
                </span>
                <span>₹{perUnit}/pc</span>
              </div>
              {orderMode === 'CREATE_DESIGN' && (
                <div className="flex justify-between text-amber-700 font-bold text-[11px]">
                  <span>Custom Graphic Design Creation</span>
                  <span>+₹{designFee}</span>
                </div>
              )}
              {deliveryCost > 0 && (
                <div className="flex justify-between text-blue-700 font-bold text-[11px]">
                  <span>Express Same-Day Delivery</span>
                  <span>+₹{deliveryCost}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>Total Payable:</span>
                <span className="text-blue-600">₹{total}</span>
              </div>
            </div>

            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  WhatsApp Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210 (We will send design proof here)"
                  value={customerDetails.mobile}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, mobile: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@example.com"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Fulfillment Option</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCustomerDetails({
                        ...customerDetails,
                        deliveryType: 'STORE_PICKUP',
                        address: 'BABA BOOK BINDING, Saket Nagar Colony, Nagwa, Lanka, Varanasi - 221005 (Store Pickup)',
                      })
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                      customerDetails.deliveryType === 'STORE_PICKUP'
                        ? 'bg-blue-50 border-blue-600 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    🏪 Store Pickup (Lanka)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomerDetails({
                        ...customerDetails,
                        deliveryType: 'DELIVERY',
                        address: '',
                      })
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                      customerDetails.deliveryType === 'DELIVERY'
                        ? 'bg-blue-50 border-blue-600 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    🚚 Courier / Delivery
                  </button>
                </div>

                {customerDetails.deliveryType === 'DELIVERY' && (
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter complete delivery address with landmark & pincode..."
                    value={customerDetails.address}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  ></textarea>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm & Place Order (₹${total})`}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  Payment can be made via UPI or Cash upon pickup / proof approval.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ORDER SUCCESS CONFIRMATION MODAL
         ========================================================================= */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1">Thank you {orderSuccess.customerName}!</p>

            <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Tracking ID:</span>
                <span className="font-bold font-mono text-blue-600">{orderSuccess.orderNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product / Service:</span>
                <span className="font-semibold text-slate-900">{orderSuccess.serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity:</span>
                <span className="font-semibold text-slate-900">{orderSuccess.quantity} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-black text-slate-900">₹{orderSuccess.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  File Received / In Queue
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Our team at <strong>BABA Graphics</strong> is reviewing your order. If you requested design creation, our graphic designer will share the proof on WhatsApp (+91 {orderSuccess.customerMobile}) shortly.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <a
                href={`https://wa.me/916306474331?text=Hi%20Baba%20Graphics,%20I%20just%20placed%20Order%20${orderSuccess.orderNo}%20for%20${encodeURIComponent(orderSuccess.serviceType)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Message Us on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setOrderSuccess(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs transition"
              >
                Done / Browse More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
