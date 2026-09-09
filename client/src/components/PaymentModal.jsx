import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { QrCode, CreditCard, Building2, ShieldCheck, CheckCircle, X, ArrowRight } from 'lucide-react';

export default function PaymentModal({ order, isOpen, onClose, onPaymentSuccess }) {
  const [method, setMethod] = useState('UPI_QR');
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [receipt, setReceipt] = useState(null);

  if (!isOpen || !order) return null;

  const handlePay = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('agrisethu_token');
      const res = await fetch(`/api/orders/${order.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethod: method })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      setReceipt(data.receipt);
      setPaid(true);

      // Trigger victory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }

      setTimeout(() => {
        onPaymentSuccess(data.order);
      }, 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-xs p-4">
      <div className="bg-white text-stone-900 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">AgriSethu Escrow Payment</h3>
              <span className="px-2 py-0.5 rounded text-2xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                SANDBOX DEMO
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">Order #{order.id} • Payable: ₹{order.buyerTotalPayable?.toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!paid ? (
            <div className="space-y-5">
              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'UPI_QR', label: 'UPI QR Code', icon: QrCode },
                  { key: 'NET_BANKING', label: 'Net Banking', icon: Building2 },
                  { key: 'CARD', label: 'Cards', icon: CreditCard }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = method === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setMethod(tab.key)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* UPI Tab View */}
              {method === 'UPI_QR' && (
                <div className="text-center p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center">
                  <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-xs mb-2">
                    {/* Simulated Clean SVG QR Code */}
                    <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white" />
                      {/* Outer frames */}
                      <rect x="10" y="10" width="30" height="30" rx="4" fill="#047857" />
                      <rect x="16" y="16" width="18" height="18" fill="white" />
                      <rect x="20" y="20" width="10" height="10" fill="#047857" />
                      
                      <rect x="60" y="10" width="30" height="30" rx="4" fill="#047857" />
                      <rect x="66" y="16" width="18" height="18" fill="white" />
                      <rect x="70" y="20" width="10" height="10" fill="#047857" />

                      <rect x="10" y="60" width="30" height="30" rx="4" fill="#047857" />
                      <rect x="16" y="66" width="18" height="18" fill="white" />
                      <rect x="20" y="70" width="10" height="10" fill="#047857" />

                      {/* Random data matrix squares */}
                      <rect x="46" y="12" width="8" height="8" fill="#1f2937" />
                      <rect x="46" y="26" width="8" height="8" fill="#1f2937" />
                      <rect x="12" y="46" width="8" height="8" fill="#1f2937" />
                      <rect x="26" y="46" width="8" height="8" fill="#1f2937" />
                      <rect x="46" y="46" width="12" height="12" fill="#047857" />
                      <rect x="62" y="46" width="8" height="8" fill="#1f2937" />
                      <rect x="76" y="46" width="8" height="8" fill="#1f2937" />
                      <rect x="62" y="60" width="8" height="8" fill="#1f2937" />
                      <rect x="76" y="74" width="14" height="14" fill="#047857" />
                    </svg>
                  </div>
                  <p className="text-xs font-mono font-bold text-stone-800">VPA: agrisethu.escrow@icici</p>
                  <p className="text-2xs text-stone-500 mt-0.5">Scan via Google Pay, PhonePe, Paytm, or BHIM</p>
                </div>
              )}

              {/* Net Banking Tab */}
              {method === 'NET_BANKING' && (
                <div className="space-y-2 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-stone-700">Select Bank:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map(bank => (
                      <label key={bank} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200 cursor-pointer">
                        <input type="radio" name="bank" defaultChecked={bank.includes('State Bank')} className="accent-emerald-600" />
                        <span className="font-semibold text-stone-800">{bank}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {method === 'CARD' && (
                <div className="space-y-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                  <div>
                    <label className="block text-2xs font-bold text-stone-600 mb-1">Card Number</label>
                    <input type="text" readOnly value="4532 •••• •••• 8812" className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-2xs font-bold text-stone-600 mb-1">Expiry</label>
                      <input type="text" readOnly value="12 / 28" className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-xs" />
                    </div>
                    <div>
                      <label className="block text-2xs font-bold text-stone-600 mb-1">CVV</label>
                      <input type="password" readOnly value="•••" className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-xs" />
                    </div>
                  </div>
                </div>
              )}

              {/* Trust Badge */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-2xs text-emerald-900 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Simulated Escrow Sandbox: Instant authorization with zero deduction from bank accounts.</span>
              </div>

              {/* Submit Payment Action */}
              <button
                disabled={processing}
                onClick={handlePay}
                className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {processing ? 'Authorizing Sandbox Escrow...' : `Authorize Demo Payment (₹${order.buyerTotalPayable?.toLocaleString('en-IN')})`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Payment Success Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-stone-900">Payment Secured in Escrow!</h4>
                <p className="text-xs text-stone-600 mt-1">Receipt #{receipt?.receiptNumber || 'RCP-2026'}</p>
                <p className="text-xs font-mono text-emerald-700 font-bold mt-0.5">Bank Ref: {receipt?.bankReferenceNumber}</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Order ID:</span>
                  <span className="font-bold text-stone-900">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Amount Secured:</span>
                  <span className="font-bold text-emerald-700">₹{order.buyerTotalPayable?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Escrow State:</span>
                  <span className="font-bold text-stone-900">FUNDS_HELD_IN_ESCROW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Farmer Take-Home:</span>
                  <span className="font-bold text-emerald-800">₹{order.farmerNetReturn?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-2xs text-stone-400">Redirecting to live shipment and logistics tracking...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
