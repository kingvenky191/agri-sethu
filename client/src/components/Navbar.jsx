import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  PhoneCall,
  Globe,
  Bell,
  LogOut,
  User,
  Wifi,
  WifiOff,
  ArrowRightLeft,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ onOpenIVR, activeTab, setActiveTab }) {
  const { user, role, logout, lang, setLang, t, isOnline, lastSyncTime, demoLogin } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Offer Received: Fresh Foods', desc: '₹2,550/qtl for 50 quintals Tomato (Buyer pays transport)', time: '10m ago' },
    { id: 2, title: 'Price Spike: Bowenpally Mandi', desc: 'Tomato jumped to ₹2,650/qtl (+₹140 today)', time: '1h ago' },
    { id: 3, title: 'Truck Dispatched', desc: 'Order #ORD-2026-8812 is en route to processing plant', time: '2h ago' }
  ];

  const handleRoleSwitch = async () => {
    if (role === 'farmer') {
      await demoLogin('buyer');
      setActiveTab('marketplace');
    } else {
      await demoLogin('farmer');
      setActiveTab('dashboard');
    }
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(role === 'buyer' ? 'marketplace' : 'dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-stone-900">AGRI SETHU</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  SIH 2026
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium hidden md:block">
                {t('tagline')} • <span className="text-emerald-700 font-semibold">Maximum Net Return</span>
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Online / Offline Status Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span className="text-emerald-700 font-semibold">{t('common.online')}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-700 font-semibold" title={`Cached at ${lastSyncTime}`}>
                    {t('common.offline')}
                  </span>
                </>
              )}
            </div>

            {/* Toll-Free IVR Simulator Launcher */}
            <button
              onClick={onOpenIVR}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
              title="Toll-free IVR helpline for basic phone users"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700 animate-bounce" />
              <span className="hidden sm:inline">1800-AGRI-SETHU</span>
              <span className="sm:hidden">IVR</span>
            </button>

            {/* Trilingual Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === 'te' ? 'తెలుగు' : lang === 'hi' ? 'हिन्दी' : 'English'}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50">
                  <button
                    onClick={() => { setLang('en'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 ${lang === 'en' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-stone-700'}`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => { setLang('te'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 ${lang === 'te' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-stone-700'}`}
                  >
                    🌾 తెలుగు (Telugu)
                  </button>
                  <button
                    onClick={() => { setLang('hi'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 ${lang === 'hi' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-stone-700'}`}
                  >
                    🇮🇳 हिन्दी (Hindi)
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white"></span>
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 p-3 z-50">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2">
                    <span className="font-bold text-xs text-stone-900">Notifications</span>
                    <span className="text-2xs text-emerald-700 font-semibold">3 New Alerts</span>
                  </div>
                  <div className="space-y-2">
                    {notifications.map(n => (
                      <div key={n.id} className="p-2 rounded-lg bg-stone-50 hover:bg-emerald-50/50 border border-stone-100 transition-colors">
                        <p className="text-xs font-semibold text-stone-800">{n.title}</p>
                        <p className="text-2xs text-stone-600 mt-0.5">{n.desc}</p>
                        <p className="text-2xs text-stone-400 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick 1-Click Role Switcher (For SIH Judges & Testing) */}
            <button
              onClick={handleRoleSwitch}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                role === 'farmer'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Quickly switch between Farmer and Buyer experience"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Switch to {role === 'farmer' ? 'Buyer' : 'Farmer'}</span>
            </button>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-stone-200 hover:border-stone-300 bg-stone-50 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-stone-900 leading-tight">{user?.name || 'Ramesh'}</p>
                  <p className="text-2xs font-semibold uppercase tracking-wider text-emerald-700">
                    {role === 'farmer' ? '🌾 Farmer' : role === 'buyer' ? '🛒 Buyer' : '⚙️ Admin'}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900">{user?.name}</p>
                    <p className="text-2xs text-stone-500">{user?.mobile || user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" /> Profile & Settings
                  </button>
                  <button
                    onClick={() => { logout(); setShowProfileMenu(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-stone-100"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
