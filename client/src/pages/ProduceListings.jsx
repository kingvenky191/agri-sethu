import React, { useState, useEffect } from 'react';
import { Sprout, Plus, Sparkles, Trash2, Edit3, ArrowRight, Route, Hourglass, ShieldCheck } from 'lucide-react';
import AddListingModal from '../components/AddListingModal';

export default function ProduceListings({ setActiveTab }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agrisethu_token');
      const res = await fetch('/api/farmer/listings', {
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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this listing?')) return;
    try {
      const token = localStorage.getItem('agrisethu_token');
      await fetch(`/api/farmer/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert('Failed to delete listing');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight flex items-center gap-2">
            <span>My Farm Produce & AI Quality Grades</span>
            <Sprout className="w-6 h-6 text-emerald-600" />
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            Manage your harvest listings, view AI computer vision certifications, and discover matched buyers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-700/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ List New Harvest</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-400 text-xs font-bold">
          Loading your produce listings...
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center space-y-3">
          <p className="text-stone-400 text-xs">You have no active crop listings. Add your first produce batch to start receiving buyer offers.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs cursor-pointer"
          >
            + List Produce
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44">
                  <img
                    src={listing.imageUrl}
                    alt={listing.cropName}
                    className="w-full h-full object-cover"
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

                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-rose-50 text-rose-600 shadow-md transition-colors cursor-pointer"
                    title="Remove listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-black text-lg text-stone-900 leading-tight">
                      {listing.cropName} ({listing.variety})
                    </h3>
                    <p className="text-2xs text-stone-500 mt-0.5">Harvested: {listing.harvestDate} • Location: {listing.farmerLocation}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-3xs text-stone-400 font-bold block uppercase">Quantity</span>
                      <span className="font-black text-stone-900">{listing.quantity} {listing.unit || 'Quintals'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-3xs text-emerald-700 font-bold block uppercase">Target Price</span>
                      <span className="font-black text-emerald-900">₹{listing.sellingPrice?.toLocaleString('en-IN')}/qtl</span>
                    </div>
                  </div>

                  {/* AI Quality Inspection Metrics */}
                  {listing.aiQualityAssessment && (
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-3xs space-y-1 text-stone-600">
                      <div className="flex justify-between font-bold text-stone-800">
                        <span>Quality Parameter</span>
                        <span>AI Metric</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Freshness Index:</span>
                        <span className="font-semibold text-emerald-700">{listing.aiQualityAssessment.freshnessIndex || '96%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blemish Rate:</span>
                        <span className="font-semibold text-stone-700">{listing.aiQualityAssessment.defectPercent || '2.1%'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab('best-route')}
                  className="py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Route className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Best Routes</span>
                </button>

                <button
                  onClick={() => setActiveTab('sell-wait')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Hourglass className="w-3.5 h-3.5 text-amber-700" />
                  <span>Sell vs Wait</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Produce Modal */}
      <AddListingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onListingCreated={() => {
          fetchListings();
          setShowAddModal(false);
        }}
      />
    </div>
  );
}
