import React, { useState, useEffect } from 'react';
import { Hourglass, Sparkles, TrendingUp, CloudRain, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SellWaitEngine() {
  const [crop, setCrop] = useState('Tomato');
  const [horizonDays, setHorizonDays] = useState(3);
  const [quantity, setQuantity] = useState(50);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runEngine();
  }, [crop, horizonDays, quantity]);

  const runEngine = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prediction/sell-wait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: crop,
          horizonDays: Number(horizonDays),
          quantity: Number(quantity)
        })
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
          <Hourglass className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
            Sell Now or Wait? — AI Decision Engine
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            Multi-signal intelligence comparing <span className="font-bold text-stone-800">Net Return Now</span> vs <span className="font-bold text-stone-800">Expected Net Return After Wait</span>.
          </p>
        </div>
      </div>

      {/* Control Parameters Bar */}
      <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-2xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Select Crop</label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-white"
          >
            <option value="Tomato">Tomato (టమోటా / टमाटर) - High Perishability</option>
            <option value="Chilli">Chilli (మిర్చి / मिर्च) - Medium Perishability</option>
            <option value="Cotton">Cotton (పత్తి / कपास) - Low Perishability</option>
            <option value="Rice">Rice (వరి / धान) - Very Low Perishability</option>
            <option value="Onion">Onion (ఉల్లి / प्याज) - Medium Perishability</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between text-2xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
            <span>Wait Horizon</span>
            <span className="text-emerald-700 font-extrabold">{horizonDays} Days</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={horizonDays}
            onChange={(e) => setHorizonDays(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-3xs text-stone-400 mt-1">
            <span>1 Day</span>
            <span>5 Days</span>
            <span>10 Days</span>
          </div>
        </div>

        <div>
          <label className="block text-2xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Quantity (Quintals)</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-emerald-800"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-400 text-xs font-bold">
          Running momentum models and evaluating storage loss...
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Recommendation Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-800">
                RECOMMENDED DECISION
              </span>
              <span className="px-3 py-1 rounded-full text-2xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                Confidence: {data.confidence}% ({data.confidenceLevel})
              </span>
            </div>

            {/* Big Recommendation Banner */}
            <div className={`p-6 rounded-3xl border-2 text-center space-y-2 ${
              data.recommendation === 'WAIT'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : data.recommendation === 'PARTIAL_SELL_WAIT'
                ? 'bg-amber-50 border-amber-400 text-amber-950'
                : 'bg-rose-50 border-rose-400 text-rose-950'
            }`}>
              <span className="text-4xl block">
                {data.recommendation === 'WAIT' ? '🟢' : data.recommendation === 'PARTIAL_SELL_WAIT' ? '🟡' : '🔴'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {data.recommendationLabel}
              </h2>
              <p className="text-xs font-medium max-w-sm mx-auto">
                {data.recommendation === 'WAIT'
                  ? `Expected net gain from waiting exceeds storage cost and perishability decay.`
                  : data.recommendation === 'PARTIAL_SELL_WAIT'
                  ? `Hedge risk: Sell 50% now to secure working capital, hold remainder for potential price bump.`
                  : `Sell today. Holding incurs storage expenses without reliable price upside.`}
              </p>
            </div>

            {/* Financial Comparison: Net Return Now vs After Wait */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-3xs font-extrabold uppercase text-stone-500 block">Sell Today (Net Return)</span>
                <span className="text-xl font-black text-stone-900">₹{data.currentNetReturn?.toLocaleString('en-IN')}</span>
                <span className="text-3xs text-stone-400 block mt-0.5">Spot Price: ₹{data.currentPrice}/qtl</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-3xs font-extrabold uppercase text-emerald-800 block">After {data.horizonDays} Days (Net Return)</span>
                <span className="text-xl font-black text-emerald-900">₹{data.expectedFutureNetReturn?.toLocaleString('en-IN')}</span>
                <span className="text-3xs text-emerald-700 font-bold block mt-0.5">
                  {data.expectedNetGain >= 0 ? `+₹${data.expectedNetGain}/qtl Net Advantage` : `-₹${Math.abs(data.expectedNetGain)}/qtl Disadvantage`}
                </span>
              </div>
            </div>

            {/* Storage & Loss Cost Deductions */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Projected Price after {data.horizonDays} Days:</span>
                <span className="font-bold text-stone-900">₹{data.predictedPrice}/qtl (Range: ₹{data.expectedRange?.min} - ₹{data.expectedRange?.max})</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Storage Cost ({data.horizonDays} days):</span>
                <span className="text-rose-600 font-semibold">-₹{data.storageCost}/qtl</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Expected Spoilage Loss ({data.perishability} perishability):</span>
                <span className="text-rose-600 font-semibold">-₹{data.expectedLoss}/qtl</span>
              </div>
              <div className="border-t border-stone-200 pt-1.5 flex justify-between font-bold text-stone-800">
                <span>Total Added Holding Cost:</span>
                <span>₹{data.totalAddedCosts}/qtl</span>
              </div>
            </div>
          </div>

          {/* Explainability & Weather Signal Card */}
          <div className="lg:col-span-6 space-y-6">
            {/* Why This Recommendation? */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Why are we recommending this?</span>
              </h3>
              <p className="text-2xs text-stone-500">
                AgriSethu does not use opaque "black box" claims. Every decision is grounded in verifiable economic signals:
              </p>

              <div className="space-y-2.5">
                {data.reasons?.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#f8faf5] border border-emerald-100 text-xs text-stone-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather & Supply Disruption Signal */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-sm text-stone-900">Agrometeorological Risk Multiplier</h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Weather forecasts directly adjust price volatility. Rainfall warnings elevate terminal market demand due to supply transport interruptions, while simultaneously increasing on-farm storage humidity risks.
              </p>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between font-medium">
                <span>Current Regional Rainfall Probability:</span>
                <span className="font-extrabold text-blue-950">35% (Moderate)</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
