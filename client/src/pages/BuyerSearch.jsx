import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Truck,
  ArrowRight,
  Handshake
} from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import MakeOfferModal from '../components/MakeOfferModal';
import PaymentModal from '../components/PaymentModal';

export default function BuyerSearch({ setActiveTab }) {
  const [query, setQuery] = useState('');
  const [crop, setCrop] = useState('All');
  const [grade, setGrade] = useState('All');
  const [maxDistance, setMaxDistance] = useState(100);
  const [sortBy, setSortBy] = useState('recommended');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedListing, setSelectedListing] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [crop, grade, maxDistance, sortBy]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agrisethu_token');
      const params = new URLSearchParams({
        crop: crop !== 'All' ? crop : '',
        grade: grade !== 'All' ? grade : '',
        maxDistance,
        sortBy
      });

      const res = await fetch(`/api/buyer/search?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = (listing) => {
    setSelectedListing(listing);
    setShowCheckout(true);
  };

  const handleMakeOffer = (listing) => {
    setSelectedListing(listing);
    setShowOffer(true);
  };

  const handleOrderConfirmed = (order) => {
    setConfirmedOrder(order);
    setShowPayment(true);
  };

  const filteredListings = listings.filter(l =>
    l.cropName.toLowerCase().includes(query.toLowerCase()) ||
    l.farmerName.toLowerCase().includes(query.toLowerCase()) ||
    l.farmerLocation.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
          Find Quality Produce Directly From Farmers
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-medium">
          Source certified grade produce directly with transparent transport cost-sharing and escrow safety.
        </p>
      </div>

      {/* Search Bar & Filter Drawer Bar */}
      <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by crop, farmer name, or village..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden bg-stone-50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 bg-white"
            >
              <option value="All">All Crops</option>
              <option value="Tomato">Tomato</option>
              <option value="Chilli">Chilli</option>
              <option value="Cotton">Cotton</option>
              <option value="Rice">Rice</option>
              <option value="Onion">Onion</option>
            </select>

            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 bg-white"
            >
              <option value="All">All Quality Grades</option>
              <option value="A">Grade A (Premium)</option>
              <option value="B">Grade B (Standard)</option>
              <option value="C">Grade C (Discounted)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 bg-white"
            >
              <option value="recommended">Best Recommended Match</option>
              <option value="lowest_price">Lowest Price</option>
              <option value="highest_quality">Highest Quality</option>
              <option value="nearest">Nearest Farmer</option>
            </select>
          </div>
        </div>

        {/* Distance Range Slider */}
        <div className="flex items-center justify-between text-2xs font-bold text-stone-500 border-t border-stone-100 pt-2">
          <div className="flex items-center gap-2">
            <span>Radius Limit:</span>
            <input
              type="range"
              min="15"
              max="150"
              step="5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="accent-emerald-600 cursor-pointer w-28 sm:w-48"
            />
            <span className="text-emerald-800 font-extrabold">{maxDistance} km</span>
          </div>
          <span className="text-stone-400">{filteredListings.length} Produce Batches Available</span>
        </div>
      </div>

      {/* Produce Grid */}
      {loading ? (
        <div className="p-12 text-center text-stone-400 text-xs font-bold">
          Searching nearby farmgate produce batches...
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center text-stone-400 text-xs">
          No produce matches your current filters. Try widening your search radius or selecting all crops.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={listing.imageUrl}
                    alt={listing.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-2xs font-black bg-emerald-700 text-white shadow-md">
                      Grade {listing.qualityGrade}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-2xs font-bold bg-stone-900/80 backdrop-blur-xs text-white shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>{listing.aiQualityAssessment?.confidence || 94}% AI Certified</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-xs font-black text-emerald-800 text-sm shadow-md">
                    ₹{listing.sellingPrice?.toLocaleString('en-IN')} <span className="text-3xs font-semibold text-stone-500">/ qtl</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-black text-lg text-stone-900 leading-tight">
                      {listing.cropName} ({listing.variety})
                    </h3>
                    <div className="flex items-center gap-1 text-2xs text-stone-500 mt-1">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{listing.farmerLocation}</span>
                      <span className="font-bold text-stone-800">• {listing.distanceKm} km away</span>
                    </div>
                  </div>

                  {/* Farmer profile & verified status */}
                  <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-3xs">
                        {listing.farmerName[0]}
                      </div>
                      <div>
                        <span className="font-bold text-stone-800">{listing.farmerName}</span>
                        <div className="flex items-center gap-1 text-3xs text-emerald-700 font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Farmer</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xs text-stone-400 block">Available</span>
                      <span className="font-black text-xs text-stone-900">{listing.quantity} {listing.unit}s</span>
                    </div>
                  </div>

                  {/* Logistics & Transit preview */}
                  <div className="flex items-center justify-between text-2xs text-stone-500">
                    <div className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-stone-400" />
                      <span>Est. Transit: {listing.estimatedDeliveryHours || 1.5} hrs</span>
                    </div>
                    <span className="font-bold text-emerald-700">Split Transport Available</span>
                  </div>
                </div>
              </div>

              {/* Actions: Make Offer & Buy Now */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleMakeOffer(listing)}
                  className="py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>Make Offer</span>
                </button>

                <button
                  onClick={() => handleBuyNow(listing)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        listing={selectedListing}
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onOrderConfirmed={handleOrderConfirmed}
      />

      {/* Make Offer Modal */}
      <MakeOfferModal
        listing={selectedListing}
        isOpen={showOffer}
        onClose={() => setShowOffer(false)}
        onOfferSubmitted={() => fetchListings()}
      />

      {/* Sandbox Payment Modal */}
      <PaymentModal
        order={confirmedOrder}
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onPaymentSuccess={(updatedOrder) => {
          setShowPayment(false);
          setActiveTab('orders');
        }}
      />
    </div>
  );
}
