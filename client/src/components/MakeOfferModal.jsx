import React, { useState } from 'react';
import { Handshake, X, ArrowRight, ShieldAlert } from 'lucide-react';

export default function MakeOfferModal({ listing, isOpen, onClose, onOfferSubmitted }) {
  const [offeredPrice, setOfferedPrice] = useState(listing?.sellingPrice ? Math.round(listing.sellingPrice * 0.96) : 2500);
  const [quantity, setQuantity] = useState(listing?.quantity || 20);
  const [transportResponsibility, setTransportResponsibility] = useState('SHARED_50_50');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('agrisethu_token');
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: listing.id,
          offeredPrice: Number(offeredPrice),
          quantity: Number(quantity),
          transportResponsibility,
          note
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit offer');

      alert('Offer submitted successfully! The farmer has been notified.');
      onOfferSubmitted && onOfferSubmitted(data.offer);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const diff = offeredPrice - listing.sellingPrice;
  const percentDiff = Math.round((diff / (listing.sellingPrice || 1)) * 1000) / 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-white text-stone-900 w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Handshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Make Price Offer / Counter</h3>
              <p className="text-2xs text-stone-500">Negotiate directly with {listing.farmerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Listing Baseline */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs flex justify-between items-center">
            <div>
              <span className="font-bold text-stone-800">{listing.cropName} (Grade {listing.qualityGrade})</span>
              <p className="text-2xs text-stone-500">Available: {listing.quantity} quintals</p>
            </div>
            <div className="text-right">
              <span className="text-2xs text-stone-400">Listed Price:</span>
              <p className="font-extrabold text-sm text-stone-900">₹{listing.sellingPrice}/qtl</p>
            </div>
          </div>

          {/* Offer Price Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-stone-700">Your Proposed Price (₹/quintal)</label>
              <span className={`text-2xs font-bold ${diff >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {diff >= 0 ? `+₹${diff} (${percentDiff}%)` : `-₹${Math.abs(diff)} (${percentDiff}%)`}
              </span>
            </div>
            <input
              type="number"
              value={offeredPrice}
              onChange={(e) => setOfferedPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-extrabold text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Quantity Required (Quintals)</label>
            <input
              type="number"
              min="1"
              max={listing.quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              required
            />
          </div>

          {/* Transport Proposal */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Proposed Transport Split</label>
            <select
              value={transportResponsibility}
              onChange={(e) => setTransportResponsibility(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
            >
              <option value="BUYER_PAYS">Buyer Pays Transport (100% - More attractive to farmer)</option>
              <option value="SHARED_50_50">50 / 50 Shared Transport</option>
              <option value="FARMER_PAYS">Farmer Pays Transport (100%)</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Message / Note to Farmer</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Ready for immediate cash settlement and truck pickup tomorrow morning..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Send Offer to Farmer'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
