import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  TrendingUp,
  Truck,
  ShieldCheck,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  Hourglass,
  Layers,
  Sparkles,
  Users,
  ChevronRight
} from 'lucide-react';

export default function LandingPage({ onSelectRole, onOpenAuth, onOpenIVR }) {
  const { demoLogin, t } = useAuth();

  // Interactive Live Net Return Calculator on Landing Page
  const [calcSellingPrice, setCalcSellingPrice] = useState(2600);
  const [calcQuantity, setCalcQuantity] = useState(50);
  const [calcTransportTotal, setCalcTransportTotal] = useState(1200);
  const [calcTransportMode, setCalcTransportMode] = useState('BUYER_PAYS'); // 'BUYER_PAYS' | 'SHARED_50_50' | 'FARMER_PAYS'
  const [calcStorageCost, setCalcStorageCost] = useState(250);

  // Dynamic calculation
  const grossRevenue = calcSellingPrice * calcQuantity;
  let farmerTransportDeduction = 0;
  let buyerTransportShare = 0;

  if (calcTransportMode === 'BUYER_PAYS') {
    farmerTransportDeduction = 0;
    buyerTransportShare = calcTransportTotal;
  } else if (calcTransportMode === 'SHARED_50_50') {
    farmerTransportDeduction = Math.round(calcTransportTotal / 2);
    buyerTransportShare = Math.round(calcTransportTotal / 2);
  } else {
    farmerTransportDeduction = calcTransportTotal;
    buyerTransportShare = 0;
  }

  const platformFee = Math.round(grossRevenue * 0.01);
  const transactionCost = 20;
  const expectedLoss = Math.round(grossRevenue * 0.008); // 0.8% handling loss
  const totalDeductions = farmerTransportDeduction + calcStorageCost + platformFee + transactionCost + expectedLoss;
  const netReturn = grossRevenue - totalDeductions;
  const netReturnPerQtl = Math.round(netReturn / calcQuantity);

  return (
    <div className="min-h-screen bg-[#f8faf5] text-stone-900 flex flex-col selection:bg-emerald-200">
      {/* Top Demo Quick Bar for SIH Judges */}
      <div className="bg-stone-900 text-white text-xs py-2 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-stone-950 font-extrabold text-2xs uppercase tracking-wider">
              SIH 2026 • SIH26132
            </span>
            <span className="text-stone-300 hidden sm:inline">
              Strengthening market linkages & price discovery for farmers
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-semibold hidden md:inline">1-Click Demo Evaluation:</span>
            <button
              onClick={() => demoLogin('farmer')}
              className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-2xs transition-colors cursor-pointer"
            >
              🌾 Login as Farmer (Ramesh)
            </button>
            <button
              onClick={() => demoLogin('buyer')}
              className="px-2.5 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold text-2xs transition-colors cursor-pointer"
            >
              🛒 Login as Buyer (Kiran)
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-stone-900">AGRI SETHU</span>
              <p className="text-2xs text-stone-500 font-medium">From Farm to Fair Price</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenIVR}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
              <span>1800-AGRI-SETHU</span>
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>AI-Powered Market Linkages & Price Discovery</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-950 tracking-tight leading-none">
                From Farm to <span className="text-emerald-700 underline decoration-emerald-300">Fair Price</span>.
              </h1>

              <p className="text-lg sm:text-xl text-stone-600 font-medium leading-relaxed max-w-2xl">
                Connecting farmers directly with verified buyers while optimizing for what truly matters: <span className="text-stone-900 font-extrabold">MAXIMUM NET RETURN</span> after transport, storage, and transaction fees.
              </p>

              {/* Dual Role Call-to-Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onSelectRole('farmer')}
                  className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-base shadow-xl shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-2xl">🌾</span>
                    <div>
                      <p className="text-base font-extrabold leading-tight">I'm a Farmer</p>
                      <p className="text-2xs font-normal text-emerald-200">Find highest net return & sell vs wait</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectRole('buyer')}
                  className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-900 font-extrabold text-base border-2 border-stone-200 shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-2xl">🛒</span>
                    <div>
                      <p className="text-base font-extrabold leading-tight">I'm a Buyer</p>
                      <p className="text-2xs font-normal text-stone-500">Procure verified quality produce directly</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              {/* Key Value Badges */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero Middlemen</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Transport Sharing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sell Now or Wait AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Escrow Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Net Return Calculator Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-700 text-white text-3xs font-extrabold uppercase tracking-widest rounded-bl-xl">
                  Live Calculator
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <span>The Net Return Differentiator</span>
                  </h3>
                  <p className="text-2xs text-stone-500 mt-0.5">
                    "Higher gross selling price does NOT always mean higher take-home profit!"
                  </p>
                </div>

                {/* Sliders */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                      <span>Gross Selling Price</span>
                      <span className="text-emerald-700">₹{calcSellingPrice} / quintal</span>
                    </div>
                    <input
                      type="range"
                      min="1500"
                      max="4000"
                      step="50"
                      value={calcSellingPrice}
                      onChange={(e) => setCalcSellingPrice(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                      <span>Harvest Quantity</span>
                      <span className="text-stone-900">{calcQuantity} quintals</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={calcQuantity}
                      onChange={(e) => setCalcQuantity(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Transport Split Mode Buttons */}
                  <div>
                    <span className="block text-2xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                      Transport Responsibility:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 text-2xs font-bold">
                      <button
                        onClick={() => setCalcTransportMode('BUYER_PAYS')}
                        className={`py-2 px-2 rounded-xl border transition-all cursor-pointer ${
                          calcTransportMode === 'BUYER_PAYS'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        Buyer Pays (100%)
                      </button>
                      <button
                        onClick={() => setCalcTransportMode('SHARED_50_50')}
                        className={`py-2 px-2 rounded-xl border transition-all cursor-pointer ${
                          calcTransportMode === 'SHARED_50_50'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        50 / 50 Shared
                      </button>
                      <button
                        onClick={() => setCalcTransportMode('FARMER_PAYS')}
                        className={`py-2 px-2 rounded-xl border transition-all cursor-pointer ${
                          calcTransportMode === 'FARMER_PAYS'
                            ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        Farmer Pays (100%)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calculation Breakdown Card */}
                <div className="p-4 rounded-2xl bg-[#f4f7ee] border border-emerald-200/80 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold text-stone-600">
                    <span>Gross Revenue ({calcQuantity} qtl × ₹{calcSellingPrice})</span>
                    <span>₹{grossRevenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Transport Deduction ({calcTransportMode.replace('_', ' ')})</span>
                    <span className={farmerTransportDeduction > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                      {farmerTransportDeduction > 0 ? `-₹${farmerTransportDeduction.toLocaleString('en-IN')}` : '₹0 (Buyer Paid)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Storage & Spoilage Avoided</span>
                    <span>-₹{(calcStorageCost + expectedLoss).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Platform Fee (1%)</span>
                    <span>-₹{platformFee.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="border-t border-emerald-300 pt-2 flex items-baseline justify-between font-extrabold text-stone-950">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-emerald-900 block">REAL NET RETURN:</span>
                      <span className="text-2xs font-medium text-stone-500">₹{netReturnPerQtl}/quintal take-home</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-800">
                      ₹{netReturn.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectRole('farmer')}
                  className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Experience Full Farmer Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* The 10 Core Farmer Questions Solved by AgriSethu */}
        <section className="bg-white py-16 border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Problem Statement SIH26132</span>
              <h2 className="text-3xl font-black text-stone-950 mt-1">10 Critical Questions Every Farmer Faces</h2>
              <p className="text-stone-500 text-sm mt-2">
                AgriSethu replaces guesswork and intermediary exploitation with transparent, algorithmic market intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { q: '1. Where should I sell?', a: 'Compares Local Mandi vs City Wholesale vs Food Processors vs FPOs ranked by net profit.' },
                { q: '2. What price can I realistically get?', a: 'AI quality grading assesses size, freshness, and color to recommend accurate spot price premiums.' },
                { q: '3. Which buyer gives the highest NET RETURN?', a: 'Evaluates gross offer minus transport, handling, and fees to discover true profitability.' },
                { q: '4. Should I sell NOW or WAIT?', a: 'Analyzes momentum, weather disruption risks, and storage spoilage to output SELL or WAIT recommendations.' },
                { q: '5. How much will transport cost?', a: 'Calculates vehicle type, distance, and per-km freight with 4 dynamic cost-sharing modes.' },
                { q: '6. How much will storage cost?', a: 'Simulates daily warehouse charges and spoilage decay over 3 to 14-day hold horizons.' },
                { q: '7. What is my expected loss?', a: 'Perishability risk modeling warns when holding crops past safe shelf-life destroys profits.' },
                { q: '8. Which buyer is trustworthy?', a: 'Buyer Trust Score (0-100) measures settlement speed, dispute records, and escrow compliance.' },
                { q: '9. What happens to my final earnings?', a: 'Full transparent breakdown of gross revenue, deductions, and actual bank take-home before selling.' },
                { q: '10. How to sell without middlemen?', a: 'Direct digital escrow linkage bypassing APMC middlemen commissions and hidden weighing cuts.' }
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#fcfdfa] border border-stone-200 hover:border-emerald-300 hover:shadow-md transition-all">
                  <h4 className="font-extrabold text-sm text-stone-900 mb-1.5">{item.q}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Toll-Free IVR Phone Helpline Showcase */}
        <section className="bg-emerald-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Basic Phone & Low Connectivity Accessibility</span>
                </div>
                <h3 className="text-3xl font-black tracking-tight">
                  Toll-Free 1800-AGRI-SETHU: Voice Helpline for Feature Phones
                </h3>
                <p className="text-emerald-100 text-sm leading-relaxed max-w-2xl">
                  Farmers without smartphones or 4G data can dial our toll-free number from any basic feature phone to query mandi prices, receive Sell vs Wait advisories, and calculate net returns in their native language (Telugu, Hindi, or English).
                </p>
              </div>

              <div className="lg:col-span-4 flex justify-start lg:justify-end">
                <button
                  onClick={onOpenIVR}
                  className="px-6 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-sm shadow-xl transition-all flex items-center gap-3 cursor-pointer"
                >
                  <PhoneCall className="w-5 h-5 text-emerald-700 animate-bounce" />
                  <span>Launch Interactive Simulator</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 text-xs text-stone-500 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-stone-800">AGRI SETHU — “From Farm to Fair Price”</p>
          <p>Smart India Hackathon 2026 • Problem Statement SIH26132</p>
        </div>
      </footer>
    </div>
  );
}
