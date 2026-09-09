import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuthPage({ defaultRole = 'farmer', defaultMode = 'login', onBackToHome }) {
  const { login, register, demoLogin, t } = useAuth();
  const [mode, setMode] = useState(defaultMode); // 'login' | 'register'
  const [role, setRole] = useState(defaultRole); // 'farmer' | 'buyer'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [identifier, setIdentifier] = useState(role === 'farmer' ? 'ramesh@agrisethu.in' : 'kiran@freshfoods.in');
  const [password, setPassword] = useState(role === 'farmer' ? 'farmer123' : 'buyer123');
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Farmer registration fields
  const [fName, setFName] = useState('');
  const [fMobile, setFMobile] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fVillage, setFVillage] = useState('Kothur');
  const [fDistrict, setFDistrict] = useState('Warangal');
  const [fState, setFState] = useState('Telangana');
  const [fFarmSize, setFFarmSize] = useState('12');
  const [fCrops, setFCrops] = useState('Tomato, Chilli, Cotton');
  const [fPassword, setFPassword] = useState('');

  // Buyer registration fields
  const [bName, setBName] = useState('');
  const [bBusinessName, setBBusinessName] = useState('');
  const [bBusinessType, setBBusinessType] = useState('Food Processing');
  const [bMobile, setBMobile] = useState('');
  const [bEmail, setBEmail] = useState('');
  const [bLocation, setBLocation] = useState('Hyderabad');
  const [bRequiredCrops, setBRequiredCrops] = useState('Tomato, Onion');
  const [bTargetQty, setBTargetQty] = useState('100');
  const [bPassword, setBPassword] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'farmer') {
      setIdentifier('ramesh@agrisethu.in');
      setPassword('farmer123');
    } else {
      setIdentifier('kiran@freshfoods.in');
      setPassword('buyer123');
    }
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (useOtp) {
        if (!otpSent) {
          setOtpSent(true);
          setLoading(false);
          return;
        }
        if (otpCode !== '2026' && otpCode !== '1234') {
          throw new Error('Invalid OTP. Use demo code 2026 or 1234');
        }
      }
      await login(identifier, password, role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let payload = { role };
      if (role === 'farmer') {
        payload = {
          role: 'farmer',
          name: fName,
          mobile: fMobile,
          email: fEmail,
          password: fPassword,
          village: fVillage,
          district: fDistrict,
          state: fState,
          farmSizeAcres: fFarmSize,
          cropsGrown: fCrops
        };
      } else {
        payload = {
          role: 'buyer',
          name: bName,
          businessName: bBusinessName,
          businessType: bBusinessType,
          mobile: bMobile,
          email: bEmail,
          password: bPassword,
          location: bLocation,
          requiredCrops: bRequiredCrops,
          targetMonthlyProcurementQuintals: bTargetQty
        };
      }
      await register(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* 1-Click Quick Demo Login Banner */}
      <div className="max-w-md mx-auto w-full mb-4 px-4">
        <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-2xs font-bold uppercase tracking-wider text-stone-300">SIH Quick Demo:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => demoLogin('farmer')}
              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer"
            >
              🌾 Demo Farmer
            </button>
            <button
              onClick={() => demoLogin('buyer')}
              className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              🛒 Demo Buyer
            </button>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div
          onClick={onBackToHome}
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-green-600 text-white shadow-lg shadow-emerald-800/20 mb-3 cursor-pointer"
        >
          <Sprout className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-black text-stone-950 tracking-tight">AGRI SETHU</h2>
        <p className="text-xs text-stone-500 font-semibold mt-0.5">From Farm to Fair Price</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl border border-stone-200 sm:px-10 space-y-6">
          {/* Account Type Selector: [ 🌾 Farmer ] [ 🛒 Buyer ] */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-2 text-center">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-2xl">
              <button
                type="button"
                onClick={() => handleRoleChange('farmer')}
                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'farmer'
                    ? 'bg-white text-emerald-800 shadow-sm border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🌾</span>
                <span>Farmer</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('buyer')}
                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'buyer'
                    ? 'bg-white text-blue-800 shadow-sm border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🛒</span>
                <span>Buyer</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher: Sign In vs Create Account */}
          <div className="flex border-b border-stone-200 text-xs font-bold text-center">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 pb-2.5 border-b-2 cursor-pointer ${
                mode === 'login'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 pb-2.5 border-b-2 cursor-pointer ${
                mode === 'register'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Mobile Number or Email</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  placeholder="e.g. 9848012345 or ramesh@agrisethu.in"
                  required
                />
              </div>

              {!useOtp ? (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-stone-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setUseOtp(true)}
                      className="text-2xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Login with OTP instead
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    required
                  />
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-stone-700">Enter OTP (Demo: 2026)</label>
                    <button
                      type="button"
                      onClick={() => setUseOtp(false)}
                      className="text-2xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Use Password
                    </button>
                  </div>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-center tracking-widest text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    placeholder="Enter 4-digit code"
                  />
                  {otpSent && (
                    <p className="text-3xs text-emerald-700 font-semibold mt-1">
                      ✓ Demo OTP sent to {identifier}. Enter 2026 to sign in.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : (useOtp && !otpSent ? 'Send OTP' : `Sign In as ${role === 'farmer' ? 'Farmer' : 'Buyer'}`)}
              </button>
            </form>
          )}

          {/* Registration Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              {role === 'farmer' ? (
                /* Farmer Specific Registration Fields */
                <>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fName}
                      onChange={(e) => setFName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={fMobile}
                        onChange={(e) => setFMobile(e.target.value)}
                        placeholder="9848012345"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Email (Optional)</label>
                      <input
                        type="email"
                        value={fEmail}
                        onChange={(e) => setFEmail(e.target.value)}
                        placeholder="farmer@domain.com"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Village</label>
                      <input
                        type="text"
                        value={fVillage}
                        onChange={(e) => setFVillage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">District</label>
                      <input
                        type="text"
                        value={fDistrict}
                        onChange={(e) => setFDistrict(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Farm (Acres)</label>
                      <input
                        type="number"
                        value={fFarmSize}
                        onChange={(e) => setFFarmSize(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Primary Crops Grown</label>
                    <input
                      type="text"
                      value={fCrops}
                      onChange={(e) => setFCrops(e.target.value)}
                      placeholder="e.g. Tomato, Chilli, Cotton"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Create Password</label>
                    <input
                      type="password"
                      value={fPassword}
                      onChange={(e) => setFPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                      required
                    />
                  </div>
                </>
              ) : (
                /* Buyer Specific Registration Fields */
                <>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Company / Business Name</label>
                    <input
                      type="text"
                      value={bBusinessName}
                      onChange={(e) => setBBusinessName(e.target.value)}
                      placeholder="e.g. Fresh Foods Processing Ltd"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={bName}
                        onChange={(e) => setBName(e.target.value)}
                        placeholder="Kiran Reddy"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Business Type</label>
                      <select
                        value={bBusinessType}
                        onChange={(e) => setBBusinessType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium bg-white"
                      >
                        <option value="Food Processing">Food Processing</option>
                        <option value="Retail Supermarket">Retail Supermarket</option>
                        <option value="Wholesale Exporter">Wholesale Exporter</option>
                        <option value="FPO / Aggregator">FPO / Aggregator</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={bMobile}
                        onChange={(e) => setBMobile(e.target.value)}
                        placeholder="9849056789"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Work Email</label>
                      <input
                        type="email"
                        value={bEmail}
                        onChange={(e) => setBEmail(e.target.value)}
                        placeholder="procurement@freshfoods.in"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Hub Location</label>
                      <input
                        type="text"
                        value={bLocation}
                        onChange={(e) => setBLocation(e.target.value)}
                        placeholder="Hyderabad"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Monthly Need (Qtl)</label>
                      <input
                        type="number"
                        value={bTargetQty}
                        onChange={(e) => setBTargetQty(e.target.value)}
                        placeholder="200"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Required Crops</label>
                    <input
                      type="text"
                      value={bRequiredCrops}
                      onChange={(e) => setBRequiredCrops(e.target.value)}
                      placeholder="e.g. Tomato, Chilli, Onion"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Create Password</label>
                    <input
                      type="password"
                      value={bPassword}
                      onChange={(e) => setBPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : `Register as ${role === 'farmer' ? 'Farmer' : 'Buyer'}`}
              </button>
            </form>
          )}

          {/* Escrow Assurance */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-2xs text-stone-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Encrypted credentials with role-based routing and guaranteed escrow security.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
