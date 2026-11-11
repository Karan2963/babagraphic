'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Palette,
  Plus,
  Upload,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Search,
  Star,
  Eye,
  X,
  Image as ImageIcon,
  Layers,
  Sparkles,
} from 'lucide-react';

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

function AdminDesignsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    category: 'Stationery',
    tagline: '',
    description: '',
    featuresText: '', // newline separated
    imageUrl: '',
    basePrice: 200,
    unit: 'units',
    minQuantity: 10,
    paperOptionsText: '120 GSM Smooth Matte, 100 GSM Excel Bond',
    sizeOptionsText: 'A4 (21.3 x 30 cm)',
    designFee: 199,
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Automatically open modal when navigated with ?upload=true
  useEffect(() => {
    if (searchParams?.get('upload') === 'true') {
      handleOpenNewModal();
    }
  }, [searchParams]);

  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'Letterhead':
        setFormData((prev) => ({
          ...prev,
          title: 'Premium Corporate Letterhead',
          category: 'Stationery',
          tagline: 'Professional corporate letterhead with laser-grade color printing.',
          featuresText: 'Size: 21.3 x 30 cm (A4 Standard)\nFull color high-resolution offset & digital print\nAvailable in 120 gsm matte or 100 gsm Excel Bond\nSame-day pickup / express delivery in Varanasi',
          paperOptionsText: '120 GSM Smooth Matte, 100 GSM Excel Bond, 85 GSM Alabaster',
          sizeOptionsText: 'A4 (21.3 x 30 cm), Letter (21.6 x 27.9 cm)',
          basePrice: 230,
          minQuantity: 10,
          unit: 'units',
          designFee: 199,
        }));
        break;
      case 'VisitingCard':
        setFormData((prev) => ({
          ...prev,
          title: 'Luxury Velvet Visiting Cards',
          category: 'Business Cards',
          tagline: 'Sturdy 350 GSM premium visiting cards with velvet matte lamination.',
          featuresText: 'Standard Size: 3.5 x 2.0 inch (89 x 51 mm)\nHeavy 350 GSM premium art board\nThermal Velvet Matte or Gloss Lamination\nSingle or double-sided full CMYK print',
          paperOptionsText: '350 GSM Velvet Matte, 300 GSM Gloss, 350 GSM Metallic Pearl',
          sizeOptionsText: 'Standard (3.5 x 2.0 in), Square (2.5 x 2.5 in), Rounded Corners',
          basePrice: 160,
          minQuantity: 100,
          unit: 'cards',
          designFee: 149,
        }));
        break;
      case 'Thesis':
        setFormData((prev) => ({
          ...prev,
          title: 'Thesis Hard Binding & Gold Embossing',
          category: 'Thesis & Binding',
          tagline: 'BHU & Premier University grade thesis hard binding with gold foil lettering.',
          featuresText: 'Heavy-duty imported leatherette binding boards\nCrisp hot-stamp gold or silver foil cover lettering\n100 GSM super-bright bond paper printing\nStrong nylon thread sewing + library adhesive',
          paperOptionsText: 'Royal Maroon Rexine, Navy Blue Rexine, Classic Black Rexine',
          sizeOptionsText: 'A4 Standard Academic',
          basePrice: 450,
          minQuantity: 1,
          unit: 'books',
          designFee: 249,
        }));
        break;
      case 'Flyer':
        setFormData((prev) => ({
          ...prev,
          title: 'Promotional Marketing Flyers',
          category: 'Marketing',
          tagline: 'Vibrant full-color promotional flyers to announce offers and products.',
          featuresText: 'Sizes: A5 and A4 formats\n130 GSM Gloss Art Paper with brilliant high-definition colors\nSingle or double-sided full color print\nFast 24-hour turnaround',
          paperOptionsText: '130 GSM Gloss Art, 170 GSM Premium Gloss, 100 GSM Maplitho',
          sizeOptionsText: 'A5 (Half A4), A4 (Standard)',
          basePrice: 499,
          minQuantity: 500,
          unit: 'flyers',
          designFee: 299,
        }));
        break;
      case 'Banner':
        setFormData((prev) => ({
          ...prev,
          title: 'Heavy-Duty Flex Banner / Standee',
          category: 'Banners & Signs',
          tagline: 'Weatherproof outdoor & indoor flex banner with rust-proof brass eyelets.',
          featuresText: 'Premium 340 GSM Star Flex or 440 GSM Blackout Flex\nEco-Solvent 1440 DPI photo-realistic printing\nReinforced border folding and brass eyelets\nSame day express printing & pickup in Lanka Varanasi',
          paperOptionsText: 'Star Flex 340 GSM, Regular Flex 280 GSM, Blackout Vinyl 440 GSM',
          sizeOptionsText: '6 x 3 feet, 8 x 4 feet, 10 x 5 feet, Roll-up Standee',
          basePrice: 350,
          minQuantity: 1,
          unit: 'banners',
          designFee: 199,
        }));
        break;
      case 'BillBook':
        setFormData((prev) => ({
          ...prev,
          title: 'Carbonless NCR Bill Book / Receipt Pad',
          category: 'Stationery',
          tagline: 'Numbered auto-carbon duplicate or triplicate custom bill books.',
          featuresText: 'Duplicate (1+1) or Triplicate (1+2) auto-carbon transfer sheets\nSequential red machine numbering\nPerforated edge for smooth, clean tear\nCustomized with your shop logo, GST & bank details',
          paperOptionsText: 'Duplicate NCR (White + Pink), Triplicate NCR (White + Pink + Yellow)',
          sizeOptionsText: '1/4th Page (8.5 x 5.5 in), 1/6th Page',
          basePrice: 480,
          minQuantity: 5,
          unit: 'books',
          designFee: 149,
        }));
        break;
      case 'Custom':
        setFormData((prev) => ({
          ...prev,
          title: 'Custom Graphic Design & Print Work',
          category: 'Apparel & Custom',
          tagline: 'Customized artwork and specialized printing work.',
          featuresText: 'High-resolution professional design\nCustom sizes and materials available\nFast turnaround with digital proof approval',
          paperOptionsText: 'Custom Paper / Material',
          sizeOptionsText: 'Custom Size',
          basePrice: 200,
          minQuantity: 1,
          unit: 'units',
          designFee: 199,
        }));
        break;
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/print-products?all=true');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error('Error fetching designs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      category: 'Stationery',
      tagline: '',
      description: '',
      featuresText: 'Size: 21.3 x 30 cm (A4)\nFull color laser printing\nArchival quality paper\nSame day delivery in Varanasi',
      imageUrl: '',
      basePrice: 200,
      unit: 'units',
      minQuantity: 10,
      paperOptionsText: '120 GSM Smooth Matte, 100 GSM Excel Bond',
      sizeOptionsText: 'A4 (21.3 x 30 cm)',
      designFee: 199,
      isFeatured: false,
      isActive: true,
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);

    let featText = '';
    try {
      const parsed = JSON.parse(prod.features || '[]');
      featText = Array.isArray(parsed) ? parsed.join('\n') : prod.features || '';
    } catch {
      featText = prod.features || '';
    }

    let paperText = '';
    try {
      const parsed = JSON.parse(prod.paperOptions || '[]');
      paperText = Array.isArray(parsed) ? parsed.join(', ') : prod.paperOptions || '';
    } catch {
      paperText = prod.paperOptions || '';
    }

    let sizeText = '';
    try {
      const parsed = JSON.parse(prod.sizeOptions || '[]');
      sizeText = Array.isArray(parsed) ? parsed.join(', ') : prod.sizeOptions || '';
    } catch {
      sizeText = prod.sizeOptions || '';
    }

    setFormData({
      title: prod.title,
      category: prod.category,
      tagline: prod.tagline || '',
      description: prod.description || '',
      featuresText: featText,
      imageUrl: prod.imageUrl,
      basePrice: prod.basePrice,
      unit: prod.unit || 'units',
      minQuantity: prod.minQuantity || 10,
      paperOptionsText: paperText,
      sizeOptionsText: sizeText,
      designFee: prod.designFee || 0,
      isFeatured: prod.isFeatured,
      isActive: prod.isActive,
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setFormData((prev) => ({ ...prev, imageUrl: json.url }));
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setErrorMsg(err.message || 'Image upload failed. You can paste a direct image URL instead.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      setErrorMsg('Product title and image URL are required');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const featuresArray = formData.featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const paperArray = formData.paperOptionsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const sizeArray = formData.sizeOptionsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Generate realistic bulk tiers based on basePrice
      const minQ = parseInt(formData.minQuantity.toString()) || 10;
      const base = parseFloat(formData.basePrice.toString()) || 100;
      const ratePerUnit = base / minQ;

      const tiers = [
        { qty: minQ, price: base, perUnit: Number(ratePerUnit.toFixed(2)) },
        { qty: minQ * 2.5, price: Math.round(base * 2.2), perUnit: Number(((base * 2.2) / (minQ * 2.5)).toFixed(2)) },
        { qty: minQ * 5, price: Math.round(base * 4), perUnit: Number(((base * 4) / (minQ * 5)).toFixed(2)) },
        { qty: minQ * 10, price: Math.round(base * 7.5), perUnit: Number(((base * 7.5) / (minQ * 10)).toFixed(2)) },
      ];

      const payload = {
        title: formData.title,
        category: formData.category,
        tagline: formData.tagline || null,
        description: formData.description || null,
        features: JSON.stringify(featuresArray),
        imageUrl: formData.imageUrl,
        galleryImages: JSON.stringify([formData.imageUrl]),
        basePrice: base,
        unit: formData.unit,
        minQuantity: minQ,
        quantityTiers: JSON.stringify(tiers),
        paperOptions: JSON.stringify(paperArray),
        sizeOptions: JSON.stringify(sizeArray),
        designFee: parseFloat(formData.designFee.toString()) || 0,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      };

      const endpoint = editingProduct ? `/api/print-products/${editingProduct.id}` : '/api/print-products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Operation failed');

      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setErrorMsg(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/print-products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleToggleActive = async (prod: Product) => {
    try {
      const res = await fetch(`/api/print-products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !prod.isActive }),
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch =
      search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">DESIGN & PRINT CATALOG</h1>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
              Admin Manager
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Upload your designs, set base prices, paper specifications & manage customer order options
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/printing"
            target="_blank"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" /> View Public Store
          </Link>
          <button
            onClick={handleOpenNewModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition inline-flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" /> Upload New Design / Product
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Stationery', 'Business Cards', 'Thesis & Binding', 'Marketing', 'Banners & Signs', 'Stickers & Labels'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Products Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">Loading designs & products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Palette className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No designs or print products found</p>
            <p className="text-xs text-slate-400 mt-1">Click "Upload New Design / Product" to create your first design!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3.5 rounded-l-xl">Preview</th>
                  <th className="p-3.5">Product / Design Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Base Price</th>
                  <th className="p-3.5">Min Qty</th>
                  <th className="p-3.5">Design Fee</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        <img src={prod.imageUrl} alt={prod.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm">{prod.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{prod.tagline}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">₹{prod.basePrice}</td>
                    <td className="p-3.5 text-slate-600">
                      {prod.minQuantity} {prod.unit}
                    </td>
                    <td className="p-3.5 text-amber-700 font-bold">
                      {prod.designFee > 0 ? `+₹${prod.designFee}` : 'Free'}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition ${
                          prod.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {prod.isActive ? 'Active (Live)' : 'Hidden'}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/printing`}
                          target="_blank"
                          title="Preview on site"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          title="Edit"
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.title)}
                          title="Delete"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          UPLOAD / EDIT DESIGN MODAL
         ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingProduct ? 'Edit Design / Product' : 'Upload New Design / Product'}
                </h3>
                <p className="text-xs text-slate-500">
                  Provide product specifications, upload design mockup, and set pricing rules
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick Template Presets */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">
                  ⚡ Quick Auto-Fill Templates (Click to fill details):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Letterhead', key: 'Letterhead' },
                    { label: 'Visiting Card', key: 'VisitingCard' },
                    { label: 'Thesis Binding', key: 'Thesis' },
                    { label: 'Flyer / Pamphlet', key: 'Flyer' },
                    { label: 'Flex Banner', key: 'Banner' },
                    { label: 'Bill Book', key: 'BillBook' },
                    { label: 'Custom Graphic', key: 'Custom' },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => applyPreset(p.key)}
                      className="bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 border border-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg transition shadow-xs"
                    >
                      + {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Letterheads / Luxury Business Cards"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Stationery">Stationery</option>
                    <option value="Business Cards">Business Cards</option>
                    <option value="Thesis & Binding">Thesis & Binding</option>
                    <option value="Marketing">Marketing (Flyers)</option>
                    <option value="Banners & Signs">Banners & Signs</option>
                    <option value="Stickers & Labels">Stickers & Labels</option>
                    <option value="Apparel & Custom">Apparel & Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Add a professional touch to every letter, invoice or quote."
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Design Mockup Image Upload */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Design Preview Image (Photo / Mockup) *
                </label>
                <div className="flex gap-3 items-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-300 flex-shrink-0 flex items-center justify-center">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer transition inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File to Cloudinary</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {uploadingImage && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                    </div>
                    <input
                      type="text"
                      placeholder="Or paste direct image URL (https://...)"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300 text-[11px] text-slate-800 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Min Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Unit Name</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Design Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.designFee}
                    onChange={(e) => setFormData({ ...formData, designFee: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Paper / Material Options (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 120 GSM Smooth Matte, 100 GSM Excel Bond, 85 GSM Alabaster"
                  value={formData.paperOptionsText}
                  onChange={(e) => setFormData({ ...formData, paperOptionsText: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Key Specifications / Bullet Points (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Size: 21.3 x 30 cm&#10;Full color printing&#10;Same day delivery available in Varanasi"
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>Publish to Public Store (Active)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span>Show in Featured Section</span>
                </label>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProduct ? 'Save Changes' : 'Upload Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDesignsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-bold">Loading Design Studio...</p>
        </div>
      }
    >
      <AdminDesignsContent />
    </Suspense>
  );
}
