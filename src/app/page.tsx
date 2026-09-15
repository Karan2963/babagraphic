'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, UserButton } from '@clerk/nextjs';

export default function PublicHomePage() {
  const { isSignedIn } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="text-slate-800 antialiased selection:bg-blue-500 selection:text-white min-h-screen bg-slate-50 font-sans">
      
      {/* ================= NAVIGATION ================= */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/babagraphiclogo.png"
              alt="BABA Graphic Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-md"
            />
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight block leading-none">BABA Graphics</span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Design & Print Studio</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#home" className="hover:text-blue-600 transition">Home</a>
            <a href="#services" className="hover:text-blue-600 transition">Services</a>
            <a href="#about" className="hover:text-blue-600 transition">Why Us</a>
            <a href="#location" className="hover:text-blue-600 transition">Location</a>
            <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
          </nav>

          {/* Action Buttons: Order Online & Admin Login */}
          <div className="flex items-center gap-3">
            <Link
              href="/order"
              className="hidden sm:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-bold text-xs transition shadow-sm"
            >
              <i className="fa-solid fa-cloud-arrow-up text-sm"></i> Order Online
            </Link>

            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/dashboard"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-gauge-high text-xs text-blue-400"></i> Admin Panel
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <Link
                href="/admin/dashboard"
                className="bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium text-sm transition shadow-sm inline-flex items-center gap-2"
              >
                <i className="fa-solid fa-right-to-bracket text-xs"></i> Admin Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section id="home" className="relative pt-16 pb-20 px-6 text-center max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Location Badge */}
        <a
          href="#location"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm mb-8 hover:border-blue-400 transition"
        >
          <i className="fa-solid fa-location-dot text-blue-600"></i>
          BHU LANKA ROAD, VARANASI
        </a>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
          Thesis Printing & Graphic Design <br className="hidden sm:block" />
          <span className="text-blue-600">in Varanasi</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base md:text-lg text-slate-600 max-w-2xl font-medium leading-relaxed">
          BABA Graphics offers professional thesis printing, hard binding, spiral binding, graphic design, color printing, xerox, document editing, resume printing, photo printing, and academic project assistance in Varanasi, BHU Lanka.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/order"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-full flex items-center gap-2 transition shadow-lg text-sm"
          >
            <i className="fa-solid fa-file-pdf"></i> Upload PDF & Order Online
          </Link>
          <a
            href="#services"
            className="bg-slate-900 text-white font-semibold px-6 py-3.5 rounded-full flex items-center gap-2 hover:bg-slate-800 transition shadow-lg text-sm"
          >
            Get Started <i className="fa-solid fa-arrow-right text-sm"></i>
          </a>
          <a
            href="https://wa.me/916306474331"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3.5 rounded-full flex items-center gap-2 transition shadow-lg text-sm"
          >
            <i className="fa-brands fa-whatsapp text-lg"></i> WhatsApp Now
          </a>
          <a
            href="https://maps.google.com/?q=Baba+Thesis+printing+and+binding+Saket+Nagar+Colony+Nagwa+Lanka+Varanasi+221005"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/80 border border-slate-200 text-slate-700 font-semibold px-6 py-3.5 rounded-full flex items-center gap-2 hover:bg-white transition shadow-sm text-sm"
          >
            <i className="fa-solid fa-compass text-blue-600"></i> Get Directions
          </a>
        </div>

        {/* Rating / Social Proof */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <div className="flex text-amber-400 gap-1 text-sm">
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            Rated <span className="text-slate-800 font-bold">4.9</span> by 1000+ clients
          </p>
        </div>
      </section>

      {/* ================= METRICS / STATS SECTION ================= */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white/80 border border-slate-200/80 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl mb-3">
              <i className="fa-solid fa-users"></i>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900">1,000+</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Happy Clients</p>
          </div>

          <div className="bg-white/80 border border-slate-200/80 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm backdrop-blur-sm">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl mb-3">
              <i className="fa-solid fa-lightbulb"></i>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900">5,000+</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Projects Delivered</p>
          </div>

          <div className="bg-white/80 border border-slate-200/80 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm backdrop-blur-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl mb-3">
              <i className="fa-solid fa-award"></i>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900">10+</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Years Experience</p>
          </div>

          <div className="bg-white/80 border border-slate-200/80 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl mb-3">
              <i className="fa-solid fa-clock"></i>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900">24×7</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Customer Support</p>
          </div>

        </div>
      </section>

      {/* ================= SERVICES SECTION ================= */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold tracking-widest text-blue-600 uppercase bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            <i className="fa-solid fa-compass mr-1"></i> Our Services in Varanasi
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4">
            Thesis Printing, Binding & Design Services <span className="text-blue-600">in Varanasi</span>
          </h2>
          <p className="text-slate-600 mt-2 text-sm md:text-base font-medium">
            Thesis printing, hard binding, spiral binding, color printing, xerox, document lamination, graphic design, resume printing, ID cards, photo printing, and more — delivered with premium quality and fast turnaround.
          </p>
        </div>

        {/* 3 Studio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Studio 1 */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col">
            <div className="h-44 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex flex-col justify-end text-white relative">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Brand that speaks beautifully</span>
              <h3 className="text-2xl font-bold mt-1">Graphic Design</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-blue-600 text-xs"></i> Logo & Brand Identity</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-blue-600 text-xs"></i> Business & Visiting Cards</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-blue-600 text-xs"></i> Wedding & Invitation Cards</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-blue-600 text-xs"></i> Brochures, Flyers & Posters</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-blue-600 text-xs"></i> Social Media Creatives</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-blue-600 text-xs"></i> Product Packaging & Labels</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-blue-600 text-xs"></i> Book Cover & Magazine Design</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-blue-600 text-xs"></i> AI Image Generation</li>
              </ul>
              <a href="https://wa.me/916306474331" target="_blank" rel="noopener noreferrer" className="mt-8 text-center bg-blue-50 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-600 hover:text-white transition text-xs">
                Get Quote on WhatsApp <i className="fa-solid fa-arrow-right ml-1"></i>
              </a>
            </div>
          </div>

          {/* Studio 2 */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col">
            <div className="h-44 bg-gradient-to-r from-amber-500 to-orange-500 p-6 flex flex-col justify-end text-white relative">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Crisp, vibrant, precise</span>
              <h3 className="text-2xl font-bold mt-1">Printing Services</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-amber-500 text-xs"></i> Color Printout & Black & White Printing</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-amber-500 text-xs"></i> Xerox / Photocopy Services</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-amber-500 text-xs"></i> Thesis Printing - Hardbound & Softbound</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-amber-500 text-xs"></i> Hard Binding, Spiral Binding & Soft Binding</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-amber-500 text-xs"></i> Document Lamination & Scan to PDF</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-amber-500 text-xs"></i> Photo Printing - Glossy/Matte Finish</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-amber-500 text-xs"></i> ID Card & Passport Size Photo Printing</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-amber-500 text-xs"></i> Resume Printing & Professional Services</li>
              </ul>
              <a href="https://wa.me/916306474331" target="_blank" rel="noopener noreferrer" className="mt-8 text-center bg-amber-50 text-amber-600 font-bold py-3 rounded-xl hover:bg-amber-500 hover:text-white transition text-xs">
                Get Quote on WhatsApp <i className="fa-solid fa-arrow-right ml-1"></i>
              </a>
            </div>
          </div>

          {/* Studio 3 */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col">
            <div className="h-44 bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex flex-col justify-end text-white relative">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">From idea to submission</span>
              <h3 className="text-2xl font-bold mt-1">Academic Projects</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i> Thesis Binding & Dissertation Binding</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i> Project Binding - Hard & Soft Binding</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i> Book Binding & Professional Binding Services</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i> Document Editing & English/Hindi Typing</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i> Resume Preparation & Printing</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i> Scan to PDF & Document Digitization</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i> MBA - BCA - MCA - B.Tech Projects</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i> Turnitin Report & Original Content</li>
              </ul>
              <a href="https://wa.me/916306474331" target="_blank" rel="noopener noreferrer" className="mt-8 text-center bg-emerald-50 text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-600 hover:text-white transition text-xs">
                Get Quote on WhatsApp <i className="fa-solid fa-arrow-right ml-1"></i>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ================= COMPREHENSIVE SERVICES LIST SECTION ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl border border-slate-200/60 shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-4">All Services Available in Varanasi</h2>
          <p className="text-slate-600 text-lg">Complete printing, binding, design & document solutions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Printing Services */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-amber-600 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-print text-2xl"></i> Printing Services
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 font-medium">
              <li>✓ Color Printout</li>
              <li>✓ Black & White Printing</li>
              <li>✓ Xerox / Photocopy</li>
              <li>✓ Photo Printing (Glossy/Matte)</li>
              <li>✓ Resume Printing</li>
              <li>✓ ID Card Printing</li>
              <li>✓ Passport Size Photo Printing</li>
            </ul>
          </div>

          {/* Binding Services */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-emerald-600 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-book text-2xl"></i> Binding Services
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 font-medium">
              <li>✓ Thesis Binding</li>
              <li>✓ Hard Binding (Gold Foil)</li>
              <li>✓ Soft Binding</li>
              <li>✓ Spiral Binding</li>
              <li>✓ Project Binding</li>
              <li>✓ Book Binding</li>
              <li>✓ Dissertation Binding</li>
            </ul>
          </div>

          {/* Document Services */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-file-pen text-2xl"></i> Document Services
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 font-medium">
              <li>✓ Document Lamination</li>
              <li>✓ Scan to PDF</li>
              <li>✓ Document Editing</li>
              <li>✓ Hindi Typing</li>
              <li>✓ English Typing</li>
              <li>✓ Plagiarism Report</li>
              <li>✓ Professional Formatting</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= LOCATION & DIRECTIONS SECTION ================= */}
      <section id="location" className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <span className="text-xs font-extrabold tracking-widest text-blue-600 uppercase bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                <i className="fa-solid fa-map-pin mr-1"></i> Find Us
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-2">Visit Our Shop in Varanasi</h2>
              <p className="text-slate-600 text-sm mt-1">Baba Thesis Printing & Binding, Saket Nagar Colony, BHU - Lanka Rd, Nagwa Lanka, Varanasi, UP 221005</p>
            </div>
            <div>
              <a
                href="https://maps.google.com/?q=Baba+Thesis+printing+and+binding+Saket+Nagar+Colony+Nagwa+Lanka+Varanasi+221005"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 transition text-sm shadow-md"
              >
                <i className="fa-solid fa-diamond-turn-right"></i> Get Directions
              </a>
            </div>
          </div>

          {/* Embedded Google Maps Frame */}
          <div className="w-full h-80 md:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
            <iframe 
              title="Baba Thesis Printing Location Map"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.728286877712!2d82.9972!3d25.2801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e31e500000001%3A0x0!2sBaba%20Thesis%20Printing%20And%20Binding!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin">
            </iframe>
          </div>
        </div>
      </section>

      {/* ================= INFINITE SCROLL TICKER BANNER ================= */}
      <div className="bg-slate-900 text-white py-4 overflow-hidden border-y border-slate-800">
        <div className="animate-marquee font-black uppercase text-lg md:text-xl tracking-wider flex gap-8">
          <span>Thesis Printing <span className="text-blue-500 font-normal mx-2">+</span></span>
          <span>Hard Binding <span className="text-blue-500 font-normal mx-2">+</span></span>
          <span>Spiral Binding <span className="text-blue-500 font-normal mx-2">+</span></span>
          <span>Color Printing <span className="text-blue-500 font-normal mx-2">+</span></span>
          <span>Xerox/Photocopy <span className="text-blue-500 font-normal mx-2">+</span></span>
          <span>Lamination <span className="text-blue-500 font-normal mx-2">+</span></span>
          <span>Resume Printing <span className="text-blue-500 font-normal mx-2">+</span></span>
          <span>Photo Printing <span className="text-blue-500 font-normal mx-2">+</span></span>
        </div>
      </div>

      {/* ================= CALLOUT & CONTACT SECTION ================= */}
      <section id="contact" className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Callout */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              <i className="fa-solid fa-wand-magic-sparkles"></i> Let's Create Together
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-6 leading-tight">
              Ready to bring your <span className="text-emerald-400">vision</span> to life?
            </h2>
            <p className="mt-4 text-slate-300 text-sm md:text-base leading-relaxed">
              From logo to launch, thesis to trophy — we handle it all with the care your project deserves. Message us now and get a free quote in minutes.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://wa.me/916306474331"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 transition"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i> WhatsApp Us
              </a>
              <a
                href="tel:+916306474331"
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold px-6 py-3 rounded-full flex items-center gap-2 transition"
              >
                <i className="fa-solid fa-phone text-sm"></i> +91 63064 74331
              </a>
            </div>
          </div>

          {/* Right Contact Info Cards */}
          <div className="space-y-4">
            
            {/* Address Card with Direct Link */}
            <a
              href="https://maps.google.com/?q=Baba+Thesis+printing+and+binding+Saket+Nagar+Colony+Nagwa+Lanka+Varanasi+221005"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4 transition group block"
            >
              <div className="w-12 h-12 bg-blue-500/20 group-hover:bg-blue-500 group-hover:text-white text-blue-400 rounded-xl flex items-center justify-center text-lg shrink-0 transition">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Visit Us (Click for Map)</span>
                <p className="text-sm font-semibold text-slate-100">Baba thesis, printing & Binding, BHU - Lanka Rd, Saket Nagar Colony, Nagwa Lanka, Varanasi, UP 221005</p>
              </div>
            </a>

            {/* Call Card */}
            <a href="tel:+916306474331" className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4 transition block">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-phone"></i>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Call Us</span>
                <p className="text-sm font-semibold text-slate-100">+91 63064 74331</p>
              </div>
            </a>

            {/* WhatsApp Card */}
            <a href="https://wa.me/916306474331" target="_blank" rel="noopener noreferrer" className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4 transition block">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-lg shrink-0">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">WhatsApp</span>
                <p className="text-sm font-semibold text-slate-100">Chat with us instantly</p>
              </div>
            </a>

            {/* Working Hours Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Working Hours</span>
                <p className="text-sm font-semibold text-slate-100">Mon - Sun: 9:00 AM - 9:00 PM</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-900">
          
          {/* Column 1: Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-base">
                <i className="fa-solid fa-shapes"></i>
              </div>
              <span className="text-lg font-bold text-white">BABA Graphics</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Your complete printing, thesis binding, graphic design & academic project solution in Varanasi. Premium quality, fast delivery, unbeatable prices.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="#home" className="hover:text-white transition">Home</a></li>
              <li><a href="#services" className="hover:text-white transition">Services</a></li>
              <li><a href="#about" className="hover:text-white transition">Why Choose Us</a></li>
              <li><a href="#location" className="hover:text-white transition">Location & Directions</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              <li><Link href="/admin/dashboard" className="text-blue-400 hover:text-white transition">Admin ERP Dashboard</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Get In Touch</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-location-dot mt-0.5 text-blue-500"></i>
                <span>Baba thesis, printing & Binding, Saket Nagar Colony, BHU - Lanka Rd, Nagwa Lanka, Varanasi, UP - 221005</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-phone text-blue-500"></i>
                <span>+91 63064 74331</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-brands fa-whatsapp text-emerald-500"></i>
                <a href="https://wa.me/916306474331" target="_blank" rel="noopener noreferrer" className="hover:underline">WhatsApp Chat</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BABA Graphics. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed with <i className="fa-solid fa-heart text-red-500"></i> in Varanasi</p>
        </div>
      </footer>

      {/* ================= FLOATING ACTION BUTTONS ================= */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a
          href="https://maps.google.com/?q=Baba+Thesis+printing+and+binding+Saket+Nagar+Colony+Nagwa+Lanka+Varanasi+221005"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Location Map"
          className="w-12 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center shadow-lg transition"
        >
          <i className="fa-solid fa-location-dot text-lg"></i>
        </a>
        <a
          href="tel:+916306474331"
          aria-label="Call Us"
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition"
        >
          <i className="fa-solid fa-phone text-lg"></i>
        </a>
        <a
          href="https://wa.me/916306474331"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg transition"
        >
          <i className="fa-brands fa-whatsapp text-2xl"></i>
        </a>
      </div>

    </div>
  );
}
