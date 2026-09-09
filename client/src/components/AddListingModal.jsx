import React, { useState } from 'react';
import { Sparkles, Camera, Upload, CheckCircle2, X, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AddListingModal({ isOpen, onClose, onListingCreated }) {
  const [cropName, setCropName] = useState('Tomato');
  const [variety, setVariety] = useState('Hybrid (Sivam)');
  const [quantity, setQuantity] = useState(50);
  const [unit, setUnit] = useState('Quintal');
  const [harvestDate, setHarvestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expectedSellingDate, setExpectedSellingDate] = useState(() => new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [minimumAcceptablePrice, setMinimumAcceptablePrice] = useState(2300);
  const [sellingPrice, setSellingPrice] = useState(2600);
  const [location, setLocation] = useState('Kothur, Warangal');
  const [preferredSellingRadiusKm, setPreferredSellingRadiusKm] = useState(60);
  const [hasStorage, setHasStorage] = useState(true);
  const [storageCapacityQuintals, setStorageCapacityQuintals] = useState(60);
  const [selectedImage, setSelectedImage] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80');

  // AI Quality Grading State
  const [gradingLoading, setGradingLoading] = useState(false);
  const [qualityResult, setQualityResult] = useState(null);
  const [defectPercent, setDefectPercent] = useState(2.2);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const sampleImages = {
    Tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    Chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
    Cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80',
    Rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    Onion: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80'
  };

  const handleCropChange = (crop) => {
    setCropName(crop);
    setSelectedImage(sampleImages[crop] || sampleImages.Tomato);
    if (crop === 'Chilli') {
      setSellingPrice(19000);
      setMinimumAcceptablePrice(17500);
      setVariety('Teja Superior');
    } else if (crop === 'Cotton') {
      setSellingPrice(7200);
      setMinimumAcceptablePrice(6900);
      setVariety('Bt Cotton Long Staple');
    } else if (crop === 'Rice') {
      setSellingPrice(3400);
      setMinimumAcceptablePrice(3100);
      setVariety('Sona Masoori');
    } else {
      setSellingPrice(2600);
      setMinimumAcceptablePrice(2300);
      setVariety('Hybrid (Sivam)');
    }
    setQualityResult(null);
  };

  const runAIGrading = async () => {
    setGradingLoading(true);
    try {
      const res = await fetch('/api/prediction/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName,
          imageUri: selectedImage,
          manualDefectPercent: defectPercent
        })
      });
      const data = await res.json();
      setQualityResult(data.aiAssessment);
    } catch (err) {
      console.error(err);
    } finally {
      setGradingLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('agrisethu_token');
      const res = await fetch('/api/farmer/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropName,
          variety,
          quantity: Number(quantity),
          unit,
          harvestDate,
          expectedSellingDate,
          minimumAcceptablePrice: Number(minimumAcceptablePrice),
          sellingPrice: Number(sellingPrice),
          preferredSellingRadiusKm: Number(preferredSellingRadiusKm),
          hasStorage: Boolean(hasStorage),
          storageCapacityQuintals: Number(storageCapacityQuintals),
          imageUrl: selectedImage,
          manualDefectPercent: defectPercent
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to list produce');

      alert(`Produce Listed Successfully! Quality Grade: ${data.listing.qualityGrade}. Top Buyer: ${data.topBuyer?.buyerName || 'Local Processing Unit'}`);
      onListingCreated && onListingCreated(data.listing);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">List Your Produce with AI Quality Grading</h3>
              <p className="text-xs text-stone-500">Instant market discovery, buyer matching & net return optimization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Crop & Variety Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Crop Name</label>
              <select
                value={cropName}
                onChange={(e) => handleCropChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold text-stone-800 bg-white"
              >
                <option value="Tomato">Tomato (టమోటా)</option>
                <option value="Chilli">Chilli (మిర్చి)</option>
                <option value="Cotton">Cotton (పత్తి)</option>
                <option value="Rice">Rice (వరి / బియ్యం)</option>
                <option value="Onion">Onion (ఉల్లిపాయ)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Variety / Hybrid</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Quantity (Quintals)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold text-emerald-800"
                required
              />
            </div>
          </div>

          {/* Pricing & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Desired Price (₹/qtl)</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-extrabold text-emerald-700"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Min Acceptable Price (₹/qtl)</label>
              <input
                type="number"
                value={minimumAcceptablePrice}
                onChange={(e) => setMinimumAcceptablePrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium text-stone-600"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Harvest Date</label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
              />
            </div>
          </div>

          {/* Storage & Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="storageCheck"
                checked={hasStorage}
                onChange={(e) => setHasStorage(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
              />
              <label htmlFor="storageCheck" className="font-bold text-stone-700 cursor-pointer">
                On-Farm Storage Available
              </label>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-0.5">Preferred Selling Radius: {preferredSellingRadiusKm} km</label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={preferredSellingRadiusKm}
                onChange={(e) => setPreferredSellingRadiusKm(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* AI Crop Quality Assessment Module */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border-2 border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span className="font-extrabold text-stone-900">AI Quality Assessment (Vision RESNET-50)</span>
              </div>
              <button
                type="button"
                onClick={runAIGrading}
                disabled={gradingLoading}
                className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-2xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>{gradingLoading ? 'Analyzing...' : (qualityResult ? 'Re-Analyze AI' : 'Run AI Quality Scan')}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <img
                src={selectedImage}
                alt={cropName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-300 shadow-sm shrink-0"
              />

              <div className="flex-1 space-y-2 w-full">
                {qualityResult ? (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 text-xs">{qualityResult.gradeLabel}</span>
                      <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Confidence: {qualityResult.confidence}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-3xs text-stone-600">
                      <div>Freshness: <span className="font-bold text-stone-800">{qualityResult.parameters.visualFreshness}</span></div>
                      <div>Blemish / Defect: <span className="font-bold text-stone-800">{qualityResult.parameters.visibleDefects}</span></div>
                      <div>Firmness Score: <span className="font-bold text-stone-800">{qualityResult.parameters.firmnessIndex}</span></div>
                      <div>Price Impact: <span className="font-bold text-emerald-700">{qualityResult.priceImpact}</span></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-2xs text-stone-500 leading-relaxed">
                    Click <span className="font-bold text-emerald-700">"Run AI Quality Scan"</span> to evaluate crop color, size uniformity, and blemish percentage. Certifies quality grade before buyers bid.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-100">
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Certify Quality & List Produce'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
