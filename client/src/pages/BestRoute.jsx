import React, { useState, useEffect } from 'react';
import { Route, TrendingUp, Truck, ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BestRoute() {
  const [crop, setCrop] = useState('Tomato');
  const [quantity, setQuantity] = useState(50);
  const [qualityGrade, setQualityGrade] = useState('A');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, [crop, quantity, qualityGrade]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/compare?crop=${crop}&quantity=${quantity}&qualityGrade=${qualityGrade}`);
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
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
              Best Selling Route & Channel Optimizer
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              Ranked strictly by <span className="font-extrabold text-emerald-800">MAXIMUM NET RETURN</span> after transport, storage, and intermediary cess.
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: Crop, Quantity, Grade */}
      <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-stone-500 mb-1">Select Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-white"
            >
              <option value="Tomato">Tomato (టమోటా)</option>
              <option value="Chilli">Chilli (మిర్చి)</option>
              <option value="Cotton">Cotton (పత్తి)</option>
              <option value="Rice">Rice (వరి)</option>
              <option value="Onion">Onion (ఉల్లిపాయ)</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-stone-500 mb-1">Batch Quantity (Quintals)</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-28 px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-emerald-800"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-stone-500 mb-1">Quality Grade</label>
            <div className="flex gap-1">
              {['A', 'B', 'C'].map((g) => (
                <button
                  key={g}
                  onClick={() => setQualityGrade(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    qualityGrade === g
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Grade {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Highlight Core Principle Quote */}
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-2xs text-amber-900 font-semibold max-w-sm">
          💡 <span className="font-extrabold">AgriSethu Rule:</span> Higher selling price does NOT always mean higher profit! Long transit distances and mandi cess often consume the difference.
        </div>
      </div>

      {/* Insight Explainer Banner */}
      {data?.insight && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 leading-relaxed font-medium">
            <span className="font-extrabold block text-emerald-900 mb-0.5">Route Engine Intelligence:</span>
            {data.insight}
          </div>
        </div>
      )}

      {/* Route Comparison Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-stone-400 text-xs font-bold">
          Evaluating channel logistics and calculating net returns...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {data?.routes?.map((r, index) => {
              const isWinner = r.isBest;

              return (
                <div
                  key={r.id}
                  className={`p-5 rounded-3xl border-2 transition-all relative overflow-hidden ${
                    isWinner
                      ? 'bg-white border-emerald-500 shadow-lg ring-4 ring-emerald-500/10'
                      : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                  }`}
                >
                  {isWinner && (
                    <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-600 text-white text-3xs font-black uppercase tracking-widest rounded-bl-2xl flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>🏆 RECOMMENDED BEST NET RETURN</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Channel Profile */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          #{index + 1} • {r.channelType}
                        </span>
                        <span className="text-3xs text-stone-400 font-bold">{r.distanceKm} km transit</span>
                      </div>
                      <h3 className="font-black text-base text-stone-900">{r.name}</h3>
                      <p className="text-2xs text-stone-500 mt-0.5">
                        Payment: <span className="font-semibold text-stone-700">{r.paymentSpeed}</span> • Time: <span className="font-semibold text-stone-700">{r.timeToSell}</span>
                      </p>
                    </div>

                    {/* Selling Price vs Deductions */}
                    <div className="lg:col-span-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                        <span className="text-3xs font-extrabold uppercase text-stone-400 block">Gross Selling Price</span>
                        <span className="text-sm font-black text-stone-900">₹{r.sellingPrice?.toLocaleString('en-IN')}</span>
                        <span className="text-3xs text-stone-500 block mt-0.5">₹{r.grossRevenue?.toLocaleString('en-IN')} total</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200">
                        <span className="text-3xs font-extrabold uppercase text-rose-500 block">Total Deductions</span>
                        <span className="text-sm font-black text-rose-700">-₹{r.deductions?.total?.toLocaleString('en-IN')}</span>
                        <span className="text-3xs text-rose-600 block mt-0.5">
                          Transport: ₹{r.deductions?.transport} • Fee: ₹{r.deductions?.feesAndTaxes}
                        </span>
                      </div>
                    </div>

                    {/* Final Net Take-Home Return */}
                    <div className="lg:col-span-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                      <div>
                        <span className="text-3xs font-black uppercase tracking-wider text-emerald-800 block">
                          ACTUAL TAKE-HOME NET RETURN
                        </span>
                        <span className="text-xl font-black text-emerald-900">
                          ₹{r.netReturn?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-2xs font-extrabold text-emerald-700 block">
                          ₹{r.netReturnPerQtl?.toLocaleString('en-IN')} / quintal
                        </span>
                      </div>

                      {isWinner ? (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-extrabold text-2xs flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Optimal Option</span>
                        </div>
                      ) : (
                        <span className="text-2xs font-bold text-stone-500">
                          -₹{(data?.routes[0]?.netReturn - r.netReturn)?.toLocaleString('en-IN')} less profit
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
