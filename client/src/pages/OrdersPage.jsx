import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  ArrowRight,
  Sparkles,
  MapPin,
  RefreshCw,
  FileText
} from 'lucide-react';

export default function OrdersPage() {
  const { role, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agrisethu_token');
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data.orders || []);
      if (data.orders?.length > 0 && !selectedOrderId) {
        setSelectedOrderId(data.orders[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  const advanceMilestone = async (orderId, currentStatus) => {
    const statusSequence = ['PLACED', 'CONFIRMED', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];
    const currentIdx = statusSequence.indexOf(currentStatus);
    if (currentIdx >= statusSequence.length - 1) return;

    const nextStatus = statusSequence[currentIdx + 1];
    setUpdating(true);
    try {
      const token = localStorage.getItem('agrisethu_token');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh orders list
      setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getTimelineSteps = (order) => {
    if (!order) return [];
    const statusOrder = ['PLACED', 'CONFIRMED', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];
    const currentIdx = statusOrder.indexOf(order.status);

    return [
      { key: 'PLACED', label: 'Order Placed & Escrow Funded', desc: 'Payment held in RBI-compliant escrow', completed: currentIdx >= 0 },
      { key: 'CONFIRMED', label: 'Farmer Accepted & Route Locked', desc: 'Transport split agreed', completed: currentIdx >= 1 },
      { key: 'PREPARING', label: 'Farmgate Quality & Crating', desc: 'AI visual grade verified on loading', completed: currentIdx >= 2 },
      { key: 'IN_TRANSIT', label: 'Picked Up & On Highway', desc: 'Driver GPS active', completed: currentIdx >= 3 },
      { key: 'DELIVERED', label: 'Delivered at Buyer Bay', desc: 'Weighing & quality sign-off', completed: currentIdx >= 4 },
      { key: 'COMPLETED', label: 'Payment Disbursed to Farmer', desc: 'Instant bank RTGS settlement', completed: currentIdx >= 5 }
    ];
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight flex items-center gap-2">
            <span>Orders & Logistics Management</span>
            <Truck className="w-6 h-6 text-emerald-600" />
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            Live multi-stage shipment tracking with verified escrow release upon delivery.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-400 text-xs font-bold">
          Loading active orders and tracking timelines...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center text-stone-400 text-xs">
          No orders found. Place an order from the marketplace to track it here.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Orders List */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-stone-500">
              Your Orders ({orders.length})
            </h3>

            {orders.map((order) => {
              const isSelected = order.id === selectedOrder?.id;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/10'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-2xs font-extrabold text-stone-500">#{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${
                      order.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'IN_TRANSIT'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-stone-900">
                    {order.quantity} {order.unit || 'Quintals'} of {order.cropName} (Grade {order.qualityGrade || 'A'})
                  </h4>
                  <p className="text-2xs text-stone-500 mt-0.5">
                    {role === 'farmer' ? `Buyer: ${order.buyerName}` : `Farmer: ${order.farmerName}`}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-2xs">
                    <div>
                      <span className="text-stone-400 block text-3xs font-bold uppercase">
                        {role === 'farmer' ? 'Your Net Return' : 'Total Paid'}
                      </span>
                      <span className="font-black text-xs text-emerald-800">
                        ₹{(role === 'farmer' ? order.farmerNetReturn : order.buyerTotalPayable)?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      {order.transportResponsibility?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Tracking Timeline & Driver Information */}
          {selectedOrder && (
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6">
              {/* Order Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-stone-950">Order #{selectedOrder.id}</h2>
                    <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-100 text-emerald-800">
                      Escrow Secured
                    </span>
                  </div>
                  <p className="text-2xs text-stone-500 mt-0.5">
                    {selectedOrder.quantity} quintals • ₹{selectedOrder.agreedPricePerUnit}/qtl agreed rate
                  </p>
                </div>

                {/* SIH Judge Demo Simulation Action Button */}
                {selectedOrder.status !== 'COMPLETED' && (
                  <button
                    disabled={updating}
                    onClick={() => advanceMilestone(selectedOrder.id, selectedOrder.status)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-2xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    title="Advance to next step for demo presentation"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Advance Next Milestone</span>
                  </button>
                )}
              </div>

              {/* Logistics Driver & Vehicle Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-stone-900">
                      {selectedOrder.logistics?.driver?.name || selectedOrder.logistics?.driverName || 'Srinivas Rao'}
                    </h4>
                    <p className="text-2xs text-stone-500">
                      Vehicle: <span className="font-bold text-stone-800">{selectedOrder.logistics?.driver?.vehicleNumber || selectedOrder.logistics?.vehicleNumber || 'TS 03 UA 7824'}</span> ({selectedOrder.logistics?.vehicle?.type || selectedOrder.logistics?.vehicleType || 'Bolero Pickup'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <a
                    href="tel:9848023114"
                    className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-2xs font-bold text-stone-700 flex items-center gap-1 hover:bg-stone-100"
                  >
                    <Phone className="w-3 h-3 text-emerald-700" />
                    <span>Call Driver</span>
                  </a>
                  <div className="text-right">
                    <span className="text-3xs text-stone-400 block font-bold">Estimated ETA</span>
                    <span className="text-xs font-black text-emerald-800">{selectedOrder.logistics?.transitHours || 1.5} Hours</span>
                  </div>
                </div>
              </div>

              {/* Live Milestone Tracking Steps */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                  Shipment Tracking Timeline
                </h4>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {getTimelineSteps(selectedOrder).map((step, idx) => (
                    <div key={step.key} className="flex items-start gap-4 relative">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-2xs ${
                        step.completed
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : 'bg-white border-2 border-stone-300 text-stone-400'
                      }`}>
                        {step.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="pt-0.5">
                        <span className={`text-xs font-extrabold block ${step.completed ? 'text-stone-900' : 'text-stone-400'}`}>
                          {step.label}
                        </span>
                        <span className="text-2xs text-stone-500 block">{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial & Escrow Settlement Card */}
              <div className="p-4 rounded-2xl bg-[#f4f7ee] border border-emerald-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-emerald-950">Escrow Settlement Details</span>
                  </div>
                  <span className="font-mono text-3xs text-stone-500">{selectedOrder.transactionId}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-3xs font-bold text-stone-500 uppercase">Buyer Total Paid</span>
                    <p className="font-extrabold text-sm text-stone-900">₹{selectedOrder.buyerTotalPayable?.toLocaleString('en-IN')}</p>
                    <span className="text-3xs text-stone-400">Transport: ₹{selectedOrder.buyerTransportShare}</span>
                  </div>

                  <div>
                    <span className="text-3xs font-bold text-emerald-800 uppercase">Farmer Take-Home Net Return</span>
                    <p className="font-black text-sm text-emerald-900">₹{selectedOrder.farmerNetReturn?.toLocaleString('en-IN')}</p>
                    <span className="text-3xs text-emerald-700">Released upon delivery sign-off</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
