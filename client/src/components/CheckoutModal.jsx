import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, CheckCircle2, ArrowRight, X, AlertCircle } from 'lucide-react';

export default function CheckoutModal({ listing, isOpen, onClose, onOrderConfirmed }) {
  const [quantity, setQuantity] = useState(listing?.quantity || 10);
  const [responsibility, setResponsibility] = useState('BUYER_PAYS');
  const [customBuyerAmount, setCustomBuyerAmount] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState('Hyderabad Agro Processing Terminal, Telangana');
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (listing) {
      setQuantity(listing.quantity || 10);
      recalculate(listing.quantity || 10, responsibility, 0);
    }
  }, [listing]);

  const recalculate = async (qty, mode, customAmt) => {
    if (!listing) return;
    setLoading(true);
    try {
      const res = await fetch('/api/calculator/transport-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellingPrice: listing.sellingPrice,
          quantity: qty,
          distanceKm: listing.distanceKm || 38,
          responsibility: mode,
          customBuyerAmount: customAmt
        })
      });
      const data = await res.json();
      setCalculation(data);
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode) => {
    setResponsibility(mode);
    recalculate(quantity, mode, customBuyerAmount);
  };

  const handleQuantityChange = (newQty) => {
    const q = Math.max(1, Math.min(listing.quantity, Number(newQty) || 1));
    setQuantity(q);
    recalculate(q, responsibility, customBuyerAmount);
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('agrisethu_token');
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: listing.id,
          quantity,
          agreedPricePerUnit: listing.sellingPrice,
          transportResponsibility: responsibility,
          customBuyerAmount: responsibility === 'CUSTOM_SPLIT' ? customBuyerAmount : null,
          deliveryAddress
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      onOrderConfirmed(data.order);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Direct Purchase & Transport Terms</h3>
              <p className="text-xs text-stone-500">Transparent cost sharing between Buyer and Farmer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Produce Summary Card */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={listing.imageUrl}
                alt={listing.cropName}
                className="w-14 h-14 rounded-xl object-cover border border-stone-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base text-stone-900">{listing.cropName}</h4>
                  <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Grade {listing.qualityGrade}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">Farmer: <span className="font-bold text-stone-800">{listing.farmerName}</span> ({listing.farmerLocation})</p>
                <p className="text-xs font-semibold text-emerald-700">₹{listing.sellingPrice?.toLocaleString('en-IN')} / quintal</p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-2xs self-start sm:self-auto">
              <span className="text-xs font-semibold text-stone-500">Qty:</span>
              <input
                type="number"
                min="1"
                max={listing.quantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-16 text-center font-bold text-sm bg-transparent outline-hidden border-b border-emerald-600"
              />
              <span className="text-xs font-bold text-stone-700">qtl (max {listing.quantity})</span>
            </div>
          </div>

          {/* Transport Cost-Sharing Options (Central Feature) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Transport Responsibility Option</span>
              </h4>
              <span className="text-2xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Estimated Transit Cost: ₹{calculation?.transportTotal?.toLocaleString('en-IN') || '---'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  key: 'BUYER_PAYS',
                  title: 'Buyer Pays (100%)',
                  badge: 'Farmer Favorite',
                  desc: 'Buyer pays ₹' + (calculation?.transportTotal || 0) + '. Farmer pays ₹0 transport.'
                },
                {
                  key: 'SHARED_50_50',
                  title: '50 / 50 Shared',
                  badge: 'Fair Split',
                  desc: 'Buyer & Farmer split transport equally (₹' + Math.round((calculation?.transportTotal || 0) / 2) + ' each).'
                },
                {
                  key: 'FARMER_PAYS',
                  title: 'Farmer Pays (100%)',
                  badge: 'Buyer Discount',
                  desc: 'Farmer absorbs full transport cost from their sale revenue.'
                }
              ].map((opt) => (
                <div
                  key={opt.key}
                  onClick={() => handleModeChange(opt.key)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    responsibility === opt.key
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-stone-900">{opt.title}</span>
                    <span className="text-3xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-2xs text-stone-500 leading-tight">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Dual Impact Comparison (Visually Demonstrates Net Return difference) */}
          {calculation && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Buyer Payable Box */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <p className="text-2xs font-extrabold uppercase tracking-wider text-blue-800 mb-1">Buyer Payment Breakdown</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Produce ({quantity} qtl × ₹{listing.sellingPrice})</span>
                    <span>₹{calculation.buyerSummary.produceCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Buyer Transport Share</span>
                    <span className="font-semibold text-blue-700">+₹{calculation.buyerSummary.transportShare.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Escrow & Handling Fee</span>
                    <span>+₹{calculation.buyerSummary.handlingFee}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 flex justify-between font-extrabold text-sm text-blue-950">
                    <span>BUYER TOTAL PAYABLE:</span>
                    <span className="text-base">₹{calculation.buyerSummary.totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Farmer Take-Home Net Return Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <p className="text-2xs font-extrabold uppercase tracking-wider text-emerald-800 mb-1">Farmer Net Return Breakdown</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Gross Selling Value</span>
                    <span>₹{calculation.farmerSummary.grossSellingPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Farmer Transport Share</span>
                    <span className="font-semibold text-rose-600">-₹{calculation.farmerSummary.transportDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Platform Tech Fee (1%)</span>
                    <span className="text-stone-500">-₹{calculation.farmerSummary.platformFee}</span>
                  </div>
                  <div className="border-t border-emerald-200 pt-2 flex justify-between font-extrabold text-sm text-emerald-950">
                    <span>FARMER NET RETURN:</span>
                    <span className="text-base text-emerald-800">₹{calculation.farmerSummary.netReturn.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Destination Input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Delivery Destination / Warehouse</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
              placeholder="Enter warehouse or delivery location address"
            />
          </div>

          {/* Escrow Guarantee Alert */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-2xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">AgriSethu Escrow Protection:</span> Your payment is securely deposited into escrow. Funds are released to the farmer only upon delivery verification and weight sign-off.
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={submitting || loading}
            onClick={handleConfirmOrder}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Confirming...' : 'Proceed to Escrow Checkout'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
