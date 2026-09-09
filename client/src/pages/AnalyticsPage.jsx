import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp, DollarSign, PieChart, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function AnalyticsPage() {
  const { role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [role]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agrisethu_token');
      const endpoint = role === 'buyer' ? '/api/analytics/buyer' : '/api/analytics/farmer';
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-stone-400 text-xs font-bold">
        Aggregating financial analytics and cost distributions...
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const monthlyData = data?.monthlyData || [];
  const expenseBreakdown = data?.expenseBreakdown || [];
  const channelPerformance = data?.channelPerformance || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight flex items-center gap-2">
          <span>{role === 'buyer' ? 'Procurement & Sourcing Analytics' : 'Farmer Net Earnings & Expense Analytics'}</span>
          <BarChart3 className="w-6 h-6 text-emerald-600" />
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-medium">
          Quantifying the actual take-home earnings by eliminating hidden costs, freight leaks, and intermediary cuts.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <span className="text-2xs font-extrabold uppercase tracking-wider text-stone-500 block">Total Gross Revenue</span>
          <div className="text-2xl font-black text-stone-900 mt-1">
            ₹{metrics.totalGrossRevenue?.toLocaleString('en-IN') || metrics.totalSpend?.toLocaleString('en-IN')}
          </div>
          <span className="text-2xs font-bold text-stone-400 mt-0.5 block">Past 6 Months Sales</span>
        </div>

        <div className="p-5 rounded-3xl bg-emerald-800 text-white shadow-lg shadow-emerald-800/20">
          <span className="text-2xs font-extrabold uppercase tracking-wider text-emerald-200 block">Total Net Take-Home</span>
          <div className="text-2xl font-black mt-1">
            ₹{metrics.totalNetEarnings?.toLocaleString('en-IN') || Math.round(metrics.totalSpend * 0.915).toLocaleString('en-IN')}
          </div>
          <span className="text-2xs font-semibold text-emerald-200 mt-0.5 block">
            {metrics.retainedMarginPercent || 91}% Value Retained by Farmer
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <span className="text-2xs font-extrabold uppercase tracking-wider text-stone-500 block">Middlemen Losses Avoided</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            +₹{Math.round((metrics.totalGrossRevenue || metrics.totalSpend || 140000) * 0.14).toLocaleString('en-IN')}
          </div>
          <span className="text-2xs font-semibold text-stone-500 mt-0.5 block">Saved via Direct Trade</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <span className="text-2xs font-extrabold uppercase tracking-wider text-stone-500 block">Average Net Return</span>
          <div className="text-2xl font-black text-stone-900 mt-1">
            ₹{metrics.averageNetReturnPerQtl || metrics.averageCostPerQuintal || 2480} / qtl
          </div>
          <span className="text-2xs font-semibold text-stone-500 mt-0.5 block">Across all crops</span>
        </div>
      </div>

      {/* Monthly Revenue vs Net Earnings Chart */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-stone-900">Monthly Gross Revenue vs Real Net Return</h3>
            <p className="text-2xs text-stone-500">Visualizing how cost optimizations preserve farmer take-home profit</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-stone-300"></span>
              <span className="text-stone-600">Gross Value</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-700"></span>
              <span className="text-emerald-900">Net Return</span>
            </div>
          </div>
        </div>

        {/* Custom Responsive Bar Chart */}
        <div className="pt-4 grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 border-b border-stone-200">
          {monthlyData.map((m) => {
            const maxVal = 60000;
            const grossHeight = Math.max(15, Math.round((m.gross / maxVal) * 100));
            const netHeight = Math.max(12, Math.round((m.net / maxVal) * 100));

            return (
              <div key={m.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="flex items-end gap-1 sm:gap-2 w-full justify-center h-full">
                  {/* Gross Bar */}
                  <div
                    style={{ height: `${grossHeight}%` }}
                    className="w-3 sm:w-6 bg-stone-200 rounded-t-lg transition-all group-hover:bg-stone-300"
                    title={`Gross: ₹${m.gross?.toLocaleString('en-IN')}`}
                  ></div>
                  {/* Net Bar */}
                  <div
                    style={{ height: `${netHeight}%` }}
                    className="w-3 sm:w-6 bg-emerald-700 rounded-t-lg transition-all group-hover:bg-emerald-600"
                    title={`Net: ₹${m.net?.toLocaleString('en-IN')}`}
                  ></div>
                </div>
                <span className="text-2xs font-extrabold text-stone-600">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Deductions Breakdown & Channel Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Deductions Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-stone-900">Value Breakdown & Expense Leakage</h3>
          <p className="text-2xs text-stone-500">Distribution of gross crop sales across operational line items</p>

          <div className="space-y-3 pt-2">
            {expenseBreakdown.map((item) => (
              <div key={item.category} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-stone-700">{item.category}</span>
                  <span className="text-stone-900">₹{item.amount?.toLocaleString('en-IN')} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                    className={`h-full rounded-full ${
                      item.category.includes('Net') ? 'bg-emerald-600' : 'bg-stone-400'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Channel Performance */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-stone-900">Selling Channel Profitability</h3>
          <p className="text-2xs text-stone-500">Historical net profit realized per quintal across market channels</p>

          <div className="space-y-2.5 pt-2">
            {channelPerformance.map((ch) => (
              <div
                key={ch.channel}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-extrabold text-stone-900">{ch.channel}</h4>
                  <span className="text-3xs text-stone-500 block mt-0.5">{ch.rating} • {ch.volume} qtl sold</span>
                </div>
                <div className="text-right">
                  <span className="text-3xs font-bold text-stone-400 block uppercase">Avg Net Return</span>
                  <span className="font-black text-sm text-emerald-800">₹{ch.avgNetPerQtl}/qtl</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
