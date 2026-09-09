import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Route,
  Hourglass,
  Users,
  Truck,
  Sparkles,
  CloudSun,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import AddListingModal from '../components/AddListingModal';

export default function FarmerDashboard({ setActiveTab }) {
  const { user, t } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('agrisethu_token');
      const res = await fetch('/api/farmer/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-stone-500">Loading AgriSethu Market Intelligence...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const bestRoute = data?.bestRouteAnalysis?.bestRoute || {};
  const weather = data?.weather || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight flex items-center gap-2">
            <span>{t('dashboard.greeting')}, {user?.name || 'Ramesh Patel'}</span>
            <span className="text-2xl">🌾</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            "{t('dashboard.todayMarket')}"
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-700/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('dashboard.listProduceBtn')}</span>
        </button>
      </div>

      {/* Weather Advisory Alert Banner */}
      {weather.agriAdvisories?.[0] && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-amber-950 block">
                Agrometeorological Advisory: {weather.agriAdvisories[0].crop}
              </span>
              <p className="text-2xs text-amber-800 mt-0.5 leading-relaxed">
                {weather.agriAdvisories[0].warning} {weather.agriAdvisories[0].recommendation}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-3xs font-extrabold bg-amber-200/80 text-amber-900 shrink-0">
            High Priority Alert
          </span>
        </div>
      )}

      {/* 8 Core Farmer KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Market Price */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-2xs font-extrabold uppercase tracking-wider text-stone-500 mb-2">
            <span>{t('dashboard.currentMarketPrice')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-950">
            ₹{kpis.currentMarketPrice?.toLocaleString('en-IN')}
          </div>
          <p className="text-2xs text-stone-500 mt-1">
            Local Mandi Spot Rate ({data?.primaryCrop})
          </p>
        </div>

        {/* Card 2: Best Selling Market */}
        <div
          onClick={() => setActiveTab('best-route')}
          className="p-5 rounded-3xl bg-white border-2 border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-2xs font-extrabold uppercase tracking-wider text-emerald-800 mb-2">
            <span>{t('dashboard.bestSellingMarket')}</span>
            <Route className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-sm font-black text-stone-900 truncate" title={kpis.bestMarketName}>
            {kpis.bestMarketName || 'Food Processor'}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-2xs font-bold text-emerald-700">₹{kpis.bestMarketSellingPrice}/qtl gross</span>
            <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              🏆 Best Route
            </span>
          </div>
        </div>

        {/* Card 3: Expected Net Return */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-800 to-green-700 text-white shadow-lg shadow-emerald-800/20">
          <div className="flex items-center justify-between text-2xs font-extrabold uppercase tracking-wider text-emerald-200 mb-2">
            <span>{t('dashboard.expectedNetReturn')}</span>
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-2xl font-black">
            ₹{kpis.expectedNetReturnPerQtl?.toLocaleString('en-IN')}
          </div>
          <p className="text-2xs text-emerald-100 mt-1">
            Real Take-Home per Quintal after deductions
          </p>
        </div>

        {/* Card 4: Sell Now / Wait */}
        <div
          onClick={() => setActiveTab('sell-wait')}
          className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-2xs font-extrabold uppercase tracking-wider text-stone-500 mb-2">
            <span>{t('dashboard.sellNowWait')}</span>
            <Hourglass className="w-4 h-4 text-amber-600" />
          </div>
          <div className="inline-block px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            {kpis.sellWaitRecommendation || 'SELL NOW'}
          </div>
          <p className="text-2xs text-stone-500 mt-2 flex items-center gap-1">
            <span>Confidence:</span>
            <span className="font-bold text-emerald-700">{data?.sellWaitAnalysis?.confidence}%</span>
          </p>
        </div>

        {/* Card 5: Top Buyer Match */}
        <div
          onClick={() => setActiveTab('matched-buyers')}
          className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-2xs font-extrabold uppercase tracking-wider text-stone-500 mb-2">
            <span>{t('dashboard.topBuyer')}</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm font-bold text-stone-900 truncate">
            {data?.topBuyerMatch?.buyerName || 'Fresh Foods Processing'}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-2xs font-bold text-blue-700">{data?.topBuyerMatch?.matchScore || 96}% Match</span>
            <span className="text-3xs text-stone-400">{data?.topBuyerMatch?.distanceKm || 34} km away</span>
          </div>
        </div>

        {/* Card 6: Transport Deduction */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-2xs font-extrabold uppercase tracking-wider text-stone-500 mb-2">
            <span>{t('dashboard.transportCost')}</span>
            <Truck className="w-4 h-4 text-stone-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700">
            ₹0 Deduction
          </div>
          <p className="text-2xs text-stone-500 mt-1">
            When Processor/Buyer covers transport
          </p>
        </div>

        {/* Card 7: Storage Cost & Loss Avoided */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-2xs font-extrabold uppercase tracking-wider text-stone-500 mb-2">
            <span>{t('dashboard.storageCost')}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-stone-900">
            ₹75 / quintal
          </div>
          <p className="text-2xs text-stone-500 mt-1">
            Simulated 3-day hold decay
          </p>
        </div>

        {/* Card 8: Market Trend Momentum */}
        <div
          onClick={() => setActiveTab('market-prices')}
          className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-2xs font-extrabold uppercase tracking-wider text-stone-500 mb-2">
            <span>{t('dashboard.marketTrend')}</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700">
            +11.8% (7 Days)
          </div>
          <p className="text-2xs text-stone-500 mt-1">
            Terminal demand expanding
          </p>
        </div>
      </div>

      {/* Produce Listings & Active Orders Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Produce Listings */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-stone-900">{t('dashboard.activeListings')}</h3>
            <button
              onClick={() => setActiveTab('my-produce')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              {t('dashboard.viewAll')}
            </button>
          </div>

          <div className="space-y-3">
            {data?.recentListings?.map((listing) => (
              <div
                key={listing.id}
                className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={listing.imageUrl}
                    alt={listing.cropName}
                    className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-stone-900">{listing.cropName}</span>
                      <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Grade {listing.qualityGrade} ({listing.aiQualityAssessment?.confidence || 94}% AI)
                      </span>
                    </div>
                    <p className="text-2xs text-stone-500 mt-0.5">{listing.variety} • {listing.quantity} {listing.unit}s available</p>
                    <p className="text-xs font-bold text-emerald-700 mt-1">₹{listing.sellingPrice?.toLocaleString('en-IN')} / quintal</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setActiveTab('best-route')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-400 text-2xs font-bold text-stone-700 transition-colors cursor-pointer"
                  >
                    Routes
                  </button>
                  <button
                    onClick={() => setActiveTab('sell-wait')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-2xs font-bold text-emerald-800 transition-colors cursor-pointer"
                  >
                    Sell vs Wait
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Pending Orders & Logistics Timeline Preview */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-stone-900">{t('dashboard.pendingOrders')}</h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              {t('dashboard.viewAll')}
            </button>
          </div>

          {data?.activeOrders?.length > 0 ? (
            data.activeOrders.map((order) => (
              <div key={order.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xs font-bold text-stone-500">#{order.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-stone-900">{order.quantity} qtl of {order.cropName}</h4>
                  <p className="text-2xs text-stone-500">Buyer: <span className="font-semibold text-stone-700">{order.buyerName}</span></p>
                  <p className="text-2xs font-bold text-emerald-700 mt-1">Farmer Net Return: ₹{order.farmerNetReturn?.toLocaleString('en-IN')}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-2xs text-stone-600 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{order.logistics?.driverName || 'Srinivas Rao'} ({order.logistics?.vehicleNumber || 'TS 03 UA 7824'})</span>
                  </div>
                  <span className="font-bold text-emerald-700">{order.logistics?.estimatedDeliveryHours || '1.5'} hrs away</span>
                </div>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-2xs font-bold transition-all cursor-pointer"
                >
                  Track Live Logistics Timeline
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-stone-400 text-xs">
              No pending orders. When buyers purchase your produce, tracking will appear here.
            </div>
          )}
        </div>
      </div>

      {/* Add Listing Modal */}
      <AddListingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onListingCreated={() => {
          fetchDashboard();
          setShowAddModal(false);
        }}
      />
    </div>
  );
}
