import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import IVRSimulatorModal from './components/IVRSimulatorModal';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import FarmerDashboard from './pages/FarmerDashboard';
import ProduceListings from './pages/ProduceListings';
import BestRoute from './pages/BestRoute';
import SellWaitEngine from './pages/SellWaitEngine';
import MarketPrices from './pages/MarketPrices';
import BuyerSearch from './pages/BuyerSearch';
import OrdersPage from './pages/OrdersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MatchedBuyers from './pages/MatchedBuyers';

function AppContent() {
  const { isAuthenticated, role } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authRole, setAuthRole] = useState('farmer');
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isIVROpen, setIsIVROpen] = useState(false);

  // If user is not logged in, show Landing Page or Auth Page
  if (!isAuthenticated) {
    if (showAuth) {
      return (
        <>
          <AuthPage
            defaultRole={authRole}
            defaultMode={authMode}
            onBackToHome={() => setShowAuth(false)}
          />
          <IVRSimulatorModal
            isOpen={isIVROpen}
            onClose={() => setIsIVROpen(false)}
          />
        </>
      );
    }

    return (
      <>
        <LandingPage
          onSelectRole={(r) => {
            setAuthRole(r);
            setAuthMode('login');
            setShowAuth(true);
          }}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setShowAuth(true);
          }}
          onOpenIVR={() => setIsIVROpen(true)}
        />
        <IVRSimulatorModal
          isOpen={isIVROpen}
          onClose={() => setIsIVROpen(false)}
        />
      </>
    );
  }

  // Determine active tab default when switching roles
  const effectiveTab = (role === 'buyer' && activeTab === 'dashboard') ? 'marketplace' : activeTab;

  return (
    <div className="min-h-screen bg-[#f8faf5] flex flex-col text-stone-900 selection:bg-emerald-200">
      {/* Top Navigation */}
      <Navbar
        onOpenIVR={() => setIsIVROpen(true)}
        activeTab={effectiveTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Role-Specific Sidebar */}
        <Sidebar
          activeTab={effectiveTab}
          setActiveTab={setActiveTab}
          onOpenIVR={() => setIsIVROpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden">
          {effectiveTab === 'dashboard' && <FarmerDashboard setActiveTab={setActiveTab} />}
          {effectiveTab === 'my-produce' && <ProduceListings setActiveTab={setActiveTab} />}
          {effectiveTab === 'best-route' && <BestRoute />}
          {effectiveTab === 'sell-wait' && <SellWaitEngine />}
          {effectiveTab === 'market-prices' && <MarketPrices />}
          {effectiveTab === 'price-alerts' && <MarketPrices />}
          {effectiveTab === 'matched-buyers' && <MatchedBuyers setActiveTab={setActiveTab} />}
          {effectiveTab === 'marketplace' && <BuyerSearch setActiveTab={setActiveTab} />}
          {effectiveTab === 'orders' && <OrdersPage />}
          {effectiveTab === 'analytics' && <AnalyticsPage />}
          {effectiveTab === 'saved-farmers' && <MatchedBuyers setActiveTab={setActiveTab} />}
        </main>
      </div>

      {/* Global IVR Helpline Simulator Modal */}
      <IVRSimulatorModal
        isOpen={isIVROpen}
        onClose={() => setIsIVROpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
