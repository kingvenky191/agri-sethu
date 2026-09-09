import React, { useState, useEffect } from 'react';
import { TrendingUp, Bell, ArrowUpRight, ArrowDownRight, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function MarketPrices() {
  const [crop, setCrop] = useState('Tomato');
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetPrice, setTargetPrice] = useState(2600);
  const [alertSaved, setAlertSaved] = useState(false);

  useEffect(() => {
    fetchPrices();
  }, [crop, days]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/prices?crop=${crop}&days=${days}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAlert = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('agrisethu_token');
      await fetch('/api/farmer/price-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cropName: crop, targetPrice: Number(targetPrice) })
      });
      setAlertSaved(true);
      setTimeout(() => setAlertSaved(false), 3000);
    } catch (e) {
      alert('Alert saved locally');
    }
  };

  const history = data?.history || [];
  const latest = data?.latest;

  // Simple SVG Line Chart generator
  const maxP = Math.max(...history.map(h => h.cityMandiPrice || 0), 3000);
  const minP = Math.min(...history.map(h => h.localMandiPrice || 0), 1000);
  const range = maxP - minP || 1;

  const pointsLocal = history.map((h, i) => {
    const x = (i / (history.length - 1 || 1)) * 500;
    const y = 140 - (((h.localMandiPrice - minP) / range) * 110);
    return `${x},${y}`;
  }).join(' ');

  const pointsCity = history.map((h, i) => {
    const x = (i / (history.length - 1 || 1)) * 500;
    const y = 140 - (((h.cityMandiPrice - minP) / range) * 110);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight flex items-center gap-2">
            <span>Market Price Discovery & Trends</span>
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            Real-time daily mandi spot benchmarks across APMC Mandis, Terminal Hubs & Food Processors.
          </p>
        </div>

        {/* Crop Selector */}
        <div className="flex items-center gap-2">
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-stone-200 text-xs font-bold text-stone-800 bg-white shadow-2xs"
          >
            <option value="Tomato">Tomato (టమోటా)</option>
            <option value="Chilli">Chilli (మిర్చి)</option>
            <option value="Cotton">Cotton (పత్తి)</option>
            <option value="Rice">Rice (వరి)</option>
            <option value="Onion">Onion (ఉల్లి)</option>
          </select>

          <div className="flex bg-stone-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setDays(7)}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${days === 7 ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500'}`}
            >
              7D
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${days === 30 ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500'}`}
            >
              30D
            </button>
          </div>
        </div>
      </div>

      {/* Spot Price Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <span className="text-2xs font-extrabold uppercase tracking-wider text-stone-500 block">Warangal Local APMC Mandi</span>
          <div className="text-2xl font-black text-stone-900 mt-1">
            ₹{latest?.localMandiPrice?.toLocaleString('en-IN') || '---'}
          </div>
          <span className="text-2xs font-semibold text-stone-500">Per Quintal • 14 km away</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <span className="text-2xs font-extrabold uppercase tracking-wider text-stone-500 block">Hyderabad Bowenpally Terminal</span>
          <div className="text-2xl font-black text-blue-900 mt-1">
            ₹{latest?.cityMandiPrice?.toLocaleString('en-IN') || '---'}
          </div>
          <span className="text-2xs font-semibold text-stone-500">Per Quintal • 145 km away</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border-2 border-emerald-300 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase tracking-wider text-emerald-800">Direct Food Processor</span>
            <span className="text-3xs font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">No Cess</span>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">
            ₹{latest?.processorPrice?.toLocaleString('en-IN') || '---'}
          </div>
          <span className="text-2xs font-semibold text-stone-500">Per Quintal • 32 km away (Buyer Pays Freight)</span>
        </div>
      </div>

      {/* Interactive Price Trend Chart */}
      <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-stone-900">Historical Price Movement ({days} Days)</h3>
            <p className="text-2xs text-stone-500">Comparing Local Mandi vs Terminal Wholesale City Mandi</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span className="text-stone-700">Local APMC Mandi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-stone-700">City Wholesale Mandi</span>
            </div>
          </div>
        </div>

        {/* SVG Sparkline Chart */}
        <div className="w-full bg-stone-50 rounded-2xl p-4 border border-stone-100 overflow-x-auto">
          <svg viewBox="0 0 500 160" className="w-full h-48">
            {/* Grid lines */}
            <line x1="0" y1="30" x2="500" y2="30" stroke="#e5e7eb" strokeDasharray="4 4" />
            <line x1="0" y1="80" x2="500" y2="80" stroke="#e5e7eb" strokeDasharray="4 4" />
            <line x1="0" y1="130" x2="500" y2="130" stroke="#e5e7eb" strokeDasharray="4 4" />

            {/* City Mandi Polyline (Blue) */}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsCity}
            />

            {/* Local Mandi Polyline (Emerald) */}
            <polyline
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsLocal}
            />
          </svg>
        </div>
      </div>

      {/* Target Price Alert Setter */}
      <div className="p-6 bg-emerald-50/70 rounded-3xl border border-emerald-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-700" />
            <span>Set Target Price Alert for {crop}</span>
          </h3>
          <p className="text-2xs text-emerald-800 mt-0.5">
            Receive in-app & SMS notification immediately when market or buyer price touches your target rate.
          </p>
        </div>

        <form onSubmit={handleSaveAlert} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-bold text-stone-500">₹</span>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="pl-7 pr-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-emerald-900 w-32 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
          >
            {alertSaved ? '✓ Alert Active' : 'Set Alert'}
          </button>
        </form>
      </div>
    </div>
  );
}
