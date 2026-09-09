import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Sprout,
  TrendingUp,
  Route,
  Hourglass,
  Users,
  Truck,
  BarChart3,
  BellRing,
  ShoppingBag,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenIVR }) {
  const { role, t } = useAuth();

  const farmerNavItems = [
    { key: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { key: 'my-produce', label: t('nav.myProduce'), icon: Sprout },
    { key: 'market-prices', label: t('nav.marketPrices'), icon: TrendingUp },
    { key: 'best-route', label: t('nav.bestRoute'), icon: Route, highlight: true },
    { key: 'sell-wait', label: t('nav.sellWait'), icon: Hourglass, badge: 'AI' },
    { key: 'matched-buyers', label: t('nav.matchedBuyers'), icon: Users },
    { key: 'orders', label: t('nav.orders'), icon: Truck },
    { key: 'analytics', label: t('nav.analytics'), icon: BarChart3 },
    { key: 'price-alerts', label: t('nav.priceAlerts'), icon: BellRing }
  ];

  const buyerNavItems = [
    { key: 'marketplace', label: t('nav.marketplace'), icon: ShoppingBag, highlight: true },
    { key: 'orders', label: t('nav.orders'), icon: Truck },
    { key: 'analytics', label: t('nav.analytics'), icon: BarChart3 },
    { key: 'saved-farmers', label: t('nav.savedFarmers'), icon: Users }
  ];

  const navItems = role === 'buyer' ? buyerNavItems : farmerNavItems;

  return (
    <aside className="w-64 shrink-0 hidden lg:block bg-white border-r border-stone-200 min-h-[calc(100vh-4rem)] p-4">
      {/* Role Pill Banner */}
      <div className={`p-3 rounded-xl mb-4 border ${
        role === 'buyer'
          ? 'bg-blue-50/70 border-blue-200 text-blue-900'
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-base">{role === 'buyer' ? '🛒' : '🌾'}</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">{role === 'buyer' ? 'Buyer Portal' : 'Farmer Portal'}</p>
            <p className="text-2xs text-stone-500 font-medium">
              {role === 'buyer' ? 'Direct Farmgate Sourcing' : 'Maximum Net Return Engine'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? role === 'buyer'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-emerald-700 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-600' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-2xs font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* IVR Toll-Free Box in Sidebar */}
      <div className="mt-8 p-3.5 rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <PhoneCall className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Basic Phone IVR</span>
        </div>
        <p className="text-2xs text-stone-300 leading-relaxed mb-3">
          For farmers without smartphones. Interactive voice menu in Telugu, Hindi & English.
        </p>
        <button
          onClick={onOpenIVR}
          className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Launch Simulator</span>
        </button>
      </div>

      {/* Trust & Guarantee Badge */}
      <div className="mt-4 p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="text-2xs text-stone-600 leading-tight">
          <span className="font-bold text-stone-800">100% Escrow Guarantee</span>
          <p className="mt-0.5">Payments locked before transport pickup.</p>
        </div>
      </div>
    </aside>
  );
}
